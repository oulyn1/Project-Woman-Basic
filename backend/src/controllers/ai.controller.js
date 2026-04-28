import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { aiAnalyzeService } from '~/services/aiAnalyze.service'

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
    const { base64Image } = req.body

    if (!base64Image || typeof base64Image !== 'string') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Trường base64Image là bắt buộc và phải là chuỗi base64 hợp lệ'
      )
    }

    // Loại bỏ data URI prefix nếu có (data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image

    if (cleanBase64.length > MAX_BASE64_LENGTH) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Ảnh vượt quá giới hạn cho phép (tối đa 4MB). Vui lòng chọn ảnh nhỏ hơn.'
      )
    }

    const result = await aiAnalyzeService.analyzeProductWithAI(cleanBase64)

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
}
