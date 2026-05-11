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
 * @param {{ message: string, history: Array, conversationId?: string }} data
 * @returns {{ success: boolean, data: { reply: string, conversationId: string, actionCard: Object|null, quickReplies: Array } }}
 */
export const sendAdminMessageAPI = async ({ message, history, conversationId }) => {
  const token = localStorage.getItem('accessToken')

  const response = await axios.post(`${API_ROOT}/v1/chat/admin`, {
    message,
    history,
    conversationId
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
 * @param {{ sessionId?: string, conversationId?: string }} params — sessionId cho customer, conversationId cho admin
 * @returns {{ success: boolean, data: { messages: Array, conversationId: string|null } }}
 */
export const getChatHistoryAPI = async ({ sessionId, conversationId } = {}) => {
  const params = {}
  const headers = {}

  if (sessionId) {
    params.sessionId = sessionId
  }
  
  if (conversationId) {
    params.conversationId = conversationId
  }

  // Admin/Staff - đính kèm JWT nếu có
  const token = localStorage.getItem('accessToken')
  if (token) {
    headers.Authorization = `Bearer ${token}`
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
 * @param {{ sessionId?: string, conversationId?: string }} params
 * @returns {{ success: boolean, message: string }}
 */
export const clearChatHistoryAPI = async ({ sessionId, conversationId } = {}) => {
  const params = {}
  const headers = {}

  if (sessionId) {
    params.sessionId = sessionId
  }

  if (conversationId) {
    params.conversationId = conversationId
  }

  const token = localStorage.getItem('accessToken')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await axios.delete(`${API_ROOT}/v1/chat/history`, {
    params,
    headers,
    timeout: 15000
  })
  return response.data
}

/**
 * Lấy danh sách các phiên chat của admin
 * @returns {{ success: boolean, data: Array<{ _id: string, title: string, updatedAt: string }> }}
 */
export const getAdminConversationsAPI = async () => {
  const token = localStorage.getItem('accessToken')
  const response = await axios.get(`${API_ROOT}/v1/chat/admin/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}
