import axios from 'axios'
import { API_ROOT } from '../util/constants'

/**
 * Gọi backend API để phân tích ảnh sản phẩm bằng AI.
 * @param {string[]} base64Images - Mảng base64 string của các ảnh sản phẩm
 * @param {string} token - JWT access token lấy từ localStorage('accessToken')
 * @returns {{ name: string, category: string, description: string, tags: string[] }}
 */
export const analyzeProductWithAIAPI = async (base64Images, token) => {
  const images = Array.isArray(base64Images) ? base64Images : [base64Images]
  const response = await axios.post(
    `${API_ROOT}/v1/ai/analyze-product`,
    { base64Images: images },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 120s — nhiều ảnh cần thời gian xử lý lâu hơn
    }
  )
  return response.data // { success: true, data: { name, category, description, tags } }
}

/**
 * Gọi backend API để phân tích bảng size bằng AI.
 */
export const analyzeSizeChartWithAIAPI = async (base64Image, token) => {
  const response = await axios.post(
    `${API_ROOT}/v1/ai/analyze-size-chart`,
    { base64Image },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  )
  return response.data
}
