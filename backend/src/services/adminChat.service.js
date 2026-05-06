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

  const [totalProducts, todayOrders, revenueResult, topProducts, allProducts] = await Promise.all([
    Product.countDocuments({ isDeleted: { $ne: true } }),
    Order.find({ createdAt: { $gte: startOfToday } }).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Product.find({ isDeleted: { $ne: true } }).sort({ sold: -1 }).limit(5).select('name price sold images').lean(),
    Product.find({ isDeleted: { $ne: true } }).select('name price variants images').lean()
  ])

  const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0)
  const lowStockProducts = allProducts.filter(p => (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0) < 5)

  return JSON.stringify({
    tongSanPham: totalProducts,
    donHangHomNay: { tong: todayOrders.length, doanhThuHomNay: todayRevenue },
    doanhThu7Ngay: revenueResult,
    top5BanChay: topProducts,
    sanPhamSapHetHang: lowStockProducts.length,
    donChoXuLy: todayOrders.filter(o => o.status === 'pending').length
  }, null, 2)
}

const parseAdminAIResponse = (responseText) => {
  let reply = responseText
  let actionCard = null
  let quickReplies = []

  const actionMatch = responseText.match(/<!--ACTION_CARD::([\s\S]*?)-->/)
  if (actionMatch) {
    try { actionCard = JSON.parse(actionMatch[1]) } catch { actionCard = null }
    reply = reply.replace(actionMatch[0], '').trim()
  }

  const quickRepliesMatch = responseText.match(/<!--QUICK_REPLIES::([\s\S]*?)-->/)
  if (quickRepliesMatch) {
    try { quickReplies = JSON.parse(quickRepliesMatch[1]) } catch { quickReplies = [] }
    reply = reply.replace(quickRepliesMatch[0], '').trim()
  }

  return { reply, actionCard, quickReplies }
}

/**
 * Gửi message từ admin đến AI và nhận response.
 */
const sendAdminMessage = async ({ adminId, message, history = [] }) => {
  if (!adminId || !message) throw new ApiError(StatusCodes.BAD_REQUEST, 'adminId và message là bắt buộc.')

  const adminContext = await getAdminContext()
  const systemPrompt = `Bạn là AI Admin Copilot của Woman Basic.
Dữ liệu hiện tại: ${adminContext}
- Trả lời câu hỏi về kinh doanh.
- Trả về ACTION_CARD khi admin yêu cầu thao tác dữ liệu: <!--ACTION_CARD::{"type":"delete"|"edit","entity":"product"|"order","data":{...}}-->
- Gợi ý phím tắt: <!--QUICK_REPLIES::[...]-->`

  const messages = [{ role: 'system', content: systemPrompt }, ...history.slice(-10).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }]

  const aiResponseText = await aiHelper.callGroqAI({ contextName: 'AdminChat', messages })
  const parsed = parseAdminAIResponse(aiResponseText)

  // Lưu lịch sử
  try {
    const conversation = await conversationModel.findOrCreateAdminConversation(adminId)
    await conversationModel.pushMessage(conversation._id, { role: 'user', content: message })
    await conversationModel.pushMessage(conversation._id, { role: 'assistant', content: aiResponseText, metadata: { payload: parsed.actionCard } })
  } catch (e) { console.error('[AdminChat] DB Error:', e.message) }

  return parsed
}

export const adminChatService = { getAdminContext, sendAdminMessage }
