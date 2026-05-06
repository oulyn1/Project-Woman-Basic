import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Kiểm tra quyền Admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này (Yêu cầu Admin)'))
}

// Kiểm tra quyền Nhân viên hoặc Admin
export const isStaff = (req, res, next) => {
  const staffRoles = ['admin', 'employee']
  if (req.user && staffRoles.includes(req.user.role)) {
    return next()
  }
  return next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập khu vực này'))
}
