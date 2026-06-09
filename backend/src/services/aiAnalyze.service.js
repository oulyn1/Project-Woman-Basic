import { aiHelper } from '~/utils/aiHelper'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/**
 * Analyze a fashion product image using Groq.
 */
const analyzeProductWithAI = async (base64Images, categories = []) => {
  // Hỗ trợ cả string đơn lẻ (backward compatible) và mảng
  const imageList = Array.isArray(base64Images) ? base64Images : [base64Images]

  // Build danh sách category cho prompt — nếu có categories thực từ DB thì dùng,
  // fallback về danh sách cứng nếu DB trống
  const categoryList = categories.length > 0
    ? categories.map(c => `"${c.name}"`).join(', ')
    : '"Áo", "Quần", "Đầm", "Váy", "Phụ kiện", "Giày", "Túi xách"'

  const categoryFieldDesc = categories.length > 0
    ? `"category": "Phải là MỘT TRONG các tên danh mục sau (chép CHÍNH XÁC, không thay đổi chính tả): ${categoryList}"`
    : `"category": "Một trong: ${categoryList}"`

  const groqPrompt = `Bạn là chuyên gia viết nội dung (Copywriter) cho website thời trang nữ "Woman Basic".
Dựa trên hình ảnh sản phẩm, hãy tạo một đối tượng JSON với cấu trúc sau:
{
  "isValid": true,
  "invalidReason": "",
  "name": "Tên sản phẩm theo cấu trúc: [Loại sản phẩm] [Chi tiết kiểu dáng] [Mã sản phẩm]. Ví dụ: Quần Giả Váy Ngắn Chữ A GV08. KHÔNG kèm màu sắc.",
  ${categoryFieldDesc},
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "description": "Nội dung bài PR sản phẩm theo cấu trúc dưới đây (PHẢI là một chuỗi string thuần, KHÔNG ĐƯỢC trả về dạng object hay array)"
}

YÊU CẦU QUAN TRỌNG:
0. TRƯỚC TIÊN, hãy kiểm tra ảnh: nếu ảnh KHÔNG chứa quần áo, phụ kiện thời trang (ví dụ: chỉ có phong cảnh, đồ vật không liên quan đến thời trang, ảnh tự sướng cá nhân không rõ trang phục, nội dung không phù hợp...) thì chỉ trả về JSON: { "isValid": false, "invalidReason": "[Lý do cụ thể bằng tiếng Việt]" } và DỪNG LẠI, không tạo các trường khác. Chú ý: Ảnh có người mẫu (model) đang mặc hoặc trình diễn trang phục/phụ kiện thời trang là HOÀN TOÀN HỢP LỆ và cần được phân tích.
1. TUYỆT ĐỐI KHÔNG nhắc đến màu sắc của sản phẩm trong tên, mô tả hay tags.
2. Trường 'description' PHẢI là một chuỗi string duy nhất, chứa ĐÚNG nội dung theo mẫu bên dưới. KHÔNG thêm tiêu đề phụ, label hay ghi chú nào khác ngoài những dòng trong mẫu.
3. Mẫu description (chỉ copy nội dung, KHÔNG copy các dòng bắt đầu bằng "---"):

---MẪU BẮT ĐẦU---
Giới Thiệu Về [Tên Sản Phẩm]

[Đoạn văn giới thiệu sản phẩm, nhấn mạnh thương hiệu Woman Basic, phong cách, đặc trưng thiết kế, đối tượng khách hàng. Viết 3-5 câu.]

Đặc Điểm Nổi Bật Của [Tên Sản Phẩm]

    [Tiêu đề đặc điểm 1]: [Mô tả chi tiết]
    [Tiêu đề đặc điểm 2]: [Mô tả chi tiết]
    [Tiêu đề đặc điểm 3]: [Mô tả chi tiết]
    [Tiêu đề đặc điểm 4]: [Mô tả chi tiết]
    [Tiêu đề đặc điểm 5]: [Mô tả chi tiết]

Thông Tin Chi Tiết Sản Phẩm

    Kiểu dáng: [Mô tả form dáng chi tiết]
    Chiều dài: [Ngắn/Dài/Midi...]
    Mùa: [Mùa phù hợp]
    Xuất xứ: Việt Nam
    Phong cách: [Liệt kê các phong cách phù hợp]
    Thương hiệu: Woman Basic

Hướng Dẫn Phối Đồ Với [Tên Sản Phẩm]

✦Mix cùng [Item 1 + phụ kiện]: [Mô tả phong cách và dịp phù hợp]
✦Mix cùng [Item 2 + phụ kiện]: [Mô tả phong cách và dịp phù hợp]
✦Mix cùng [Item 3 + phụ kiện]: [Mô tả phong cách và dịp phù hợp]
✦Mix cùng [Item 4 + phụ kiện]: [Mô tả phong cách và dịp phù hợp]

Lưu Ý Khi Mua Hàng

    Sản phẩm có thể chênh lệch màu sắc nhẹ so với thực tế do điều kiện ánh sáng và hiển thị màn hình.
    Để bảo quản sản phẩm bền đẹp, nên giặt nhẹ nhàng bằng tay và phơi trong bóng râm.

[Tên Sản Phẩm] từ Woman Basic là sự kết hợp hoàn hảo giữa thời trang và tiện ích, giúp bạn tự tin tỏa sáng mọi lúc, mọi nơi!

👉 Theo dõi ngay: Fanpage WomanBasic để không bỏ lỡ những ưu đãi siêu hấp dẫn!
---MẪU KẾT THÚC---

(TUYỆT ĐỐI CHỈ sử dụng tiếng Việt. KHÔNG ĐƯỢC dùng bất kỳ ký tự tiếng Nhật, tiếng Trung, tiếng Hàn hay ngôn ngữ nào khác. Văn phong tinh tế, hiện đại, thu hút khách hàng nữ.)`

  const content = await aiHelper.callGroqAI({
    contextName: 'ProductAnalysis',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: groqPrompt },
          ...imageList.map(img => ({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${img}` } }))
        ]
      }
    ]
  })

  const parsed = aiHelper.parseSafeJSON(content)

  // Kiểm tra ảnh có hợp lệ không (quần áo / thời trang)
  if (parsed.isValid === false) {
    const reason = parsed.invalidReason || 'Ảnh không phải sản phẩm quần áo hoặc thời trang.'
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, `Ảnh không hợp lệ: ${reason}`)
  }

  // Validate các trường bắt buộc
  const name = parsed.name?.trim() || ''
  const category = parsed.category?.trim() || ''
  // AI có thể trả description dạng object thay vì string → chuyển đổi an toàn
  let description = ''
  if (typeof parsed.description === 'string') {
    description = parsed.description.trim()
  } else if (parsed.description && typeof parsed.description === 'object') {
    description = JSON.stringify(parsed.description, null, 2)
  }
  const tags = Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).trim()) : []

  if (!name || !category || !description) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Dữ liệu từ AI thiếu các trường bắt buộc.')
  }

  // Resolve categoryId từ tên AI trả về — 3 cấp độ matching (giảm dần độ chặt)
  let categoryId = null
  if (categories.length > 0) {
    const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    const aiCatNorm = normalize(category)

    // 1. Exact match (bỏ dấu)
    let matched = categories.find(c => normalize(c.name) === aiCatNorm)
    // 2. AI output chứa tên DB (vd: AI trả "Áo thun" → DB có "Áo")
    if (!matched) matched = categories.find(c => aiCatNorm.includes(normalize(c.name)))
    // 3. Tên DB chứa AI output (vd: AI trả "Áo" → DB có "Áo thun")
    if (!matched) matched = categories.find(c => normalize(c.name).includes(aiCatNorm))

    if (matched) categoryId = matched._id.toString()
  }

  return { name, category, categoryId, description, tags }
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
