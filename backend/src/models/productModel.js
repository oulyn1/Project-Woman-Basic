import Joi from "joi"
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from "~/config/mongodb"

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  name: Joi.string().required().min(3).max(255).trim(),
  slug: Joi.string().required().min(3).trim(),
  description: Joi.string().required().min(3).max(1000).trim(),
  price: Joi.number().required().min(0),
  sold: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().uri()).required(),
  tags: Joi.array().items(Joi.string().trim()).default([]),

  variants: Joi.array().items(Joi.object({
    _id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL').required(),
    color: Joi.object({
      name: Joi.string().required().trim(),
      hex: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required()
    }).required(),
    stock: Joi.number().integer().min(0).required(),
    sku: Joi.string().required().trim()
  })).required(),

  isDeleted: Joi.boolean().default(false),
  deletedAt: Joi.date().timestamp('javascript').default(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(Date.now)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false, stripUnknown: true })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // Convert string IDs to ObjectIds
    const insertData = {
      ...validData,
      categoryId: new ObjectId(validData.categoryId),
      variants: validData.variants.map(v => ({
        ...v,
        _id: new ObjectId(v._id)
      }))
    }
    const createdProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(insertData)
    return createdProduct
  } catch (error) {
    throw error
  }
}

const findOneId = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw error
  }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw error
  }
}

const getDetailsBySlug = async (slug) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      slug: slug,
      isDeleted: { $ne: true }
    })
    return result
  } catch (error) {
    throw error
  }
}

const findWithPagination = async ({ filter, sort, page, limit }) => {
  try {
    const query = { ...filter, isDeleted: { $ne: true } }
    const skip = (page - 1) * limit

    const products = await GET_DB().collection(PRODUCT_COLLECTION_NAME)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await GET_DB().collection(PRODUCT_COLLECTION_NAME).countDocuments(query)

    return { products, total }
  } catch (error) {
    throw error
  }
}

const updateOne = async (productId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.categoryId) updateData.categoryId = new ObjectId(updateData.categoryId)
    updateData.updatedAt = Date.now()

    const result = await GET_DB()
      .collection(PRODUCT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    return result.value || result
  } catch (error) {
    throw error
  }
}

const updateVariantStock = async (productId, variantId, quantity) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(productId),
        variants: {
          $elemMatch: {
            _id: new ObjectId(variantId),
            stock: { $gte: quantity }
          }
        }
      },
      {
        $inc: {
          "variants.$.stock": -quantity,
          sold: quantity
        }
      },
      { returnDocument: 'after' }
    )
    return result.value || result
  } catch (error) {
    throw error
  }
}

const softDelete = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: Date.now()
        } 
      },
      { returnDocument: 'after' }
    )
    return result.value || result
  } catch (error) {
    throw error
  }
}

const createIndexes = async () => {
  const db = GET_DB().collection(PRODUCT_COLLECTION_NAME)
  await db.createIndex({ slug: 1 }, { unique: true })
  await db.createIndex({ categoryId: 1 })
  await db.createIndex({ price: 1 })
  await db.createIndex({ sold: -1 })
  await db.createIndex({ createdAt: -1 })
  await db.createIndex({ name: "text", description: "text", tags: "text" })
  await db.createIndex({
    "variants.size": 1,
    "variants.color.hex": 1,
    "variants.stock": 1
  })
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  findOneId,
  getDetails,
  getDetailsBySlug,
  findWithPagination,
  updateOne,
  updateVariantStock,
  softDelete,
  createIndexes
}