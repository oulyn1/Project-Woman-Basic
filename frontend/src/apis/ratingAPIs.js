import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Thêm đánh giá mới
export const addRatingAPI = async (ratingData) => {
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