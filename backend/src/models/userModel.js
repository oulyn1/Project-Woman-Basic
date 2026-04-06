import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import bcrypt from 'bcrypt' // hoặc bcryptjs

const USER_COLLECTION_NAME = 'users'
// ✅ Schema validate
export const USER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().min(3).max(50).trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'employee', 'admin').default('customer'),
  phone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})
// ✅ Schema validate OTP
export const OTP_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  expiresAt: Joi.date().timestamp('javascript').required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// ✅ Tạo mới user (hash password trước khi lưu)
const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  const hashedPassword = await bcrypt.hash(validData.password, 10)
  validData.password = hashedPassword
  const result = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
  return result
}

// ✅ Tìm theo email (phục vụ login / check tồn tại)
const findByEmail = async (email) => {
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email })
}

// ✅ Tìm theo id
const findOneId = async (id) => {
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
}

// ✅ Cập nhật user (hash password nếu có thay đổi)
const updateOne = async (userId, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }
  const result = await GET_DB().collection(USER_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
  if (!result.value) {
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
  }
  return result.value
}

// ✅ (Tuỳ chọn) Lấy toàn bộ user
const getAll = async () => {
  return await GET_DB().collection(USER_COLLECTION_NAME).find().toArray()
}
const search = async (query) => {
  try {
    const regex = new RegExp(query, 'i')
    const result = await GET_DB().collection(USER_COLLECTION_NAME).find({ name: regex }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const employee = async (query) => {
  try {
    const regex = new RegExp(query, 'i')
    const result = await GET_DB().collection(USER_COLLECTION_NAME).find({ role: regex }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const searchemployee = async (query) => {
  try {
    const regex = new RegExp(query, 'i')
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .find({
        $and: [
          { role: 'employee' },
          { name: regex }
        ]
      })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const deleteOne = async (productId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(productId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const updateByEmail = async (email, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  const result = await GET_DB().collection(USER_COLLECTION_NAME)
    .findOneAndUpdate(
      { email },
      { $set: updateData },
      { returnDocument: 'after' }
    )
  if (!result.value) {
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email })
  }

  return result.value
}
const updateStatus = async (userId, updateData) => {
  const result = await GET_DB().collection(USER_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
  if (!result.value) {
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
  }
  return result.value
}
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findByEmail,
  findOneId,
  updateOne,
  getAll,
  search,
  deleteOne,
  getDetails,
  updateByEmail,
  updateStatus,
  employee,
  searchemployee
}
