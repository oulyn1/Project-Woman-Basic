import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
      name: Joi.string().required().min(3).max(255).trim().strict().messages({
        'any.required': 'Product name is required!',
        'string.empty': 'Product name cannot be empty!',
        'string.max': 'Product name must be less than or equal to 50 characters long',
        'string.min': 'Product name must be at least 3 characters long',
        'string.trim': 'Product name must not have leading or trailing whitespace'
      }),
      description: Joi.string().required().min(3).max(1000).trim().strict().messages({
        'any.required': 'Description is required!',
        'string.empty': 'Description cannot be empty!',
        'string.max': 'Description must be less than or equal to 255 characters long',
        'string.min': 'Description must be at least 3 characters long'
      }),
      price: Joi.number().required().min(0).messages({
        'any.required': 'Price is required!',
        'number.base': 'Price must be a number',
        'number.min': 'Price must be greater than or equal to 0'
      }),
      stock: Joi.number().integer().min(0).default(0).messages({
        'number.base': 'Stock must be a number',
        'number.min': 'Stock must be greater than or equal to 0'
      }),
      image: Joi.string().uri().required().messages({
        'any.required': 'Image URL is required!',
        'string.uri': 'Image must be a valid URL'
      }),
      material: Joi.string().required().min(3).trim().strict().messages({
        'any.required': 'Image URL is required!'
      }),
      categoryId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'any.required': 'Category ID is required!',
        'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId (24 hex chars)'
      })
    })

    try {
      await correctCondition.validateAsync(req.body, { abortEarly: false })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
  }

export const productValidation = {
  createNew
}