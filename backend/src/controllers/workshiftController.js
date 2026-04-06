import { StatusCodes } from 'http-status-codes'
import { workShiftService } from '~/services/workshiftService'

// ✅ Tạo ca làm mới
const createShift = async (req, res, next) => {
  try {
    const shift = await workShiftService.createShift(req.body)
    res.status(StatusCodes.CREATED).json(shift)
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy tất cả ca làm
const getAllShifts = async (req, res, next) => {
  try {
    const shifts = await workShiftService.getAllShifts()
    res.status(StatusCodes.OK).json(shifts)
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy chi tiết ca làm theo ID
const getShiftDetails = async (req, res, next) => {
  try {
    const shift = await workShiftService.getShiftDetails(req.params.id)
    res.status(StatusCodes.OK).json(shift)
  } catch (error) {
    next(error)
  }
}

// ✅ Chốt ca làm
const closeShift = async (req, res, next) => {
  try {
    const shift = await workShiftService.closeShift(req.params.id)
    res.status(StatusCodes.OK).json({
      message: 'Ca làm đã được chốt thành công',
      shift
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy tất cả ca làm của 1 nhân viên
const getShiftsByEmployee = async (req, res, next) => {
  try {
    const shifts = await workShiftService.getShiftsByEmployee(req.params.employeeId)
    res.status(StatusCodes.OK).json(shifts)
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy ca làm của 1 nhân viên theo tháng
const getShiftsByEmployeeAndMonth = async (req, res, next) => {
  try {
    const { employeeId, year, month } = req.params
    const shifts = await workShiftService.getShiftsByEmployeeAndMonth(employeeId, parseInt(year), parseInt(month))
    res.status(StatusCodes.OK).json(shifts)
  } catch (error) {
    next(error)
  }
}

export const workShiftController = {
  createShift,
  getAllShifts,
  getShiftDetails,
  closeShift,
  getShiftsByEmployee,
  getShiftsByEmployeeAndMonth
}
