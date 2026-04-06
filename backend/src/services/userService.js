import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendMail } from '~/services/mailService'
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret' // 🔑 Đặt trong .env
// 🔑 Cache OTP trong RAM
const otpCache = new Map()

// ✅ Đăng ký
const register = async (data) => {
  const existed = await userModel.findByEmail(data.email)
  if (existed) throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại')

  const createdUser = await userModel.createNew(data)
  const newUser = await userModel.findOneId(createdUser.insertedId)

  // Ẩn password trước khi trả về
  delete newUser.password
  return newUser
}

// ✅ Đăng nhập
const login = async (email, password) => {
  const user = await userModel.findByEmail(email)
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Sai email hoặc mật khẩu')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Sai email hoặc mật khẩu')
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  delete user.password
  return { token, user }
}

// ✅ Lấy thông tin user
const getProfile = async (userId) => {
  const user = await userModel.findOneId(userId)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  delete user.password
  return user
}

// ✅ Cập nhật user
const updateProfile = async (userId, updateData) => {
  updateData.updatedAt = Date.now()
  const updatedUser = await userModel.updateOne(userId, updateData)
  if (!updatedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  delete updatedUser.password
  return updatedUser
}
const search = async (name) => {
  try {
    const products = await userModel.search(name)
    if (!products) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Account found matching your query')
    }
    return products
  } catch (error) {
    throw error
  }
}
const employee = async (name) => {
  try {
    const products = await userModel.employee(name)
    if (!products) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Account found matching your query')
    }
    return products
  } catch (error) {
    throw error
  }
}
const searchEmployee = async (name) => {
  try {
    const products = await userModel.searchemployee(name)
    if (!products) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Account found matching your query')
    }
    return products
  } catch (error) {
    throw error
  }
}
const getAll = async () => {
  try {
    const products = await userModel.getAll()
    if (!products) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No users found')
    }
    return products
  } catch (error) {
    throw error
  }
}
const createUser = async (data) => {
  const existed = await userModel.findByEmail(data.email)
  if (existed) throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại')

  // Nếu admin tạo user mà chưa set password thì gán mật khẩu mặc định
  if (!data.password) {
    data.password = '123456'
  }
  data.role = data.role || 'user' // gán role mặc định nếu chưa có
  const createdUser = await userModel.createNew(data)
  const newUser = await userModel.findOneId(createdUser.insertedId)
  delete newUser.password
  return newUser
}
const deleteOne = async (productId) => {
  try {
    const result = await userModel.deleteOne(productId)
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No users found')
    }
    return result
  } catch (error) {
    throw error
  }
}
const getDetails = async (productId) => {
  try {
    const product = await userModel.getDetails(productId)

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    return product
  } catch (error) {
    throw error
  }
}
// Check email tồn tại
const checkEmail = async (email) => {
  const user = await userModel.findByEmail(email)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại')
  return true
}

// Gửi OTP
const sendOtp = async (email) => {
  const user = await userModel.findByEmail(email)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại')

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  otpCache.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 })

  await sendMail(
    email,
    'Mã OTP khôi phục mật khẩu:',
    `Xin chào,\n\nMã OTP của bạn là: ${otp}\nVui lòng nhập mã này trong vòng 5 phút.\n\nCảm ơn bạn đã sử dụng dịch vụ!`
  )

  return { message: 'OTP đã được gửi qua email' }
}

// Xác minh OTP
const verifyOtp = async (email, otp) => {
  const data = otpCache.get(email)
  if (!data) throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP không tồn tại hoặc đã hết hạn')

  if (Date.now() > data.expiresAt) {
    otpCache.delete(email)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP đã hết hạn')
  }

  if (otp !== data.otp) throw new ApiError(StatusCodes.UNAUTHORIZED, 'OTP không đúng')
  return { message: 'OTP hợp lệ' }
}

// Reset mật khẩu
const resetPassword = async (email, newPassword) => {
  const updatedUser = await userModel.updateByEmail(email, { password: newPassword })
  if (!updatedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')

  otpCache.delete(email)
  return { message: 'Mật khẩu đã được đổi thành công' }
}
const updateStatus = async (userId, updateData) => {
  const updatedUser = await userModel.updateOne(userId, updateData)
  if (!updatedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  delete updatedUser.password
  return updatedUser
}
const logOut = async (userId) => {
  await userModel.updateStatus(userId, { status: 'offline' })
}
const logIn = async (userId) => {
  await userModel.updateStatus(userId, { status: 'online' })
}
export const userService = {
  register,
  login,
  getProfile,
  updateProfile,
  search,
  getAll,
  createUser,
  deleteOne,
  getDetails,
  checkEmail,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateStatus,
  logOut,
  logIn,
  employee,
  searchEmployee
}
