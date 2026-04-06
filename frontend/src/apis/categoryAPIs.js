import axios from 'axios'
import { API_ROOT } from '../util/constants'

export const fetchAllCategorysAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/category/`)
  return request.data
}

export const getCategoryDetailAPI = async (categoryId) => {
  const request = await axios.get(`${API_ROOT}/v1/category/${categoryId}`)
  return request.data
}

export const deleteCategoryAPI = async (categoryId) => {
  const request = await axios.delete(`${API_ROOT}/v1/category/${categoryId}`)
  return request.data
}

export const updateCategoryAPI = async (categoryId, categoryData) => {
  const request = await axios.put(`${API_ROOT}/v1/category/${categoryId}`, categoryData)
  return request.data
}

export const searchCategorysAPI = async (query) => {
  const request = await axios.get(`${API_ROOT}/v1/category/search?name=${query}`)
  return request.data
}

export const createCategoryAPI = async (categoryData) => {
  const request = await axios.post(`${API_ROOT}/v1/category/`, categoryData)
  return request.data
}
