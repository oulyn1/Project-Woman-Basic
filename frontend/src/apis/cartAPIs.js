import axios from 'axios'
import { API_ROOT } from '../util/constants'

const api = axios.create({
  baseURL: `${API_ROOT}/v1`
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

const request = async (fn) => {
  try {
    const res = await fn()
    return { success: true, data: res.data.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    }
  }
}
const requestGetCartByUserAPI = async (fn) => {
  try {
    const res = await fn()
    return { success: true, data: res.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    }
  }
}

export const getCartByUserAPI = () =>
  requestGetCartByUserAPI(() => api.get('/cart'))

export const addToCartAPI = (productId, quantity = 1) =>
  request(() => api.post('/cart/items', { productId, quantity }))

export const updateQuantityAPI = (productId, quantity) =>
  request(() => api.put('/cart/items', { productId, quantity }))

export const removeItemAPI = (productId) =>
  request(() => api.delete('/cart/items', { data: { productId } }))

export const clearCartAPI = () =>
  request(() => api.delete('/cart'))

export const getAllCartsAPI = () =>
  request(() => api.get('/cart/admin/all'))

export const deleteCartAPI = (cartId) =>
  request(() => api.delete(`/cart/admin/${cartId}`))
