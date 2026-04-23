import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Fetch all with filters (returns { success, items, meta })
export const fetchAllPromotionsAPI = async (params = {}) => {
  const request = await axios.get(`${API_ROOT}/v1/promotion/`, { params })
  return request.data
}

// Singular objects return .data.data (unwrapping the payload)
export const getPromotionDetailAPI = async (promotionId) => {
  const request = await axios.get(`${API_ROOT}/v1/promotion/${promotionId}`)
  return request.data.data
}

export const createPromotionAPI = async (promotionData) => {
  const request = await axios.post(`${API_ROOT}/v1/promotion/`, promotionData)
  return request.data.data
}

export const updatePromotionAPI = async (promotionId, promotionData) => {
  const request = await axios.put(`${API_ROOT}/v1/promotion/${promotionId}`, promotionData)
  return request.data.data
}

export const deletePromotionAPI = async (promotionId) => {
  const request = await axios.delete(`${API_ROOT}/v1/promotion/${promotionId}`)
  return request.data
}

export const clonePromotionAPI = async (promotionId) => {
  const request = await axios.post(`${API_ROOT}/v1/promotion/${promotionId}/clone`)
  return request.data.data
}

// Checkout related (returns raw payload for calculation)
export const getEligibleOrderPromosAPI = async (customerId, orderValue) => {
  const request = await axios.get(`${API_ROOT}/v1/promotion/order/eligible`, {
    params: { customerId, orderValue }
  })
  return request.data.data
}

export const applyPromotionsAPI = async (data) => {
  const request = await axios.post(`${API_ROOT}/v1/promotion/apply`, data)
  return request.data.data
}
