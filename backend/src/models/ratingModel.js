import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'

// Tên collection
const RATING_COLLECTION_NAME = 'ratings'

// Schema validate
export const RATING_COLLECTION_SCHEMA = Joi.object({
  productId: Joi.string().required(),
  productName: Joi.string().min(1).max(100).required(),
  image: Joi.string().uri().allow(''), // URL ảnh, có thể để trống
  star: Joi.number().min(1).max(5).required(), // số sao từ 1-5
  description: Joi.string().max(500).required(), // mô tả có thể để trống
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
})

const validateBeforeCreate = async (data) => {
  return await RATING_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Tạo rating mới
const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  const result = await GET_DB().collection(RATING_COLLECTION_NAME).insertOne(validData)
  return result
}

// Lấy tất cả rating
const getAll = async () => {
  return await GET_DB().collection(RATING_COLLECTION_NAME).find().toArray()
}

// Tìm rating theo productName
const searchByProductName = async (productName) => {
    try {
      const regex = new RegExp(productName, 'i') // 'i' để không phân biệt hoa thường
      const result = await GET_DB()
        .collection(RATING_COLLECTION_NAME)
        .find({ productName: regex })
        .toArray()
      return result
    } catch (error) {
      throw new Error(error)
    }
  }
// Tìm rating theo productName
const findOneId = async (id) => {
    return await GET_DB().collection(RATING_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  }
// Cập nhật rating theo _id
import { ObjectId } from 'mongodb'
const updateOne = async (id, updateData) => {
  const result = await GET_DB().collection(RATING_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
  return result.value
}

// Xoá rating theo _id
const deleteOne = async (id) => {
  const result = await GET_DB().collection(RATING_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
  return result
}

const findByProductId = async (productId) => {
    return await GET_DB().collection(RATING_COLLECTION_NAME).find({ productId }).toArray()
  }
  
export const ratingModel = {
  RATING_COLLECTION_NAME,
  RATING_COLLECTION_SCHEMA,
  createNew,
  getAll,
  searchByProductName,
  updateOne,
  deleteOne,
  findOneId,
  findByProductId
}
