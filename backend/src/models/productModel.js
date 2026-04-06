import Joi from "joi"
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from "~/config/mongodb"

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(255).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().max(1000).trim().strict().allow(''),
  price: Joi.number().required().min(0),
  stock: Joi.number().integer().min(0).default(0),
  image: Joi.string().uri().required(),
  sold: Joi.number().integer().min(0).default(0),
  material: Joi.string().required().min(3).trim().strict(),
  // Tham chiếu đến Category
  categoryId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .default(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(validData)
    return createdProduct
  } catch (error) {
    throw new Error(error)
  }
}

const findOneId = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find().toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOne = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(productId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const search = async (query) => {
  try {
    const regex = new RegExp(query, 'i')
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({ name: regex }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateOne = async (productId, updateData) => {
  try {
    const result = await GET_DB()
      .collection(PRODUCT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updateData },
        { returnDocument: 'after' } // đảm bảo trả về doc sau update
      )

    if (!result.value) {
      // Trường hợp update ok nhưng không trả về document -> fallback gọi findOne
      return await GET_DB()
        .collection(PRODUCT_COLLECTION_NAME)
        .findOne({ _id: new ObjectId(productId) })
    }

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const decreaseStock = async (productId, quantity) => {
  const result = await GET_DB().collection('products').findOneAndUpdate(
    {
      _id: new ObjectId(productId),
      stock: { $gte: quantity } // chỉ cập nhật nếu còn đủ hàng
    },
    {
      $inc: {
        stock: -quantity, // trừ tồn kho
        sold: quantity     // tăng số lượng đã bán
      }
    },
    { returnDocument: 'after' }
  )

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Số lượng sản phẩm không đủ')
  }

  return result
}



export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  findOneId,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne,
  decreaseStock
}