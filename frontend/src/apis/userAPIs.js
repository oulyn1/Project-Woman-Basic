import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

export const registerUserAPI = async (userData) => {
  const request = await axios.post(`${API_ROOT}/v1/user/register`, userData)
  return request.data
}

export const loginUserAPI = async (loginData) => {
  const request = await axios.post(`${API_ROOT}/v1/user/login`, loginData)
  return request.data
}

export const getProfileAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/user/profile`, getAuthHeaders())
  return request.data
}

export const updateUserAPI = async (updateData) => {
  const request = await axios.put(`${API_ROOT}/v1/user/profile`, updateData, getAuthHeaders())
  return request.data
}

export const updateAccountAPI = async (id, updateData) => {
  const request = await axios.put(`${API_ROOT}/v1/user/${id}`, updateData, getAuthHeaders())
  return request.data
}

export const searchUserAPI = async (query) => {
  const request = await axios.get(`${API_ROOT}/v1/user/search?name=${query}`, getAuthHeaders())
  return request.data
}

export const AllUsersAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/user/`, getAuthHeaders())
  return request.data
}

export const AllEmployeeAPI = async () => {
  const request = await axios.get(`${API_ROOT}/v1/user/employee?role=employee`, getAuthHeaders())
  return request.data
}

export const searchEmployeeAPI = async (query) => {
  const request = await axios.get(`${API_ROOT}/v1/user/employee/search?name=${query}`, getAuthHeaders())
  return request.data
}

export const createUserAPI = async (userData) => {
  const response = await axios.post(`${API_ROOT}/v1/user/`, userData, getAuthHeaders())
  return response.data
}

export const deleteUserAPI = async (userId) => {
  const request = await axios.delete(`${API_ROOT}/v1/user/${userId}`, getAuthHeaders())
  return request.data
}

export const getUserDetailAPI = async (userId) => {
  const request = await axios.get(`${API_ROOT}/v1/user/${userId}`, getAuthHeaders())
  return request.data
}
export const checkEmailAPI = async (email) => {
  const request = await axios.post(`${API_ROOT}/v1/user/check-email`, { email })
  return request.data
}

export const sendOtpAPI = async (email) => {
  const request = await axios.post(`${API_ROOT}/v1/user/send-otp`, { email })
  return request.data
}

export const verifyOtpAPI = async (email, otp) => {
  const request = await axios.post(`${API_ROOT}/v1/user/verify-otp`, { email, otp })
  return request.data
}

export const resetPasswordAPI = async (email, newPassword) => {
  const request = await axios.post(`${API_ROOT}/v1/user/reset-password`, {
    email,
    newPassword
  })
  return request.data
}
