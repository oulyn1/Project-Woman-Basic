import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
      categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
      name: Joi.string().required().min(3).max(255).trim(),
      description: Joi.string().required().min(3).max(1000).trim(),
      price: Joi.number().required().min(0),
      images: Joi.array().items(Joi.string().uri()).min(1).required(),
      tags: Joi.array().items(Joi.string().trim()).default([]),

      variants: Joi.array().items(Joi.object({
        size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL').required(),
        color: Joi.object({
          name: Joi.string().required().trim(),
          hex: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required()
        }).required(),
        stock: Joi.number().integer().min(0).required()
      })).min(1).required()
    })

    try {
      const value = await correctCondition.validateAsync(req.body, { 
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
      })
      req.body = value
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
  }

const updateOne = async (req, res, next) => {
  const correctCondition = Joi.object({
    categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    name: Joi.string().min(3).max(255).trim(),
    description: Joi.string().min(3).max(1000).trim(),
    price: Joi.number().min(0),
    images: Joi.array().items(Joi.string().uri()).min(1),
    tags: Joi.array().items(Joi.string().trim()),
    isDeleted: Joi.boolean()
  })

  try {
    const value = await correctCondition.validateAsync(req.body, { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    })
    req.body = value
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const productValidation = {
  createNew,
  updateOne
}