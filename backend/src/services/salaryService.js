import { salaryModel } from '~/models/salaryModel'

// Tạo lương mới
const createSalary = async (data) => {
  try {
    // Tự tính netSalary nếu chưa có
    const netSalary = (data.totalHours * data.hourlyRate) + (data.bonus || 0) - (data.deduction || 0)

    const salaryData = {
      ...data,
      netSalary
    }

    const result = await salaryModel.createSalary(salaryData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy lương theo nhân viên và tháng
const getSalaryByEmployeeAndMonth = async (employeeId, workDate) => {
  try {
    const salary = await salaryModel.getSalaryByEmployeeAndMonth(employeeId, workDate)
    if (!salary) {
      throw new Error('Không tìm thấy bảng lương')
    }
    return salary
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa lương
const deleteSalary = async (salaryId) => {
  try {
    const deleted = await salaryModel.deleteSalary(salaryId)
    if (!deleted) {
      throw new Error('Bảng lương không tồn tại')
    }
    return deleted
  } catch (error) {
    throw new Error(error)
  }
}

export const salaryService = {
  createSalary,
  getSalaryByEmployeeAndMonth,
  deleteSalary
}
