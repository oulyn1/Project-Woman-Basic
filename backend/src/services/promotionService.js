import { promotionModel } from "~/models/promotionModel"
import ApiError from "~/utils/ApiError"
import { StatusCodes } from "http-status-codes"

const createNew = async (reqBody) => {
  try {
    if (new Date(reqBody.startDate) >= new Date(reqBody.endDate)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu")
    }
    const created = await promotionModel.createNew(reqBody)
    const newPromotion = await promotionModel.findOneId(created.insertedId)
    return newPromotion
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  try {
    const promotions = await promotionModel.getAll()
    return promotions
  } catch (error) {
    throw error
  }
}

const getDetails = async (promotionId) => {
  try {
    const promotion = await promotionModel.findOneId(promotionId)
    if (!promotion) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Promotion not found")
    }
    return promotion
  } catch (error) {
    throw error
  }
}

const deleteOne = async (promotionId) => {
  try {
    const result = await promotionModel.deleteOne(promotionId)
    if (!result.deletedCount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Promotion not found to delete")
    }
    return result
  } catch (error) {
    throw error
  }
}

const updateOne = async (promotionId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updated = await promotionModel.updateOne(promotionId, updateData)
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Promotion not found to update")
    }
    return updated
  } catch (error) {
    throw error
  }
}

export const promotionService = {
  createNew,
  getAll,
  getDetails,
  deleteOne,
  updateOne
}
