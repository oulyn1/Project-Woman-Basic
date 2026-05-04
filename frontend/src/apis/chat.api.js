import axios from 'axios'
import { API_ROOT } from '../util/constants'

/**
 * Gửi tin nhắn từ customer (không cần auth)
 * @param {{ sessionId: string, message: string, history: Array }} data
 * @returns {{ success: boolean, data: { reply: string, products: Array, quickReplies: Array } }}
 */
export const sendCustomerMessageAPI = async ({ sessionId, message, history }) => {
  const response = await axios.post(`${API_ROOT}/v1/chat/customer`, {
    sessionId,
    message,
    history
  }, {
    timeout: 60000 // 60s — AI có thể tốn thời gian
  })
  return response.data
}

/**
 * Gửi tin nhắn từ admin (tự đính kèm JWT)
 * @param {{ message: string, history: Array }} data
 * @returns {{ success: boolean, data: { reply: string, actionCard: Object|null, quickReplies: Array } }}
 */
export const sendAdminMessageAPI = async ({ message, history }) => {
  const token = localStorage.getItem('accessToken')

  const response = await axios.post(`${API_ROOT}/v1/chat/admin`, {
    message,
    history
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 60000
  })
  return response.data
}

/**
 * Lấy lịch sử chat
 * @param {{ sessionId?: string }} params — sessionId cho customer, bỏ trống cho admin (dùng JWT)
 * @returns {{ success: boolean, data: { messages: Array, conversationId: string|null } }}
 */
export const getChatHistoryAPI = async ({ sessionId } = {}) => {
  const params = {}
  const headers = {}

  if (sessionId) {
    params.sessionId = sessionId
  } else {
    // Admin — đính kèm JWT
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await axios.get(`${API_ROOT}/v1/chat/history`, {
    params,
    headers,
    timeout: 15000
  })
  return response.data
}

/**
 * Xóa lịch sử chat
 * @param {{ sessionId?: string }} params — sessionId cho customer, bỏ trống cho admin (dùng JWT)
 * @returns {{ success: boolean, message: string }}
 */
export const clearChatHistoryAPI = async ({ sessionId } = {}) => {
  const params = {}
  const headers = {}

  if (sessionId) {
    params.sessionId = sessionId
  } else {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await axios.delete(`${API_ROOT}/v1/chat/history`, {
    params,
    headers,
    timeout: 15000
  })
  return response.data
}
