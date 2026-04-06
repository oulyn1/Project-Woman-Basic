import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const BRANCH_COLLECTION_NAME = 'branches'

// ❌ Đã bỏ lat/lng khỏi schema
export const BRANCH_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(2).max(255).trim().strict(),
  phone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  provinceCode: Joi.string().allow(''),
  districtCode: Joi.string().allow(''),
  services: Joi.array().items(Joi.string()).default([]),
  openingHours: Joi.string().allow(''),
  isActive: Joi.boolean().default(true),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  return await BRANCH_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const valid = await validateBeforeCreate(data)
    const created = await GET_DB().collection(BRANCH_COLLECTION_NAME).insertOne(valid)
    return created
  } catch (error) {
    if (error?.isJoi) {
      const msg = error.details?.map(d => d.message).join(', ') || 'Validation error'
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, msg)
    }
    throw error
  }
}

const findOneById = async (id) => {
  return await GET_DB().collection(BRANCH_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
}

const getAll = async () => {
  return await GET_DB().collection(BRANCH_COLLECTION_NAME).find().toArray()
}

const deleteOne = async (id) => {
  return await GET_DB().collection(BRANCH_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
}

const updateOne = async (id, updateData) => {
  const res = await GET_DB().collection(BRANCH_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  )
  if (!res.value) {
    return await GET_DB().collection(BRANCH_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  }
  return res.value
}

export const branchModel = {
  BRANCH_COLLECTION_NAME,
  BRANCH_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  deleteOne,
  updateOne
}
