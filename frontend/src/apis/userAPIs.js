import axios from 'axios'
import { API_ROOT } from '../util/constants'

export const registerUserAPI = async (userData) => {
  const request = await axios.post(`${API_ROOT}/v1/user/register`, userData)
  return request.data
}

export const loginUserAPI = async (loginData) => {
  const request = await axios.post(`${API_ROOT}/v1/user/login`, loginData)
  return request.data
}

export const getProfileAPI = async (token) => {
  const request = await axios.get(`${API_ROOT}/v1/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return request.data
}

export const updateUserAPI = async (updateData, token) => {
  const request = await axios.put(`${API_ROOT}/v1/user/profile`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return request.data
}
export const updateAccountAPI = async (id, updateData, token) => {
  const request = await axios.put(`${API_ROOT}/v1/user/${id}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return request.data
}
export const searchUserAPI = async (query, token) => {
  const request = await axios.get(`${API_ROOT}/v1/user/search?name=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return request.data
}
export const AllUsersAPI = async (token) => {
  const request = await axios.get(`${API_ROOT}/v1/user/`, { headers: {
    Authorization: `Bearer ${token}`
  }
  })
  return request.data
}
export const AllEmployeeAPI = async (token) => {
  const request = await axios.get(`${API_ROOT}/v1/user/employee?role=employee`, { headers: {
    Authorization: `Bearer ${token}`
  }
  })
  return request.data
}
export const searchEmployeeAPI = async (query, token) => {
  const request = await axios.get(`${API_ROOT}/v1/user/employee/search?name=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return request.data
}
export const createUserAPI = async (userData, token) => {
  const response = await axios.post(`${API_ROOT}/v1/user/`, userData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}
export const deleteUserAPI = async (userId) => {
  const request = await axios.delete(`${API_ROOT}/v1/user/${userId}`)
  return request.data
}
export const getUserDetailAPI = async (userId) => {
  const request = await axios.get(`${API_ROOT}/v1/user/${userId}`)
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
