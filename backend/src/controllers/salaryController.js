import { StatusCodes } from 'http-status-codes'
import { salaryService } from '~/services/salaryService'

// Tạo lương
const createSalary = async (req, res, next) => {
  try {
    const result = await salaryService.createSalary(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Tạo bảng lương thành công',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Lấy lương theo nhân viên và tháng
const getSalaryByEmployeeAndMonth = async (req, res, next) => {
  try {
    const { employeeId, workDate } = req.params
    const salary = await salaryService.getSalaryByEmployeeAndMonth(employeeId, workDate)
    res.status(StatusCodes.OK).json({
      message: 'Lấy bảng lương thành công',
      data: salary
    })
  } catch (error) {
    next(error)
  }
}

// Xóa lương
const deleteSalary = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await salaryService.deleteSalary(id)
    res.status(StatusCodes.OK).json({
      message: 'Xóa bảng lương thành công',
      data: deleted
    })
  } catch (error) {
    next(error)
  }
}

export const salaryController = {
  createSalary,
  getSalaryByEmployeeAndMonth,
  deleteSalary
}
