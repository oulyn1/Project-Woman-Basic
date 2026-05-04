import axios from 'axios'
import { env } from '~/config/environment'
import Product from '~/models/productModel'
import Category from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { aiAnalyzeService } from '~/services/aiAnalyze.service'
import ChatCache from '~/models/chatCache.model'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

/**
 * Lấy context sản phẩm để inject vào system prompt.
 * Query tối đa 20 sản phẩm đang bán (isDeleted != true), populate category name.
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

  // 2. Nếu tìm kiếm không đủ hoặc không có search, lấy thêm các sản phẩm mới nhất
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

  // Lấy tất cả category ids để map tên
  const categoryIds = [...new Set(products.map(p => p.categoryId?.toString()).filter(Boolean))]
  const categories = await Category.find({ _id: { $in: categoryIds } }).lean()
  const categoryMap = {}
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = cat.name
  })

  // Rút gọn dữ liệu sản phẩm
  const contextProducts = products.map(p => {
    // Tính tổng stock từ variants
    const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)

    return {
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: categoryMap[p.categoryId?.toString()] || 'Khác',
      description: p.description ? p.description.substring(0, 150) + '...' : '',
      tags: p.tags || [],
      stock: totalStock,
      image: p.images?.[0] || '',
      sizeChart: p.sizeChart || '',
      sizeGuide: p.sizeGuide || ''
    }
  })

  return contextProducts
}

/**
 * Chuẩn hóa câu hỏi để tìm kiếm trong cache (lowercase, bỏ dấu, bỏ khoảng trắng thừa)
 */
const normalizeQuestion = (q) => {
  return q.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[?.!,]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Parse special tags từ AI response.
 * Trích xuất <!--PRODUCTS::...-->, <!--QUICK_REPLIES::...--> từ message.
 */
const parseAIResponse = (responseText) => {
  let reply = responseText
  let products = []
  let quickReplies = []

  // Parse PRODUCTS tag
  const productsMatch = responseText.match(/<!--PRODUCTS::([\s\S]*?)-->/)
  if (productsMatch) {
    try {
      products = JSON.parse(productsMatch[1])
    } catch {
      products = []
    }
    reply = reply.replace(productsMatch[0], '').trim()
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

  return { reply, products, quickReplies }
}

/**
 * Gửi message từ customer đến AI và nhận response.
 * @param {{ sessionId: string, message: string, history: Array }} params
 * @returns {{ reply: string, products: Array, quickReplies: Array }}
 */
const sendCustomerMessage = async ({ sessionId, message, history = [] }) => {
  const groqKey = env.GROQ_API_KEY
  if (!groqKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Thiếu cấu hình GROQ_API_KEY. Vui lòng liên hệ quản trị viên.'
    )
  }

  if (!sessionId || !message) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'sessionId và message là bắt buộc.'
    )
  }

  // 0. Kiểm tra cache trước khi làm bất cứ việc gì (Chỉ áp dụng cho câu hỏi đơn lẻ, không history)
  const normalizedMsg = normalizeQuestion(message)
  if (history.length === 0) {
    const cached = await ChatCache.findOne({ normalizedQuestion: normalizedMsg })
    // Chỉ lấy từ cache nếu câu trả lời có đủ thông tin (không bị lỗi hình ảnh/giá)
    if (cached && cached.answer && (!cached.products.length || cached.products.every(p => p.image))) {
      return {
        reply: cached.answer,
        products: cached.products,
        quickReplies: cached.quickReplies,
        fromCache: true
      }
    }
  }

  // 1. Lấy product context dựa trên nội dung tin nhắn của khách
  const products = await getProductContextData(message)

  // 1b. Nếu khách hỏi về size, tham khảo ảnh bảng size có sẵn
  const sizingKeywords = ['size', 'kích cỡ', 'vừa không', 'nặng', 'cao', 'cm', 'kg', 'mặc số mấy', 'số đo']
  const isAskingSize = sizingKeywords.some(kw => message.toLowerCase().includes(kw))

  if (isAskingSize) {
    // Chỉ phân tích tối đa 3 sản phẩm đầu tiên để tránh quá tải
    const relevantProducts = products.filter(p => p.sizeChart && !p.sizeGuide).slice(0, 3)
    for (const p of relevantProducts) {
      try {
        const imageRes = await axios.get(p.sizeChart, { responseType: 'arraybuffer' })
        const base64 = Buffer.from(imageRes.data, 'binary').toString('base64')
        const analysis = await aiAnalyzeService.analyzeSizeChartWithAI(base64)
        
        p.sizeGuide = analysis.sizeGuide
        // Lưu lại vào DB để lần sau không cần phân tích lại (Memoization)
        await Product.findByIdAndUpdate(p._id, { sizeGuide: p.sizeGuide })
      } catch (error) {
        console.error(`[Chat] Lỗi phân tích ảnh bảng size:`, error.message)
      }
    }
  }

  const productContextString = JSON.stringify(products.map(p => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    image: p.image,
    sizeChart: p.sizeChart,
    category: p.category,
    description: p.description,
    sizingDataForCalculationOnly: p.sizeGuide || 'Chưa có thông số cụ thể'
  })), null, 2)

  // 2. Build system prompt
  const systemPrompt = `Bạn là trợ lý AI tư vấn thời trang của cửa hàng Woman Basic.
Bạn đóng vai trò là một Tư vấn viên và Stylist cá nhân chuyên nghiệp.

Quyền hạn và Nhiệm vụ của bạn:
1. Tư vấn & Stylist: Giúp khách tìm sản phẩm phù hợp (dựa trên phong cách, vóc dáng, dịp mặc) và gợi ý cách phối đồ đẹp mắt.
2. Hỗ trợ thông tin: Giải đáp thắc mắc về chất liệu, kiểu dáng, giá cả và SIZE SỐ dựa TRÊN DỮ LIỆU CÓ SẴN.

Các giới hạn NGHIÊM NGẶT:
- KHÔNG tạo đơn hàng, KHÔNG thêm sản phẩm vào giỏ hàng, KHÔNG thực hiện bất kỳ thao tác nào tác động vào cơ sở dữ liệu.
- Nếu khách muốn mua hoặc đặt hàng, hãy hướng dẫn khách nhấn vào nút "Xem" trên card sản phẩm để tự thực hiện trên trang web.
- TUYỆT ĐỐI KHÔNG bịa đặt thông tin. Chỉ trả lời dựa trên dữ liệu sản phẩm được cung cấp dưới đây. 

Dữ liệu sản phẩm hiện có tại cửa hàng:
${productContextString}

Quy tắc bắt buộc:
- Dựa vào dữ liệu "sizingDataForCalculationOnly" (nếu có), hãy tư vấn size chính xác cho khách (ví dụ: "Với cân nặng 50kg, bạn nên chọn size M").
- NGHIÊM CẤM sao chép hoặc vẽ lại các bảng văn bản thô từ dữ liệu size vào câu trả lời.
- Để hiện bảng size, BẮT BUỘC chỉ sử dụng duy nhất tag <!--SIZE_CHART::URL--> để hiện ảnh. KHÔNG ĐƯỢC gửi đường link URL thô (http...) trực tiếp vào tin nhắn.
- Nếu khách hỏi về nhiều sản phẩm, hãy nói một câu tổng quát như "Dưới đây là bảng size cho các sản phẩm ở trên:" và sau đó chèn các tag <!--SIZE_CHART::URL--> liên tiếp.
- Tuyệt đối KHÔNG ĐƯỢC viết mã ID sản phẩm vào trong câu trả lời cho khách hàng. ID chỉ dùng cho khối JSON ở cuối.
- Khi gợi ý sản phẩm, BẮT BUỘC trả về block JSON <!--PRODUCTS::[...]--> ở cuối câu trả lời.
- Định dạng JSON sản phẩm (BẮT BUỘC): <!--PRODUCTS::[{"_id":"...","name":"...","price":123456,"image":"...","category":"..."}]--> (Lưu ý: price phải là số, không để trong ngoặc kép)
- Giọng văn: Thân thiện, tự nhiên, xưng "mình".
- Ví dụ gợi ý câu hỏi (Quick Replies): <!--QUICK_REPLIES::["Xem bảng size","Tư vấn phối đồ"]-->`

  // 3. Build messages array cho Groq API
  const messages = [
    { role: 'system', content: systemPrompt }
  ]

  // Thêm lịch sử hội thoại (giới hạn 10 messages gần nhất để tránh token overflow)
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
        console.warn(`[CustomerChat] Lỗi Groq API (Attempt ${attempt}/${MAX_RETRIES}). Thử lại sau ${attempt * 2}s...`)
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
  const parsed = parseAIResponse(aiResponseText)

  // 5b. Lưu vào cache nếu đây là câu hỏi mới (không có history để đảm bảo tính độc lập)
  if (history.length === 0 && parsed.reply) {
    try {
      await ChatCache.findOneAndUpdate(
        { normalizedQuestion: normalizedMsg },
        {
          normalizedQuestion: normalizedMsg,
          originalQuestion: message,
          answer: parsed.reply,
          products: parsed.products,
          quickReplies: parsed.quickReplies
        },
        { upsert: true, new: true }
      )
    } catch (error) {
      console.error('[ChatCache] Lỗi lưu cache:', error.message)
    }
  }

  // 6. Không lưu vào conversation collection theo yêu cầu (không lưu lịch sử trò chuyện của khách hàng)

  return {
    reply: parsed.reply,
    products: parsed.products,
    quickReplies: parsed.quickReplies
  }
}

export const customerChatService = {
  getProductContextData,
  sendCustomerMessage
}
