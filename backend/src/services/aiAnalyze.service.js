import { aiHelper } from '~/utils/aiHelper'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/**
 * Analyze a fashion product image using Groq.
 */
const analyzeProductWithAI = async (base64Image) => {
  const groqPrompt = `Bạn là chuyên gia viết nội dung cho "Woman Basic". Dựa trên hình ảnh, tạo JSON:
{
  "name": "Tên sản phẩm",
  "category": "Áo/Quần/Đầm/Váy/Phụ kiện/Giày/Túi xách",
  "tags": ["tag1", "tag2"],
  "description": "Bài PR hoàn chỉnh..."
} (Không nhắc màu sắc, dùng tiếng Việt)`

  const content = await aiHelper.callGroqAI({
    contextName: 'ProductAnalysis',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: groqPrompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ]
  })

  const parsed = aiHelper.parseSafeJSON(content)

  // Validate các trường bắt buộc
  const name = parsed.name?.trim() || ''
  const category = parsed.category?.trim() || ''
  const description = parsed.description?.trim() || ''
  const tags = Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).trim()) : []

  if (!name || !category || !description) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Dữ liệu từ AI thiếu các trường bắt buộc.')
  }

  return { name, category, description, tags }
}

/**
 * Analyze a size chart image using Groq.
 */
const analyzeSizeChartWithAI = async (base64Image) => {
  const groqPrompt = `Trích xuất bảng size từ ảnh thành Markdown. Trả về JSON: { "sizeGuide": "nội dung markdown" }`

  const content = await aiHelper.callGroqAI({
    contextName: 'SizeChartAnalysis',
    response_format: { type: 'json_object' },
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: groqPrompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ]
  })

  const parsed = aiHelper.parseSafeJSON(content)
  return { sizeGuide: parsed.sizeGuide || '' }
}

export const aiAnalyzeService = {
  analyzeProductWithAI,
  analyzeSizeChartWithAI
}
