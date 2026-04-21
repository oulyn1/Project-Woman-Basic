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

export const addToCartAPI = (productId, variantId, quantity = 1, color = '', size = '') =>
  request(() => api.post('/cart/items', {
    productId,
    variantId,
    color,
    size,
    quantity
  }))
export const updateQuantityAPI = (productId, variantId, quantity) =>
  request(() => api.put('/cart/items', { productId, variantId, quantity }))

export const removeItemAPI = (productId, variantId) =>
  request(() => api.delete('/cart/items', { data: { productId, variantId } }))

export const clearCartAPI = () =>
  request(() => api.delete('/cart'))

export const getAllCartsAPI = () =>
  request(() => api.get('/cart/admin/all'))

export const deleteCartAPI = (cartId) =>
  request(() => api.delete(`/cart/admin/${cartId}`))

