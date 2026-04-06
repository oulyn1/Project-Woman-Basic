import { StatusCodes } from "http-status-codes"
import { promotionService } from "~/services/promotionService"

const createNew = async (req, res, next) => {
  try {
    console.log('REQ BODY:', req.body)
    const created = await promotionService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(created)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const promotions = await promotionService.getAll()
    res.status(StatusCodes.OK).json(promotions)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const promotion = await promotionService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(promotion)
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const result = await promotionService.deleteOne(req.params.id)
    res.status(StatusCodes.OK).json({
      message: "Promotion deleted successfully",
      deletedCount: result.deletedCount
    })
  } catch (error) {
    next(error)
  }
}

const updateOne = async (req, res, next) => {
  try {
    const updated = await promotionService.updateOne(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

export const promotionController = {
  createNew,
  getAll,
  getDetails,
  deleteOne,
  updateOne
}
