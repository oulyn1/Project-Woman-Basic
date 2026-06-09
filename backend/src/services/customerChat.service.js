import axios from 'axios'
import { env } from '~/config/environment'
import Product from '~/models/productModel'
import Category from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { aiAnalyzeService } from '~/services/aiAnalyze.service'
import ChatCache from '~/models/chatCache.model'
import { aiHelper } from '~/utils/aiHelper'

/**
 * Lấy context sản phẩm để inject vào system prompt.
 */
const getProductContextData = async (userMessage = '') => {
  let products = []

  // 1. Ưu tiên tìm sản phẩm liên quan trực tiếp bằng Text Search của MongoDB
  if (userMessage) {
    products = await Product.find({
      isDeleted: { $ne: true },
      $text: { $search: userMessage }
    })
      .select('name price categoryId description tags images variants sizeChart sizeGuide')
      .limit(20)
      .lean()
  }

  // 2. Nếu tìm kiếm không đủ, lấy thêm các sản phẩm mới nhất
  const currentCount = products.length
  if (currentCount < 30) {
    const existingIds = products.map(p => p._id)
    const extraProducts = await Product.find({
      isDeleted: { $ne: true },
      _id: { $nin: existingIds }
    })
      .select('name price categoryId description tags images variants sizeChart sizeGuide')
      .sort({ createdAt: -1 })
      .limit(30 - currentCount)
      .lean()

    products = [...products, ...extraProducts]
  }

  // Lấy category names
  const categoryIds = [...new Set(products.map(p => p.categoryId?.toString()).filter(Boolean))]
  const categories = await Category.find({ _id: { $in: categoryIds } }).lean()
  const categoryMap = categories.reduce((acc, cat) => ({ ...acc, [cat._id.toString()]: cat.name }), {})

  return products.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    category: categoryMap[p.categoryId?.toString()] || 'Khác',
    description: p.description ? p.description.substring(0, 150) + '...' : '',
    tags: p.tags || [],
    stock: (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0),
    image: p.images?.[0] || '',
    sizeChart: p.sizeChart || '',
    sizeGuide: p.sizeGuide || ''
  }))
}

const normalizeQuestion = (q) => q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[?.!,]/g, '').replace(/\s+/g, ' ')

const parseAIResponse = (responseText) => {
  let reply = responseText
  let products = []
  let quickReplies = []

  // Helper để lấy tất cả các tag và parse JSON an toàn
  const extractTags = (text, regex) => {
    const results = []
    let match
    while ((match = regex.exec(text)) !== null) {
      try {
        const cleanedJson = match[1]
          .replace(/```(?:json)?/gi, '')
          .replace(/```/gi, '')
          .trim()

        // Thử parse JSON trực tiếp
        try {
          const parsed = JSON.parse(cleanedJson)
          if (Array.isArray(parsed)) {
            results.push(...parsed)
          } else {
            results.push(parsed)
          }
        } catch {
          // Fallback: AI trả markdown list ("- item") thay vì JSON array
          const lines = cleanedJson.split('\n')
            .map(l => l.replace(/^[\s*\-–•]+/, '').trim())
            .filter(Boolean)
          if (lines.length > 0) {
            results.push(...lines)
          } else {
            console.error('[AI Parser] JSON Error — không thể parse:', cleanedJson.substring(0, 80))
          }
        }
      } catch (e) {
        console.error('[AI Parser] Unexpected error:', e.message)
      }
    }
    return results
  }

  // 1. Xử lý PRODUCTS tag (dùng regex global để tìm tất cả và xóa sạch)
  const productsRegex = /<!--\s*PRODUCTS::([\s\S]*?)\s*-->/gi
  products = extractTags(responseText, productsRegex)
  reply = reply.replace(productsRegex, '')

  // 2. Xử lý QUICK_REPLIES tag
  const qrRegex = /<!--\s*QUICK_REPLIES::([\s\S]*?)\s*-->/gi
  quickReplies = extractTags(responseText, qrRegex)
  reply = reply.replace(qrRegex, '').trim()

  return { reply, products, quickReplies }
}

/**
 * Gửi message từ customer đến AI và nhận response.
 */
const sendCustomerMessage = async ({ sessionId, message }) => {
  if (!sessionId || !message) throw new ApiError(StatusCodes.BAD_REQUEST, 'sessionId và message là bắt buộc.')

  const normalizedMsg = normalizeQuestion(message)
  const cached = await ChatCache.findOne({ normalizedQuestion: normalizedMsg }).lean()
  if (cached && cached.answer) {
    return { reply: cached.answer, products: cached.products, quickReplies: cached.quickReplies, fromCache: true }
  }

  const products = await getProductContextData(message)

  // Xử lý bảng size nếu cần
  const sizingKeywords = ['size', 'kích cỡ', 'vừa không', 'nặng', 'cao', 'cm', 'kg', 'mặc số mấy', 'số đo']
  if (sizingKeywords.some(kw => message.toLowerCase().includes(kw))) {
    const relevantProducts = products.filter(p => p.sizeChart && !p.sizeGuide).slice(0, 3)
    for (const p of relevantProducts) {
      try {
        const imageRes = await axios.get(p.sizeChart, { responseType: 'arraybuffer' })
        const base64 = Buffer.from(imageRes.data, 'binary').toString('base64')
        const analysis = await aiAnalyzeService.analyzeSizeChartWithAI(base64)
        p.sizeGuide = analysis.sizeGuide
        await Product.findByIdAndUpdate(p._id, { sizeGuide: p.sizeGuide })
      } catch (e) { console.error('[Chat] Size analysis error:', e.message) }
    }
  }

  const systemPrompt = `Bạn là trợ lý AI của Woman Basic. Gợi ý sản phẩm và tư vấn size dựa trên dữ liệu:
${JSON.stringify(products, null, 2)}
- Dùng tiếng Việt, thân thiện.
- Nếu có sản phẩm phù hợp, hãy trả về danh sách sản phẩm dưới dạng JSON array trong tag <!--PRODUCTS::[...]-->.
- MỖI SẢN PHẨM TRONG JSON PHẢI CÓ ĐỦ CÁC TRƯỜNG: _id, name, price, image.
- Gợi ý câu hỏi tiếp theo qua tag <!--QUICK_REPLIES::["câu 1", "câu 2", "câu 3"]--> (BẮT BUỘC dùng JSON array với dấu ngoặc vuông và dấu nháy kép, KHÔNG dùng dấu gạch đầu dòng).`

  const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]

  const aiResponseText = await aiHelper.callGroqAI({ contextName: 'CustomerChat', messages })
  const parsed = parseAIResponse(aiResponseText)

  // Hậu xử lý để đảm bảo sản phẩm có đủ thông tin (tránh lỗi NaN hoặc thiếu ảnh ở frontend)
  if (parsed.products?.length > 0) {
    parsed.products = parsed.products.map(p => {
      const original = products.find(op => op._id === p._id)
      return {
        _id: p._id,
        name: p.name || original?.name || 'Sản phẩm',
        price: p.price ?? original?.price ?? 0,
        image: p.image || original?.image || ''
      }
    })
  }

  if (parsed.reply) {
    await ChatCache.findOneAndUpdate({ normalizedQuestion: normalizedMsg }, { ...parsed, normalizedQuestion: normalizedMsg, originalQuestion: message }, { upsert: true })
  }

  return parsed
}

export const customerChatService = { getProductContextData, sendCustomerMessage }
