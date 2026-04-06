import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const ORDER_COLLECTION_NAME = 'orders'

// Schema validate với Joi
export const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().allow(null, '').optional(),
  buyerInfo: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.string().required()
  }).required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  total: Joi.number().min(0).required(),
  status: Joi.string()
    .valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
    .default('pending'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(Date.now)
})

// Validate trước khi tạo
const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Tạo mới đơn hàng
const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  validData.userId = new ObjectId(validData.userId)
  validData.items = validData.items.map(item => ({
    ...item,
    productId: new ObjectId(item.productId)
  }))

  const createdOrder = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(validData)
  return createdOrder
}

// Lấy chi tiết đơn hàng
const getDetails = async (id) => {
  return await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
}

// Lấy chi tiết đơn hàng + thông tin sản phẩm
const getDetailsWithProducts = async (id) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).aggregate([
    { $match: { _id: new ObjectId(id) } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productData"
      }
    },
    { $unwind: "$productData" },
    {
      $group: {
        _id: "$_id",
        buyerInfo: { $first: "$buyerInfo" },
        status: { $first: "$status" },
        total: { $first: "$total" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        items: {
          $push: {
            productId: "$items.productId",
            quantity: "$items.quantity",
            price: "$items.price",
            product: "$productData"
          }
        }
      }
    }
  ]).toArray()

  return result[0] || null
}

const getAllWithProducts = async (filter = {}) => {
  if (filter.userId) filter.userId = new ObjectId(filter.userId)

  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).aggregate([
    { $match: filter },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productData"
      }
    },
    { $unwind: "$productData" },
    {
      $group: {
        _id: "$_id",
        userId: { $first: "$userId" },
        buyerInfo: { $first: "$buyerInfo" },
        status: { $first: "$status" },
        total: { $first: "$total" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        items: {
          $push: {
            productId: "$items.productId",
            quantity: "$items.quantity",
            price: "$items.price",
            product: "$productData"
          }
        }
      }
    }
  ]).toArray()

  return result
}

// Các function khác giữ nguyên
const getAll = async (filter = {}) => {
  if (filter.userId) filter.userId = new ObjectId(filter.userId)
  return await GET_DB().collection(ORDER_COLLECTION_NAME).find(filter).toArray()
}

const deleteOne = async (orderId) => {
  return await GET_DB().collection(ORDER_COLLECTION_NAME).deleteOne({ _id: new ObjectId(orderId) })
}

export const search = async (query) => {
  const regex = new RegExp(query, 'i')
  const orders = await GET_DB().collection(ORDER_COLLECTION_NAME).find({
    $or: [
      { 'buyerInfo.name': regex },
      { 'buyerInfo.email': regex },
      { status: regex }
    ]
  }).toArray()

  // Không throw lỗi, trả về mảng rỗng nếu không có kết quả
  return orders || []
}

const updateOne = async (orderId, updateData) => {
  updateData.updatedAt = Date.now()
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    { $set: updateData },
    { returnDocument: 'after' }
  )
  return result || null
}

export const searchByUser = async (userId, query) => {
  const regex = new RegExp(query, 'i')

  const orders = await GET_DB().collection(ORDER_COLLECTION_NAME).find({
    userId: new ObjectId(userId),
    $or: [
      { 'buyerInfo.name': regex },
      { 'buyerInfo.email': regex },
      { status: regex }
    ]
  }).toArray()

  return orders || []
}

export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA,
  createNew,
  getDetails,
  getDetailsWithProducts,
  getAllWithProducts,
  getAll,
  deleteOne,
  search,
  updateOne,
  searchByUser
}
