import axios from 'axios'
import { API_ROOT } from '../util/constants'

/**
 * Gọi backend API để phân tích ảnh sản phẩm bằng AI.
 * @param {string} base64Image - Base64 string của ảnh (có hoặc không có data URI prefix)
 * @param {string} token - JWT access token lấy từ localStorage('accessToken')
 * @returns {{ name: string, category: string, description: string, tags: string[] }}
 */
export const analyzeProductWithAIAPI = async (base64Image, token) => {
  const response = await axios.post(
    `${API_ROOT}/v1/ai/analyze-product`,
    { base64Image },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60s — AI pipeline có thể tốn thời gian
    }
  )
  return response.data // { success: true, data: { name, category, description, tags } }
}
