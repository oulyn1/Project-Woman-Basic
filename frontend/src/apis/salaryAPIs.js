import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Tạo bảng lương mới
export const createSalaryAPI = async (salaryData) => {
  const response = await axios.post(`${API_ROOT}/v1/salary`, salaryData)
  return response.data
}

// Lấy lương theo nhân viên và tháng (YYYY-MM)
export const getSalaryByEmployeeAndMonthAPI = async (employeeId, workDate) => {
  const response = await axios.get(`${API_ROOT}/v1/salary/${employeeId}/${workDate}`)
  return response.data
}

// Xóa bảng lương theo ID
export const deleteSalaryAPI = async (salaryId) => {
  const response = await axios.delete(`${API_ROOT}/v1/salary/${salaryId}`)
  return response.data
}
