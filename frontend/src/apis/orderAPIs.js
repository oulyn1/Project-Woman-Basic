import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Lấy tất cả đơn hàng (Admin thì tất cả, User thì chỉ đơn của mình)
export const fetchAllOrdersAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/order/`)
  return request.data
}

// Lấy chi tiết 1 đơn hàng
export const getOrderDetailAPI = async (orderId) => {
  const request = await axios.get(`${API_ROOT}/v1/order/detail/${orderId}`)
  return request.data
}

// Xóa đơn hàng
export const deleteOrderAPI = async (orderId) => {
  const request = await axios.delete(`${API_ROOT}/v1/order/${orderId}`)
  return request.data
}

// Cập nhật đơn hàng (status, info buyer...)
export const updateOrderAPI = async (orderId, orderData) => {
  const response = await axios.put(`${API_ROOT}/v1/order/detail/${orderId}`, orderData, getAuthHeaders())
  return response.data
}

// Tìm kiếm đơn hàng
export const searchOrdersAPI = async (query) => {
  const request = await axios.get(`${API_ROOT}/v1/order/search?keyword=${query}`)
  return request.data
}

// Tạo đơn hàng mới
export const createOrderAPI = async (orderData) => {
  const request = await axios.post(`${API_ROOT}/v1/order/`, orderData)
  return request.data
}

// Confirm order
export const confirmOrderAPI = async (orderId) => {
  const request = await axios.post(`${API_ROOT}/v1/order/confirm/${orderId}`)
  return request.data
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

export const fetchMyOrdersAPI = async () => {
  const response = await axios.get(`${API_ROOT}/v1/order/my-orders`, getAuthHeaders())
  return response.data
}

// Tìm kiếm đơn hàng của user đang đăng nhập
export const searchMyOrdersAPI = async (query) => {
  const response = await axios.get(`${API_ROOT}/v1/order/my-orders/search?keyword=${query}`, getAuthHeaders())
  return response.data
}

