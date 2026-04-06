import axios from 'axios'
import { API_ROOT } from '../util/constants'

// ✅ Tạo ca làm mới
export const createShiftAPI = async (shiftData) => {
  const response = await axios.post(`${API_ROOT}/v1/workshift/`, shiftData)
  return response.data
}

// ✅ Lấy tất cả ca làm
export const getAllShiftsAPI = async () => {
  const response = await axios.get(`${API_ROOT}/v1/workshift/`)
  return response.data
}

// ✅ Lấy chi tiết ca làm theo ID
export const getShiftDetailsAPI = async (shiftId) => {
  const response = await axios.get(`${API_ROOT}/v1/workshift/${shiftId}`)
  return response.data
}

// ✅ Chốt ca làm
export const closeShiftAPI = async (shiftId) => {
  const response = await axios.post(`${API_ROOT}/v1/workshift/${shiftId}/close`)
  return response.data
}

// ✅ Lấy tất cả ca làm của 1 nhân viên
export const getShiftsByEmployeeAPI = async (employeeId) => {
  const response = await axios.get(`${API_ROOT}/v1/workshift/employee/${employeeId}`)
  return response.data
}

// ✅ Lấy ca làm của 1 nhân viên theo tháng
export const getShiftsByEmployeeAndMonthAPI = async (employeeId, year, month) => {
  const response = await axios.get(`${API_ROOT}/v1/workshift/employee/${employeeId}/${year}/${month}`)
  return response.data
}
