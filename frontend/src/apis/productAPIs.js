import axios from 'axios'
import { API_ROOT } from '../util/constants'

const CLOUDINARY_CLOUD_NAME = 'dkw1qvcz6'
const CLOUDINARY_UPLOAD_PRESET = 'DAHTTT'

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

export const fetchAllProductsAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/product/`)
  return request.data
}

export const getProductDetailAPI = async (productId) => {
  const request = await axios.get(`${API_ROOT}/v1/product/${productId}`)
  return request.data
}

export const deleteProductAPI = async (productId) => {
  const request = await axios.delete(`${API_ROOT}/v1/product/${productId}`)
  return request.data
}

export const updateProductAPI = async (productId, productData) => {
  const request = await axios.put(`${API_ROOT}/v1/product/${productId}`, productData)
  return request.data
}

export const searchProductsAPI = async (query) => {
  const request = await axios.get(`${API_ROOT}/v1/product/search?name=${query}`)
  return request.data
}

export const createProductAPI = async (productData) => {
  const request = await axios.post(`${API_ROOT}/v1/product/`, productData)
  return request.data
}
