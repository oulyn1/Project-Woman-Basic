import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Thêm đánh giá mới
export const addRatingAPI = async (ratingData) => {
  // Ensure userId is provided if user object exists in localStorage
  if (!ratingData.userId) {
    try {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      if (user && user._id) ratingData.userId = user._id
    } catch {
      // ignore
    }
  }
  const request = await axios.post(`${API_ROOT}/v1/ratings/add`, ratingData)
  return request.data
}

// Lấy tất cả đánh giá
export const getAllRatingsAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/ratings/`)
  return request.data
}

// Tìm đánh giá theo tên sản phẩm
export const searchRatingsAPI = async (productName) => {
  const request = await axios.get(`${API_ROOT}/v1/ratings/search?productName=${productName}`)
  return request.data
}

export const getRatingsByProductId = async (productId) => {
  const request = await axios.get(`${API_ROOT}/v1/ratings/product/${productId}`)
  return request.data
}
export const deleteRatingAPI = async (id, token) => {
  const request = await axios.delete(`${API_ROOT}/v1/ratings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return request.data
}
