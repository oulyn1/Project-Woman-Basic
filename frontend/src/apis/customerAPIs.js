import axios from 'axios'
import { API_ROOT } from '../util/constants'

export const fetchCustomersAPI = async (token) => {
  const res = await axios.get(`${API_ROOT}/v1/customers`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  return res.data
}

export const searchCustomersAPI = async (q, token) => {
  const res = await axios.get(`${API_ROOT}/v1/customers/search?q=${encodeURIComponent(q)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  return res.data
}

export const getCustomerDetailAPI = async (id, token) => {
  const res = await axios.get(`${API_ROOT}/v1/customers/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  return res.data
}

export const getCustomerSummaryAPI = async (id, token) => {
  const res = await axios.get(`${API_ROOT}/v1/customers/${id}/summary`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  return res.data
}

export const getCustomerOrdersAPI = async (customerId, token) => {
  const res = await axios.get(
    `${API_ROOT}/v1/order?userId=${encodeURIComponent(customerId)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  )
  return res.data
}
