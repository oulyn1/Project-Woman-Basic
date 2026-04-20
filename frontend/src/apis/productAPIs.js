import axios from 'axios'
import { API_ROOT } from '../util/constants'

const CLOUDINARY_CLOUD_NAME = 'dp7w5n0dr'
const CLOUDINARY_UPLOAD_PRESET = 'PROJECTWB'

export const uploadImageToCloudinaryAPI = async (file) => {
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await axios.post(CLOUDINARY_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const fetchAllProductsAPI = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString()
  const request = await axios.get(`${API_ROOT}/v1/product/?${params}`)
  return request.data
}

export const searchProductsAPI = (query) => fetchAllProductsAPI({ q: query })

export const getProductDetailAPI = async (productId) => {
  const request = await axios.get(`${API_ROOT}/v1/product/${productId}`)
  return request.data
}

export const getProductBySlugAPI = async (slug) => {
  const request = await axios.get(`${API_ROOT}/v1/product/slug/${slug}`)
  return request.data
}

export const deleteProductAPI = async (productId) => {
  const request = await axios.delete(`${API_ROOT}/v1/product/${productId}`)
  return request.data
}

export const updateProductAPI = async (productId, productData) => {
  const request = await axios.patch(`${API_ROOT}/v1/product/${productId}`, productData)
  return request.data
}

export const updateVariantStockAPI = async (productId, variantId, quantity) => {
  const request = await axios.patch(`${API_ROOT}/v1/product/${productId}/variants/${variantId}`, { quantity })
  return request.data
}

export const createProductAPI = async (productData) => {
  const request = await axios.post(`${API_ROOT}/v1/product/`, productData)
  return request.data
}
