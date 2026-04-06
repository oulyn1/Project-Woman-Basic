import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from "~/config/mongodb"

const CATEGORY_COLLECTION_NAME = 'category'
export const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(2).max(50).trim().strict(),
  slug: Joi.string().required().min(2).trim().strict(),
  parentId: Joi.string().allow(null).default(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdCategory = await GET_DB().collection(CATEGORY_COLLECTION_NAME).insertOne(validData)
    return createdCategory
  } catch (error) {
    throw new Error(error)
  }
}

const findOneId = async (id) => {
  try {
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).find().toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOne = async (categoryId) => {
  try {
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(categoryId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const search = async (query) => {
  try {
    const regex = new RegExp(query, 'i')
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).find({ name: regex }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateOne = async (categoryId, updateData) => {
  try {
    const result = await GET_DB()
      .collection(CATEGORY_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(categoryId) },
        { $set: updateData },
        { returnDocument: 'after' } // đảm bảo trả về doc sau update
      )

    if (!result.value) {
      // Trường hợp update ok nhưng không trả về document -> fallback gọi findOne
      return await GET_DB()
        .collection(CATEGORY_COLLECTION_NAME)
        .findOne({ _id: new ObjectId(categoryId) })
    }

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}


export const categoryModel = {
  CATEGORY_COLLECTION_NAME,
  CATEGORY_COLLECTION_SCHEMA,
  createNew,
  findOneId,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne
}