import { workShiftModel } from '~/models/workshiftModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// ✅ Tạo ca làm mới
const createShift = async (data) => {
  const createdShift = await workShiftModel.createNew(data)
  const newShift = await workShiftModel.findOneId(createdShift.insertedId)
  if (!newShift) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không tạo được ca làm')
  return {newShift}
}

// ✅ Lấy tất cả ca làm
const getAllShifts = async () => {
  const shifts = await workShiftModel.getAll()
  if (!shifts || shifts.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không có ca làm nào')
  }
  return shifts
}

// ✅ Lấy chi tiết ca làm theo ID
const getShiftDetails = async (shiftId) => {
  const shift = await workShiftModel.findOneId(shiftId)
  if (!shift) throw new ApiError(StatusCodes.NOT_FOUND, 'Ca làm không tồn tại')
  return shift
}

// ✅ Chốt ca làm
const closeShift = async (shiftId) => {
  const closedShift = await workShiftModel.closeShift(shiftId)
  if (!closedShift) throw new ApiError(StatusCodes.NOT_FOUND, 'Ca làm không tồn tại')
  return closedShift
}

// ✅ Tìm ca làm theo nhân viên
const getShiftsByEmployee = async (employeeId) => {
  const shifts = await workShiftModel.findByEmployeeId(employeeId)
  if (!shifts || shifts.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Nhân viên này chưa có ca làm nào')
  }
  return shifts
}

// ✅ Tìm ca làm theo tháng của nhân viên
const getShiftsByEmployeeAndMonth = async (employeeId, year, month) => {
  const shifts = await workShiftModel.findByEmployeeIdAndMonth(employeeId, year, month)
  if (!shifts || shifts.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không có ca làm nào trong tháng này')
  }
  return shifts
}

// ---------------------------
// Export service
// ---------------------------
export const workShiftService = {
  createShift,
  getAllShifts,
  getShiftDetails,
  closeShift,
  getShiftsByEmployee,
  getShiftsByEmployeeAndMonth
}
