import axios from 'axios'
import { env } from '~/config/environment'
import { conversationModel } from '~/models/conversation.model'
import Product from '~/models/productModel'
import Order from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { aiHelper } from '~/utils/aiHelper'
import { getCategoryInsights } from '~/services/recommendation.service.js'
import WeeklyInsight from '~/models/weeklyInsight.model.js'

/**
 * Lấy context dữ liệu kinh doanh để inject vào admin system prompt.
 */
const getAdminContext = async () => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [totalProducts, todayOrders, revenueResult, topProductsResult, allProducts, catInsights, latestWeekly, totalPendingOrders] = await Promise.all([
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
    Product.find({ isDeleted: { $ne: true } }).select('name price variants images').lean(),
    getCategoryInsights().catch(() => []),
    WeeklyInsight.findOne().sort({ createdAt: -1 }).select('report weekStart weekEnd').lean().catch(() => null),
    Order.countDocuments({ status: 'pending' })  // Đếm TẤT CẢ đơn pending, không giới hạn ngày
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
    donChoXuLy: totalPendingOrders,  // Tổng đơn pending toàn hệ thống (mọi ngày)
    categoryInsights: catInsights,
    latestWeeklyReport: latestWeekly
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
const sendAdminMessage = async ({ adminId, role = 'admin', message, history = [], conversationId = null }) => {
  if (!adminId || !message) throw new ApiError(StatusCodes.BAD_REQUEST, 'adminId và message là bắt buộc.')

  const adminContext = await getAdminContext()

  let roleDirective = ''
  if (role === 'employee') {
    roleDirective = `
LƯU Ý QUAN TRỌNG VỀ PHÂN QUYỀN TÀI KHOẢN (BẠN ĐANG TRÒ CHUYỆN VỚI NHÂN VIÊN):
- Người dùng hiện tại là "Nhân viên" (role: employee), KHÔNG phải "Quản trị viên" (role: admin).
- Bạn ĐƯỢC PHÉP trả lời, phân tích hoặc hỗ trợ các câu hỏi liên quan đến: Sản phẩm (product), Danh mục (category), Đơn hàng (order), Đánh giá/Nhận xét (rating), và Doanh thu / Báo cáo bán hàng (revenue/sales).
- Đối với BẤT KỲ câu hỏi hoặc yêu cầu nào liên quan đến: Khuyến mãi (promotion), Quản lý tài khoản/nhân viên (account), hoặc cấu hình hệ thống khác, bạn TUYỆT ĐỐI KHÔNG ĐƯỢC tiết lộ thông tin hoặc trả lời chi tiết. Thay vào đó, bạn PHẢI từ chối và trả lời đúng nguyên văn câu sau: "Tài khoản của bạn không đủ thẩm quyền để truy cập thông tin này." và không được hiển thị bất kỳ ACTION_CARD nào của các phần bị cấm này.
`
  }

  const systemPrompt = `Bạn là Giám đốc kinh doanh (CEO) tài ba của Woman Basic.
Dữ liệu thực tế hiện tại (tính đến ${new Date().toLocaleString('vi-VN')}): ${adminContext}
${roleDirective}

LƯU Ý CỰC KỲ QUAN TRỌNG VỀ TÍNH CẬP NHẬT CỦA DỮ LIỆU:
- Lịch sử chat (history) chỉ dùng để duy trì ngữ cảnh đối thoại (mạch trò chuyện, từ ngữ xưng hô).
- TUYỆT ĐỐI KHÔNG sử dụng lại các con số, số liệu thống kê, doanh thu, đơn hàng, hay tồn kho đã trả lời ở các lượt chat cũ trong lịch sử chat để trả lời cho câu hỏi mới nhất của người dùng.
- Với MỖI lượt hỏi mới, bạn BẮT BUỘC phải trích xuất, tính toán và phân tích số liệu dựa trên "Dữ liệu thực tế hiện tại" mới nhất được cung cấp ở trên (không dùng lại số liệu cũ từ lịch sử trò chuyện). Hãy luôn đảm bảo con số bạn đưa ra là chính xác so với dữ liệu thời gian thực được inject ở trên.

TUYỆT ĐỐI NGHIÊM NGẶT - GIỚI HẠN PHẠM VI TRẢ LỜI:
- BẠN CHỈ ĐƯỢC PHÉP TRẢ LỜI các câu hỏi liên quan đến nghiệp vụ bán hàng, báo cáo doanh thu, tồn kho, quản lý sản phẩm, đơn hàng, khách hàng, khuyến mãi, nhận xét, hoặc vận hành hệ thống của project Woman Basic.
- ĐỐI VỚI BẤT KỲ CÂU HỎI NÀO KHÔNG LIÊN QUAN ĐẾN DỰ ÁN HOẶC NGHIỆP VỤ BÁN HÀNG (Ví dụ: thời tiết, toán học, địa lý, lịch sử, lập trình tổng quát, thơ ca, đố vui, chuyện phiếm bên ngoài...), bạn phải lịch sự từ chối trả lời bằng một câu ngắn gọn như: "Tôi là trợ lý AI chuyên trách quản trị và kinh doanh của Woman Basic. Tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến hoạt động bán hàng và quản trị của dự án." và tuyệt đối không trả lời gì thêm.

HƯỚNG DẪN TƯ DUY:
- Dựa trên dữ liệu doanh thu, tồn kho (chi tiết theo Size/Màu), đơn hàng, hãy đưa ra các nhận xét sắc sảo.
- Nếu doanh thu bằng 0, phải nhận định là vấn đề nghiêm trọng và đề xuất giải pháp ngay.
- Khi báo cáo hàng sắp hết, hãy liệt kê cụ thể Tên sản phẩm - Màu - Size và số lượng tồn để admin có kế hoạch nhập hàng chính xác.
- Khi admin hỏi về sản phẩm được ưa chuộng, xu hướng, hoặc insight kinh doanh — ưu tiên dùng dữ liệu categoryInsights và latestWeeklyReport để trả lời với số liệu cụ thể (viewCount, addToCartCount, purchaseCount, totalScore).

QUY TẮC KỸ THUẬT VÀ GIAO DIỆN MINI (ACTION_CARD):
- LUÔN LUÔN trả lời bằng văn bản tiếng Việt trước khi đưa ra các thẻ kỹ thuật.
- Khi admin yêu cầu trực tiếp về việc THÊM, SỬA, XÓA, hoặc QUẢN LÝ danh sách thực thể, hãy trả về thẻ ACTION_CARD tương ứng:
  + Sản phẩm (product): <!--ACTION_CARD::{"entity":"product"}-->
  + Danh mục (category): <!--ACTION_CARD::{"entity":"category"}-->
  + Tài khoản / Nhân viên (account): <!--ACTION_CARD::{"entity":"account"}-->
  + Khuyến mãi (promotion): <!--ACTION_CARD::{"entity":"promotion"}-->
  + Đánh giá/Nhận xét (rating): <!--ACTION_CARD::{"entity":"rating"}-->
- TUYỆT ĐỐI NGHIÊM CẤM hiển thị ACTION_CARD đối với:
  + Đơn hàng (order)
  + Khách hàng (Khi admin hỏi cụ thể về "Khách hàng", "Chỉnh sửa khách hàng" hoặc "Thêm khách hàng", không dùng ACTION_CARD mà chỉ hướng dẫn bằng văn bản đi tới trang quản lý khách hàng).
  Thay vào đó, đối với Đơn hàng và Khách hàng, bạn PHẢI chỉ dẫn admin thao tác thủ công qua văn bản bằng cách điều hướng đến tab/trang quản lý tương ứng trên Dashboard (ví dụ: "Quản lý đơn hàng" hoặc "Quản lý khách hàng").
- TUYỆT ĐỐI KHÔNG hiển thị ACTION_CARD nếu admin chỉ đang hỏi thông tin chung, yêu cầu phân tích kinh doanh, nhận xét tình hình hoặc trò chuyện bình thường. Trong trường hợp đó, CHỈ sử dụng QUICK_REPLIES.
- Nếu đã có ACTION_CARD thì KHÔNG ĐƯỢC trả về QUICK_REPLIES.
- Gợi ý phím tắt (chỉ khi KHÔNG có ACTION_CARD): <!--QUICK_REPLIES::["Danh mục được xem nhiều nhất", "Nhận xét kinh doanh tuần này", "Sản phẩm sắp hết hàng"]-->`

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
