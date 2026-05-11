import { aiHelper } from '~/utils/aiHelper'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/**
 * Analyze a fashion product image using Groq.
 */
const analyzeProductWithAI = async (base64Image) => {
  const groqPrompt = `Bạn là chuyên gia viết nội dung (Copywriter) cho website thời trang nữ "Woman Basic".
Dựa trên hình ảnh sản phẩm, hãy tạo một đối tượng JSON với cấu trúc sau:
{
  "name": "Tên sản phẩm (không kèm màu sắc)",
  "category": "Một trong: Áo, Quần, Đầm, Váy, Phụ kiện, Giày, Túi xách",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "description": "Nội dung bài PR sản phẩm theo cấu trúc dưới đây"
}

YÊU CẦU QUAN TRỌNG:
1. TUYỆT ĐỐI KHÔNG nhắc đến màu sắc của sản phẩm trong tên, mô tả hay tags.
2. Cấu trúc trường 'description' PHẢI tuân thủ chính xác mẫu sau:

Giới Thiệu Về [Tên Sản Phẩm]
[Đoạn văn ngắn giới thiệu sản phẩm, phong cách Hàn Quốc/Cá tính/Năng động...]

Đặc Điểm Nổi Bật Của [Tên Sản Phẩm]
- [Đặc điểm nổi bật 1]
- [Đặc điểm nổi bật 2]
- [Đặc điểm nổi bật 3]

Thông Tin Chi Tiết Sản Phẩm
- Kiểu dáng: [Mô tả form dáng: suông, ôm, oversize...]
- Chi tiết: [Các chi tiết như xếp ly, cúc, túi, đường may...]
- Phù hợp: [Dịp sử dụng: đi chơi, đi làm, dự tiệc...]

Hướng Dẫn Phối Đồ Với [Tên Sản Phẩm]
✦ Mix cùng [Item 1]: [Gợi ý phối đồ và phong cách tạo thành]
✦ Mix cùng [Item 2]: [Gợi ý phối đồ và phong cách tạo thành]

Lưu Ý Khi Mua Hàng
- Sản phẩm có thể chênh lệch màu sắc nhẹ (5-10%) so với thực tế do điều kiện ánh sáng và hiển thị màn hình.
- Để sản phẩm bền đẹp, khuyến khích giặt tay hoặc dùng túi giặt, tránh chất tẩy mạnh.

👉 Theo dõi ngay Fanpage và Website của Woman Basic để cập nhật những xu hướng thời trang mới nhất và không bỏ lỡ các chương trình ưu đãi hấp dẫn!

(Sử dụng tiếng Việt, văn phong tinh tế, hiện đại, thu hút khách hàng nữ)`

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
