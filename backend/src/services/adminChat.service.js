import axios from 'axios'
import { env } from '~/config/environment'
import { conversationModel } from '~/models/conversation.model'
import Product from '~/models/productModel'
import Order from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { aiHelper } from '~/utils/aiHelper'

/**
 * Lấy context dữ liệu kinh doanh để inject vào admin system prompt.
 */
const getAdminContext = async () => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [totalProducts, todayOrders, revenueResult, topProductsResult, allProducts] = await Promise.all([
    Product.countDocuments({ isDeleted: { $ne: true } }),
    Order.find({ createdAt: { $gte: startOfToday } }).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: '$productInfo.name',
          price: '$productInfo.price',
          sold: '$totalSold',
          images: '$productInfo.images'
        }
      }
    ]),
    Product.find({ isDeleted: { $ne: true } }).select('name price variants images').lean()
  ])

  const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0)
  
  // Logic mới: Lọc chi tiết theo từng variant (Size/Color)
  const lowStockVariants = []
  allProducts.forEach(p => {
    (p.variants || []).forEach(v => {
      if ((v.stock || 0) < 5) {
        lowStockVariants.push({
          sp: p.name,
          mau: v.color,
          size: v.size,
          ton: v.stock
        })
      }
    })
  })

  return JSON.stringify({
    thoiGianTruyVan: new Date().toLocaleString('vi-VN'),
    tongSanPham: totalProducts,
    donHangHomNay: { tong: todayOrders.length, doanhThuHomNay: todayRevenue },
    doanhThu7Ngay: revenueResult,
    top5BanChay7NgayQua: topProductsResult,
    sanPhamSapHetHangTheoSize: lowStockVariants.slice(0, 15),
    donChoXuLy: todayOrders.filter(o => o.status === 'pending').length
  }, null, 2)
}

const parseAdminAIResponse = (responseText) => {
  let reply = responseText
  let actionCard = null
  let quickReplies = []

  const extractTags = (text, regex) => {
    const results = []
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(text)) !== null) {
      try {
        let content = match[1].trim()
        // Nếu là phím tắt và không phải JSON (thiếu []), tự convert sang mảng
        if (regex.source.includes('QUICK_REPLIES') && !content.startsWith('[')) {
          const items = content.split(',').map(i => i.replace(/["'\[\]]/g, '').trim()).filter(Boolean)
          results.push(items)
        } else {
          // Bóc tách JSON chuẩn
          const firstIdx = content.search(/[{[]/)
          const lastIdx = Math.max(content.lastIndexOf('}'), content.lastIndexOf(']'))
          if (firstIdx !== -1 && lastIdx !== -1) {
            content = content.substring(firstIdx, lastIdx + 1)
          }
          results.push(JSON.parse(content))
        }
      } catch (e) { /* skip */ }
    }
    return results
  }

  // Quét các thẻ có comment (Định dạng chuẩn)
  const actionRegex = /<!--\s*ACTION_CARD::([\s\S]*?)\s*-->/gi
  const qrRegex = /<!--\s*QUICK_REPLIES::([\s\S]*?)\s*-->/gi
  
  const actions = extractTags(responseText, actionRegex)
  if (actions.length > 0) actionCard = actions[0]
  
  const allReplies = extractTags(responseText, qrRegex)
  allReplies.forEach(arr => {
    if (Array.isArray(arr)) quickReplies.push(...arr)
    else quickReplies.push(arr)
  })

  // Nếu vẫn chưa có gì, quét dự phòng các thẻ không có comment (Định dạng lỗi của AI)
  if (!actionCard) {
    const fallbackActionRegex = /ACTION_CARD::({[\s\S]*?})/gi
    const fallbackActions = extractTags(responseText, fallbackActionRegex)
    if (fallbackActions.length > 0) actionCard = fallbackActions[0]
  }
  if (quickReplies.length === 0) {
    const fallbackQrRegex = /QUICK_REPLIES::(\[[\s\S]*?\])/gi
    const fallbackReplies = extractTags(responseText, fallbackQrRegex)
    fallbackReplies.forEach(arr => {
      if (Array.isArray(arr)) quickReplies.push(...arr)
      else quickReplies.push(arr)
    })
  }

  // Xóa sạch mọi dấu vết của thẻ kỹ thuật khỏi nội dung hiển thị
  reply = reply.replace(/<!--\s*ACTION_CARD::[\s\S]*?\s*-->/gi, '')
  reply = reply.replace(/<!--\s*QUICK_REPLIES::[\s\S]*?\s*-->/gi, '')
  reply = reply.replace(/ACTION_CARD::[\s\S]*?(\n|$)/gi, '')
  reply = reply.replace(/QUICK_REPLIES::[\s\S]*?(\n|$)/gi, '')
  reply = reply.trim()
  reply = reply.trim()

  // Cơ chế dự phòng nếu AI chỉ trả về thẻ mà quên viết văn bản
  if (!reply) {
    if (actionCard) reply = 'Tôi đã chuẩn bị thao tác bạn yêu cầu bên dưới.'
    else if (quickReplies.length > 0) reply = 'Tôi có một vài gợi ý cho bạn:'
    else reply = 'Tôi đã thực hiện yêu cầu của bạn.'
  }

  return { reply, actionCard, quickReplies }
}

/**
 * Gửi message từ admin đến AI và nhận response.
 */
const sendAdminMessage = async ({ adminId, message, history = [], conversationId = null }) => {
  if (!adminId || !message) throw new ApiError(StatusCodes.BAD_REQUEST, 'adminId và message là bắt buộc.')

  const adminContext = await getAdminContext()
  const systemPrompt = `Bạn là Giám đốc kinh doanh (CEO) tài ba của Woman Basic.
Dữ liệu thực tế hiện tại (tính đến ${new Date().toLocaleString('vi-VN')}): ${adminContext}

HƯỚNG DẪN TƯ DUY:
- Dựa trên dữ liệu doanh thu, tồn kho (chi tiết theo Size/Màu), đơn hàng, hãy đưa ra các nhận xét sắc sảo.
- Nếu doanh thu bằng 0, phải nhận định là vấn đề nghiêm trọng và đề xuất giải pháp ngay.
- Khi báo cáo hàng sắp hết, hãy liệt kê cụ thể Tên sản phẩm - Màu - Size và số lượng tồn để admin có kế hoạch nhập hàng chính xác.

QUY TẮC KỸ THUẬT:
- LUÔN LUÔN trả lời bằng văn bản tiếng Việt trước khi đưa ra các thẻ kỹ thuật.
- CHỈ hiển thị ACTION_CARD khi admin có yêu cầu trực tiếp về việc THÊM, SỬA, XÓA hoặc QUẢN LÝ danh sách thực thể: <!--ACTION_CARD::{"entity":"product"|"account"|"category"|"order"}-->.
- TUYỆT ĐỐI KHÔNG hiển thị ACTION_CARD nếu admin chỉ đang hỏi thông tin, yêu cầu phân tích, nhận xét kinh doanh hoặc trò chuyện bình thường. Trong trường hợp này, CHỈ sử dụng QUICK_REPLIES.
- Nếu đã có ACTION_CARD thì KHÔNG ĐƯỢC trả về QUICK_REPLIES.
- Gợi ý phím tắt (chỉ khi KHÔNG có ACTION_CARD): <!--QUICK_REPLIES::["Nhận xét kinh doanh tuần này", "Sản phẩm sắp hết hàng"]-->`

  const messages = [{ role: 'system', content: systemPrompt }, ...history.slice(-10).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }]

  const aiResponseText = await aiHelper.callGroqAI({ contextName: 'AdminChat', messages })
  const parsed = parseAdminAIResponse(aiResponseText)

  // Lưu lịch sử
  let finalConversationId = conversationId
  try {
    const conversation = await conversationModel.findOrCreateAdminConversation(adminId, conversationId)
    finalConversationId = conversation._id

    // Nếu là tin nhắn đầu tiên (chưa có title hoặc title mặc định), cập nhật title dựa trên tin nhắn
    if (conversation.messages.length === 0 || conversation.title === 'Cuộc trò chuyện mới') {
      const newTitle = message.length > 40 ? message.substring(0, 37) + '...' : message
      await conversationModel.updateTitle(conversation._id, newTitle)
    }

    await conversationModel.pushMessage(conversation._id, { role: 'user', content: message })
    await conversationModel.pushMessage(conversation._id, {
      role: 'assistant',
      content: parsed.reply,
      metadata: {
        actionCard: parsed.actionCard,
        quickReplies: parsed.quickReplies
      }
    })
  } catch (e) {
    console.error('[AdminChat] DB Error:', e.message)
  }

  return { ...parsed, conversationId: finalConversationId }
}

export const adminChatService = { getAdminContext, sendAdminMessage }
