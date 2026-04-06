import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
      name: Joi.string().required().min(2).max(50).trim().strict().messages({
        'any.required': 'Product name is required!',
        'string.empty': 'Product name cannot be empty!',
        'string.max': 'Product name must be less than or equal to 50 characters long',
        'string.min': 'Product name must be at least 3 characters long',
        'string.trim': 'Product name must not have leading or trailing whitespace'
      }),
      parentId: Joi.string().allow(null).messages({
      'string.base': 'parentId must be a string',
    })
    })

    try {
      await correctCondition.validateAsync(req.body, { abortEarly: false })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
  }

export const categoryValidation = {
  createNew
}