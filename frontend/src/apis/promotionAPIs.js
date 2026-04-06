import axios from 'axios'
import { API_ROOT } from '../util/constants'

export const fetchAllPromotionsAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/promotion/`)
  return request.data
}

export const getPromotionDetailAPI = async (promotionId) => {
  const request = await axios.get(`${API_ROOT}/v1/promotion/${promotionId}`)
  return request.data
}

export const createPromotionAPI = async (promotionData) => {
  const request = await axios.post(`${API_ROOT}/v1/promotion/`, promotionData)
  return request.data
}

export const updatePromotionAPI = async (promotionId, promotionData) => {
  const request = await axios.put(`${API_ROOT}/v1/promotion/${promotionId}`, promotionData)
  return request.data
}

export const deletePromotionAPI = async (promotionId) => {
  const request = await axios.delete(`${API_ROOT}/v1/promotion/${promotionId}`)
  return request.data
}

export const searchPromotionsAPI = async (keyword) => {
  const request = await axios.get(`${API_ROOT}/v1/promotion/search`, {
    params: { q: keyword }
  })
  return request.data
}
