import Joi from "joi"
import { ObjectId } from "mongodb"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"
import { GET_DB } from "~/config/mongodb"

const PROMOTION_COLLECTION_NAME = "promotions"

const PROMOTION_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(255).trim().strict(),
  description: Joi.string().max(1000).trim().allow(""),
  discountPercent: Joi.number().required().min(0).max(100),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),

  productIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null)
})

const validateBeforeCreate = async (data) => {
  return await PROMOTION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const created = await GET_DB().collection(PROMOTION_COLLECTION_NAME).insertOne(validData)
    return created
  } catch (error) {
    throw new Error(error)
  }
}

const findOneId = async (id) => {
  try {
    const result = await GET_DB()
      .collection(PROMOTION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB().collection(PROMOTION_COLLECTION_NAME).find().toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOne = async (promotionId) => {
  try {
    const result = await GET_DB()
      .collection(PROMOTION_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(promotionId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateOne = async (promotionId, updateData) => {
  try {
    const result = await GET_DB()
      .collection(PROMOTION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(promotionId) },
        { $set: updateData },
        { returnDocument: "after" }
      )

    if (!result.value) {
      return await GET_DB()
        .collection(PROMOTION_COLLECTION_NAME)
        .findOne({ _id: new ObjectId(promotionId) })
    }

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

export const promotionModel = {
  PROMOTION_COLLECTION_NAME,
  PROMOTION_COLLECTION_SCHEMA,
  createNew,
  findOneId,
  getAll,
  deleteOne,
  updateOne
}
