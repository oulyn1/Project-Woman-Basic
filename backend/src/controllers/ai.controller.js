import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { aiAnalyzeService } from '~/services/aiAnalyze.service'
import Category from '~/models/categoryModel'

// Giới hạn kích thước ảnh: 4MB = 4 * 1024 * 1024 bytes
// Base64 overhead ≈ 4/3, nên 4MB file ≈ ~5.5MB base64 string
// 5.5MB base64 ≈ 5.5 * 1024 * 1024 ký tự
const MAX_BASE64_LENGTH = Math.ceil(4 * 1024 * 1024 * (4 / 3))

/**
 * POST /v1/ai/analyze-product
 * Body: { base64Image: string }
 * Header: Authorization: Bearer <token>
 */
const analyzeProduct = async (req, res, next) => {
  try {
    const { base64Image, base64Images } = req.body

    // Hỗ trợ cả gửi 1 ảnh (base64Image) và nhiều ảnh (base64Images)
    let images = []
    if (Array.isArray(base64Images) && base64Images.length > 0) {
      images = base64Images
    } else if (base64Image && typeof base64Image === 'string') {
      images = [base64Image]
    }

    if (images.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cần ít nhất 1 ảnh sản phẩm (base64Image hoặc base64Images)'
      )
    }

    // Loại bỏ data URI prefix và validate kích thước từng ảnh
    const cleanImages = images.map((img, idx) => {
      const clean = img.includes(',') ? img.split(',')[1] : img
      if (clean.length > MAX_BASE64_LENGTH) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Ảnh ${idx + 1} vượt quá giới hạn 4MB. Vui lòng chọn ảnh nhỏ hơn.`
        )
      }
      return clean
    })

    // Lấy danh sách categories thực từ DB để AI biết chính xác cần chọn gì
    const categories = await Category.find().select('_id name').lean()

    const result = await aiAnalyzeService.analyzeProductWithAI(cleanImages, categories)

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const analyzeSizeChart = async (req, res, next) => {
  try {
    const { base64Image } = req.body

    if (!base64Image || typeof base64Image !== 'string') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu ảnh base64Image')
    }

    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image
    const result = await aiAnalyzeService.analyzeSizeChartWithAI(cleanBase64)

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const aiController = {
  analyzeProduct,
  analyzeSizeChart
}
