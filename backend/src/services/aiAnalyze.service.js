import axios from 'axios'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const MOONDREAM_API_URL = 'https://api.moondream.ai/v1/query'
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent'

/**
 * Analyze a fashion product image using Moondream then Gemini.
 * @param {string} base64Image - Base64-encoded image string (without data URI prefix)
 * @returns {{ name: string, category: string, description: string, tags: string[] }}
 */
const analyzeProductWithAI = async (base64Image) => {
  const moondreamKey = process.env.MOONDREAM_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  if (!moondreamKey || !geminiKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Thiếu cấu hình API key cho dịch vụ AI. Vui lòng liên hệ quản trị viên.'
    )
  }

  // ────────────────────────────────────────────────────────────
  // Bước 1: Gọi Moondream API để lấy caption mô tả ảnh
  // ────────────────────────────────────────────────────────────
  let moondreamCaption = ''
  try {
    const moondreamResponse = await axios.post(
      MOONDREAM_API_URL,
      {
        image_url: `data:image/jpeg;base64,${base64Image}`,
        question:
          'Identify and describe ONLY the single main fashion product that occupies the largest area or is the clear focal point of this image. Ignore any secondary items, accessories, or other clothing worn by the model. Describe its type, style, materials, patterns, and notable features. Do NOT mention its color. Be specific and factual about this ONE main item.',
        stream: false,
      },
      {
        headers: {
          'X-Moondream-Auth': moondreamKey,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    moondreamCaption =
      moondreamResponse.data?.answer ||
      moondreamResponse.data?.result ||
      moondreamResponse.data?.caption ||
      ''

    if (!moondreamCaption) {
      throw new Error('Moondream trả về kết quả rỗng')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      `Lỗi khi gọi Moondream API: ${msg}`
    )
  }

  // ────────────────────────────────────────────────────────────
  // Bước 2: Gọi Gemini API với Structured Output (JSON mode)
  // ────────────────────────────────────────────────────────────
  const geminiPrompt = `Bạn là chuyên gia viết nội dung (Copywriter) cho website thương mại điện tử thời trang nữ "Woman Basic".

Dựa trên mô tả sản phẩm sau từ hệ thống phân tích ảnh AI (LƯU Ý: Chỉ tập trung phân tích và viết bài cho MỘT SẢN PHẨM CHÍNH yếu duy nhất, tuyệt đối không gộp chung với các phụ kiện hay trang phục phối kèm khác. TUYỆT ĐỐI KHÔNG nhắc đến màu sắc của sản phẩm trong tên, mô tả hay tags):
"${moondreamCaption}"

Hãy tạo nội dung sản phẩm bằng tiếng Việt:
- name: Tên sản phẩm ngắn gọn, hấp dẫn (ví dụ: Áo Thun Basic Oversize Nữ)
- category: Một trong các danh mục: Áo, Quần, Đầm, Váy, Phụ kiện, Giày, Túi xách
- tags: Mảng 5 từ khóa ngắn (1-3 từ tiếng Việt) phù hợp với sản phẩm
- description: Viết MỘT BÀI PR SẢN PHẨM HOÀN CHỈNH, xuống dòng rõ ràng, TUÂN THỦ CHÍNH XÁC cấu trúc và văn phong của mẫu dưới đây (thay thế thông tin cho phù hợp với sản phẩm đang phân tích):

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
  - Để bảo quản quần bền đẹp, nên giặt nhẹ nhàng bằng tay và phơi trong bóng râm.

[Tên Sản Phẩm] từ Woman Basic là sự kết hợp hoàn hảo giữa thời trang và tiện ích, giúp bạn tự tin tỏa sáng mọi lúc, mọi nơi!

👉 Theo dõi ngay: Fanpage WomanBasic để không bỏ lỡ những ưu đãi siêu hấp dẫn!`

  let geminiRawText = ''
  try {
    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [{ text: geminiPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          // thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              category: { type: 'STRING' },
              description: { type: 'STRING' },
              tags: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
            },
            required: ['name', 'category', 'description', 'tags'],
          },
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    )

    // Log để debug nếu cần
    const candidate = geminiResponse.data?.candidates?.[0]
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn('[Gemini] finishReason:', candidate.finishReason, candidate?.safetyRatings)
    }

    geminiRawText =
      candidate?.content?.parts?.[0]?.text || ''

    if (!geminiRawText) {
      const finishReason = candidate?.finishReason || 'UNKNOWN'
      throw new Error(`Gemini trả về nội dung rỗng (finishReason: ${finishReason})`)
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    const msg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      `Lỗi khi gọi Gemini API: ${msg}`
    )
  }

  // ────────────────────────────────────────────────────────────
  // Bước 3: Parse JSON an toàn từ response Gemini
  // ────────────────────────────────────────────────────────────
  try {
    // Với responseMimeType: 'application/json', Gemini sẽ trả về JSON thuần túy.
    // Nhưng vẫn giữ fallback regex để xử lý trường hợp có markdown bao bọc.
    let jsonStr = geminiRawText.trim()

    // Loại bỏ markdown code block nếu có (```json ... ``` hoặc ``` ... ```)
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }

    // Fallback: tìm object JSON đầu tiên
    if (!jsonStr.startsWith('{')) {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[Gemini] Raw text không parse được:', geminiRawText)
        throw new Error('Không tìm thấy JSON hợp lệ trong phản hồi Gemini')
      }
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr)

    // Validate các trường bắt buộc
    const name = typeof parsed.name === 'string' ? parsed.name.trim() : ''
    const category =
      typeof parsed.category === 'string' ? parsed.category.trim() : ''
    const description =
      typeof parsed.description === 'string' ? parsed.description.trim() : ''
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t) => typeof t === 'string').map((t) => t.trim())
      : []

    if (!name || !category || !description) {
      throw new Error('Dữ liệu JSON từ Gemini thiếu các trường bắt buộc')
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
