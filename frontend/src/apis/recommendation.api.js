import axios from 'axios'
import { API_ROOT } from '../util/constants'
import { getSessionId } from '../utils/session'

// Helper lấy auth header (giống pattern hiện có trong project)
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

/**
 * Track hành vi người dùng (view / add_to_cart / purchase).
 * Tự đính kèm JWT nếu đã đăng nhập, sessionId nếu chưa.
 */
export const trackBehaviorAPI = async ({ productId, categoryId, action }) => {
  const token = localStorage.getItem('accessToken')
  const payload = { productId, categoryId, action }

  // Nếu chưa đăng nhập, đính kèm sessionId
  if (!token) {
    payload.sessionId = getSessionId()
  }

  const res = await axios.post(
    `${API_ROOT}/v1/recommendations/track`,
    payload,
    getAuthHeaders()
  )
  return res.data
}

/**
 * Lấy danh sách sản phẩm gợi ý cho homepage.
 * Tự nhận diện user/guest từ token hoặc sessionId.
 */
export const getRecommendationsAPI = async () => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    // User đã đăng nhập — backend tự lấy userId từ JWT
    const res = await axios.get(
      `${API_ROOT}/v1/recommendations`,
      getAuthHeaders()
    )
    return res.data
  } else {
    // Guest — gửi sessionId qua query param
    const sessionId = getSessionId()
    const res = await axios.get(
      `${API_ROOT}/v1/recommendations`,
      { params: { sessionId } }
    )
    return res.data
  }
}

/**
 * Lấy sản phẩm tương tự cho trang ProductDetail.
 */
export const getSimilarProductsAPI = async (productId) => {
  const res = await axios.get(`${API_ROOT}/v1/recommendations/similar/${productId}`)
  return res.data
}

/**
 * Merge dữ liệu hành vi guest vào user account sau khi đăng nhập.
 * Gọi ngay sau khi login thành công và token đã được lưu.
 */
export const mergeGuestBehaviorAPI = async (sessionId) => {
  const res = await axios.post(
    `${API_ROOT}/v1/recommendations/merge-guest`,
    { sessionId },
    getAuthHeaders()
  )
  return res.data
}
