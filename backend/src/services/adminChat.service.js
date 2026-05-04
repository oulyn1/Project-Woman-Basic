import axios from 'axios'
import { env } from '~/config/environment'
import { conversationModel } from '~/models/conversation.model'
import Product from '~/models/productModel'
import Order from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

/**
 * Lấy context dữ liệu kinh doanh để inject vào admin system prompt.
 * Bao gồm: tổng SP, đơn hàng hôm nay, doanh thu 7 ngày, top 5 bán chạy, SP sắp hết hàng.
 */
const getAdminContext = async () => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Song song hóa tất cả queries để tăng tốc
  const [
    totalProducts,
    todayOrders,
    revenueResult,
    topProducts,
    allProducts
  ] = await Promise.all([
    // Tổng sản phẩm đang bán
    Product.countDocuments({ isDeleted: { $ne: true } }),

    // Đơn hàng hôm nay
    Order.find({ createdAt: { $gte: startOfToday } }).lean(),

    // Doanh thu 7 ngày gần nhất (aggregate theo ngày)
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Top 5 sản phẩm bán chạy
    Product.find({ isDeleted: { $ne: true } })
      .sort({ sold: -1 })
      .limit(5)
      .select('name price sold images')
      .lean(),

    // Tất cả sản phẩm (để check stock)
    Product.find({ isDeleted: { $ne: true } })
      .select('name price variants images')
      .lean()
  ])

  // Tính tổng doanh thu 7 ngày
  const totalRevenue7Days = revenueResult.reduce((sum, day) => sum + day.revenue, 0)

  // Tính doanh thu hôm nay
  const todayRevenue = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  // Đếm đơn hàng theo trạng thái hôm nay
  const todayOrdersByStatus = todayOrders.reduce((acc, o) => {
    const s = o.status || 'unknown'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  // Sản phẩm sắp hết hàng (có variant nào stock < 5)
  const lowStockProducts = allProducts.filter(p => {
    const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
    return totalStock < 5 && totalStock >= 0
  }).map(p => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    totalStock: (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0),
    image: p.images?.[0] || ''
  }))

  // Đơn hàng pending (chờ xử lý)
  const pendingOrders = todayOrders.filter(o => o.status === 'pending')

  const context = {
    tongSanPham: totalProducts,
    donHangHomNay: {
      tong: todayOrders.length,
      theoTrangThai: todayOrdersByStatus,
      doanhThuHomNay: todayRevenue
    },
    doanhThu7Ngay: {
      tong: totalRevenue7Days,
      chiTiet: revenueResult.map(r => ({
        ngay: r._id,
        doanhThu: r.revenue,
        soDon: r.count
      }))
    },
    top5BanChay: topProducts.map(p => ({
      _id: p._id.toString(),
      ten: p.name,
      gia: p.price,
      daBan: p.sold,
      image: p.images?.[0] || ''
    })),
    sanPhamSapHetHang: lowStockProducts,
    donChoXuLy: pendingOrders.length
  }

  return JSON.stringify(context, null, 2)
}

/**
 * Parse special tags từ admin AI response.
 * Trích xuất <!--ACTION_CARD::...-->, <!--QUICK_REPLIES::...--> từ message.
 */
const parseAdminAIResponse = (responseText) => {
  let reply = responseText
  let actionCard = null
  let quickReplies = []

  // Parse ACTION_CARD tag
  const actionMatch = responseText.match(/<!--ACTION_CARD::([\s\S]*?)-->/)
  if (actionMatch) {
    try {
      actionCard = JSON.parse(actionMatch[1])
    } catch {
      actionCard = null
    }
    reply = reply.replace(actionMatch[0], '').trim()
  }

  // Parse QUICK_REPLIES tag
  const quickRepliesMatch = responseText.match(/<!--QUICK_REPLIES::([\s\S]*?)-->/)
  if (quickRepliesMatch) {
    try {
      quickReplies = JSON.parse(quickRepliesMatch[1])
    } catch {
      quickReplies = []
    }
    reply = reply.replace(quickRepliesMatch[0], '').trim()
  }

  return { reply, actionCard, quickReplies }
}

/**
 * Gửi message từ admin đến AI và nhận response.
 * @param {{ adminId: string, message: string, history: Array }} params
 * @returns {{ reply: string, actionCard: Object|null, quickReplies: Array }}
 */
const sendAdminMessage = async ({ adminId, message, history = [] }) => {
  const groqKey = env.GROQ_API_KEY
  if (!groqKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Thiếu cấu hình GROQ_API_KEY. Vui lòng liên hệ quản trị viên.'
    )
  }

  if (!adminId || !message) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'adminId và message là bắt buộc.'
    )
  }

  // 1. Lấy admin context (business data)
  const adminContext = await getAdminContext()

  // 2. Build system prompt (giữ nguyên 100% nội dung yêu cầu)
  const systemPrompt = `Bạn là AI Admin Copilot của hệ thống quản trị Woman Basic — trợ lý thông minh giúp admin vận hành cửa hàng hiệu quả hơn.
Dữ liệu hệ thống hiện tại:
${adminContext}
Khả năng của bạn:

Truy vấn & phân tích: Trả lời câu hỏi về doanh thu, đơn hàng, sản phẩm, khách hàng dựa trên dữ liệu được cung cấp.
Phân tích kinh doanh: Nhận xét xu hướng, đề xuất hành động cụ thể, cảnh báo vấn đề (hết hàng, đơn tồn, v.v.).
Hỗ trợ thao tác dữ liệu: Khi admin yêu cầu sửa/xóa/thêm dữ liệu — KHÔNG tự thao tác — thay vào đó trả về action card theo định dạng đặc biệt để admin tự xác nhận.

Quy tắc tuyệt đối:

KHÔNG BAO GIỜ tự động thay đổi, xóa, hoặc thêm bất kỳ dữ liệu nào vào hệ thống.
Khi admin yêu cầu thao tác dữ liệu, luôn trả về action card và chờ admin xác nhận.
Chỉ làm việc trong phạm vi quản trị cửa hàng thời trang.

Định dạng Action Card (bắt buộc dùng khi admin yêu cầu thao tác dữ liệu):
<!--ACTION_CARD::{"type":"delete"|"edit","entity":"product"|"order"|"user","data":{...đầy đủ thông tin entity...},"confirmMessage":"Bạn có chắc muốn xóa sản phẩm [tên] không?"}-->
Ví dụ: Admin nói "xóa sản phẩm áo kaki trắng" → trả về text giải thích + ACTION_CARD với type="delete", entity="product", data={_id, name, price, image, stock}.
Phím tắt có sẵn (admin có thể dùng):

"Tóm tắt hôm nay" → tổng hợp đơn hàng, doanh thu, cảnh báo trong ngày
"Sản phẩm sắp hết hàng" → liệt kê sản phẩm stock < 5
"Doanh thu [khoảng thời gian]" → phân tích doanh thu theo period
"Đơn hàng chờ xử lý" → liệt kê và tóm tắt đơn đang pending
"Nhận xét kinh doanh tuần này" → phân tích và đề xuất hành động

Giọng văn: chuyên nghiệp, súc tích, dùng số liệu cụ thể, xưng "tôi" với admin.
Sau mỗi câu trả lời phân tích, gợi ý câu hỏi tiếp theo:
<!--QUICK_REPLIES::["Xem chi tiết đơn hàng pending","So sánh với tuần trước","Đề xuất hành động"]-->`

  // 3. Build messages array cho Groq API
  const messages = [
    { role: 'system', content: systemPrompt }
  ]

  // Thêm lịch sử hội thoại (giới hạn 10 messages gần nhất)
  const recentHistory = history.slice(-10)
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    })
  })

  // Thêm message hiện tại
  messages.push({ role: 'user', content: message })

  // 4. Gọi Groq API
  let aiResponseText = ''
  const MAX_RETRIES = 3

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const groqResponse = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      aiResponseText = groqResponse.data?.choices?.[0]?.message?.content || ''

      if (!aiResponseText) {
        throw new Error('Groq trả về nội dung rỗng')
      }

      break
    } catch (error) {
      const status = error.response?.status
      const isRetryable = status === 503 || status === 429 || status === 500

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`[AdminChat] Lỗi Groq API (Attempt ${attempt}/${MAX_RETRIES}). Thử lại sau ${attempt * 2}s...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        continue
      }

      const msg = error.response?.data?.error?.message || error.message
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        `Lỗi khi gọi AI: ${msg}`
      )
    }
  }

  // 5. Parse response
  const parsed = parseAdminAIResponse(aiResponseText)

  // 6. Lưu vào conversation collection
  try {
    const conversation = await conversationModel.findOrCreateAdminConversation(adminId)

    await conversationModel.pushMessage(conversation._id, {
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { actionType: 'query', payload: null }
    })

    await conversationModel.pushMessage(conversation._id, {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date(),
      metadata: {
        actionType: parsed.actionCard ? (parsed.actionCard.type === 'delete' ? 'suggest_delete' : 'suggest_edit') : 'query',
        payload: parsed.actionCard || null
      }
    })
  } catch (dbError) {
    console.error('[AdminChat] Lỗi lưu conversation:', dbError.message)
  }

  return {
    reply: parsed.reply,
    actionCard: parsed.actionCard,
    quickReplies: parsed.quickReplies
  }
}

export const adminChatService = {
  getAdminContext,
  sendAdminMessage
}
