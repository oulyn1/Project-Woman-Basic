import axios from 'axios'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

/**
 * Analyze a fashion product image using Groq (Llama 3.2 Vision).
 * @param {string} base64Image - Base64-encoded image string (without data URI prefix)
 * @returns {{ name: string, category: string, description: string, tags: string[] }}
 */
const analyzeProductWithAI = async (base64Image) => {
  const groqKey = env.GROQ_API_KEY
  if (!groqKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Thiếu cấu hình GROQ_API_KEY. Vui lòng liên hệ quản trị viên.'
    )
  }

  // ────────────────────────────────────────────────────────────
  // Bước 1: Gọi Groq API với Multimodal & JSON Mode
  // ────────────────────────────────────────────────────────────
  const groqPrompt = `Bạn là chuyên gia viết nội dung (Copywriter) cho website thương mại điện tử thời trang nữ "Woman Basic".

Dựa trên hình ảnh sản phẩm được cung cấp (LƯU Ý: Chỉ tập trung phân tích và viết bài cho MỘT SẢN PHẨM CHÍNH yếu duy nhất chiếm diện tích lớn nhất hoặc là điểm nhấn rõ ràng nhất, tuyệt đối không gộp chung với các phụ kiện hay trang phục phối kèm khác. TUYỆT ĐỐI KHÔNG nhắc đến màu sắc của sản phẩm trong tên, mô tả hay tags).

Hãy tạo nội dung sản phẩm bằng tiếng Việt dưới dạng JSON với cấu trúc:
{
  "name": "Tên sản phẩm ngắn gọn, hấp dẫn (ví dụ: Áo Thun Basic Oversize Nữ)",
  "category": "Một trong: Áo, Quần, Đầm, Váy, Phụ kiện, Giày, Túi xách",
  "tags": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4", "từ khóa 5"],
  "description": "Bài PR sản phẩm hoàn chỉnh theo đúng mẫu dưới đây"
}

Yêu cầu bài viết description (sử dụng xuống dòng \n để trình bày đẹp):
Giới Thiệu Về [Tên Sản Phẩm]
[1 đoạn văn giới thiệu tổng quan về sản phẩm, mang đến phong cách gì, thiết kế ra sao, tôn dáng thế nào và sự thoải mái. Đặc biệt phù hợp với ai...]

Đặc Điểm Nổi Bật Của [Tên Sản Phẩm]
  - [Đặc điểm 1]: [Mô tả chi tiết đặc điểm này giúp sản phẩm nổi bật ra sao]
  - [Đặc điểm 2]: [Mô tả chi tiết]
  - [Đặc điểm 3]: [Mô tả chi tiết]
  - [Đặc điểm 4]: [Mô tả chi tiết]

Thông Tin Chi Tiết Sản Phẩm
  - Kiểu dáng: [Mô tả kiểu dáng]
  - Chiều dài: [Ngắn/Dài/Lửng/...]
  - Mùa: [Mùa phù hợp]
  - Xuất xứ: Việt Nam
  - Phong cách: [Liệt kê các phong cách]
  - Thương hiệu: Woman Basic

Hướng Dẫn Phối Đồ Với [Tên Sản Phẩm]
✦ Mix cùng [Item 1]: [Mô tả phong cách tạo thành, phù hợp dịp gì]
✦ Mix cùng [Item 2]: [Mô tả phong cách tạo thành, phù hợp dịp gì]
✦ Mix cùng [Item 3]: [Mô tả phong cách tạo thành, phù hợp dịp gì]
✦ Mix cùng [Item 4]: [Mô tả phong cách tạo thành, phù hợp dịp gì]

Lưu Ý Khi Mua Hàng
  - Sản phẩm có thể chênh lệch màu sắc nhẹ so với thực tế do điều kiện ánh sáng và hiển thị màn hình.
  - Để bảo quản bền đẹp, nên giặt nhẹ nhàng bằng tay và phơi trong bóng râm.

[Tên Sản Phẩm] từ Woman Basic là sự kết hợp hoàn hảo giữa thời trang và tiện ích, giúp bạn tự tin tỏa sáng mọi lúc, mọi nơi!
👉 Theo dõi ngay: Fanpage WomanBasic để không bỏ lỡ những ưu đãi siêu hấp dẫn!`

  let groqRawText = ''
  const MAX_RETRIES = 3

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const groqResponse = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: groqPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' },
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

      groqRawText = groqResponse.data?.choices?.[0]?.message?.content || ''

      if (!groqRawText) {
        throw new Error('Groq trả về nội dung rỗng')
      }

      // Thành công
      break
    } catch (error) {
      const status = error.response?.status
      const isRetryable = status === 503 || status === 429 || status === 500
      
      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`[Groq] Lỗi API (Attempt ${attempt}/${MAX_RETRIES}). Thử lại sau ${attempt * 2} giây...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        continue
      }

      const msg = error.response?.data?.error?.message || error.message
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        `Lỗi khi gọi Groq API: ${msg}`
      )
    }
  }

  // ────────────────────────────────────────────────────────────
  // Bước 3: Parse JSON an toàn từ response Groq
  // ────────────────────────────────────────────────────────────
  try {
    let jsonStr = groqRawText.trim()

    // Loại bỏ markdown code block nếu có (```json ... ``` hoặc ``` ... ```)
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }

    // Fallback: tìm object JSON đầu tiên
    if (!jsonStr.startsWith('{')) {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[Groq] Raw text không parse được:', groqRawText)
        throw new Error('Không tìm thấy JSON hợp lệ trong phản hồi Groq')
      }
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr)

    // Validate các trường bắt buộc
    const name = typeof parsed.name === 'string' ? parsed.name.trim() : ''
    const category = typeof parsed.category === 'string' ? parsed.category.trim() : ''
    const description = typeof parsed.description === 'string' ? parsed.description.trim() : ''
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t) => typeof t === 'string').map((t) => t.trim())
      : []

    if (!name || !category || !description) {
      throw new Error('Dữ liệu JSON từ Groq thiếu các trường bắt buộc')
    }

    return { name, category, description, tags }
  } catch (error) {
    throw new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      `Không thể phân tích kết quả từ AI: ${error.message}`
    )
  }
}

export const aiAnalyzeService = {
  analyzeProductWithAI,
}
