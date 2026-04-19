import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
      name: Joi.string().required().min(2).max(50).trim().messages({
        'any.required': 'Product name is required!',
        'string.empty': 'Product name cannot be empty!',
        'string.max': 'Product name must be less than or equal to 50 characters long',
        'string.min': 'Product name must be at least 2 characters long',
        'string.trim': 'Product name must not have leading or trailing whitespace'
      })
    })

    try {
      // Tự động xóa dấu cách thừa và xóa các trường không xác định
      const value = await correctCondition.validateAsync(req.body, { 
        abortEarly: false, 
        allowUnknown: true,
        stripUnknown: true 
      })
      // Gán lại dữ liệu đã được xử lý (trim, strip...) vào req.body
      req.body = value
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
  }

export const categoryValidation = {
  createNew
}