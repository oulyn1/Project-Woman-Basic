import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// ✅ Đăng ký
const register = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Tên người dùng là bắt buộc',
      'string.empty': 'Tên người dùng không được để trống',
      'string.min': 'Tên phải ít nhất 3 ký tự',
      'string.max': 'Tên tối đa 50 ký tự',
      'string.trim': 'Tên không được có khoảng trắng đầu/cuối'
    }),
    email: Joi.string().email().required().trim().strict().messages({
      'any.required': 'Email là bắt buộc',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'string.trim': 'Email không được có khoảng trắng đầu/cuối'
    }),
    password: Joi.string().min(6).required().messages({
      'any.required': 'Mật khẩu là bắt buộc',
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải ít nhất 6 ký tự'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

// ✅ Đăng nhập
const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().strict().messages({
      'any.required': 'Email là bắt buộc',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mật khẩu là bắt buộc',
      'string.empty': 'Mật khẩu không được để trống'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const userValidation = {
  register,
  login
}
