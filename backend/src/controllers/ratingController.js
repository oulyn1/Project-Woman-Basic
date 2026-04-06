import { StatusCodes } from 'http-status-codes'
import { ratingService } from '~/services/ratingService.js'

// Thêm đánh giá mới
const addRating = async (req, res, next) => {
  try {
    const ratingData = req.body
    const result = await ratingService.addRating(ratingData)
    res.status(StatusCodes.CREATED).json({
      message: 'Đánh giá đã được thêm thành công!',
      ratingId: result.insertedId
    })
  } catch (error) {
    next(error)
  }
}

// Lấy tất cả đánh giá
const getAllRatings = async (req, res, next) => {
  try {
    const ratings = await ratingService.getAllRatings()
    res.status(StatusCodes.OK).json(ratings)
  } catch (error) {
    next(error)
  }
}

// Tìm đánh giá theo tên sản phẩm
const searchByProductName = async (req, res, next) => {
  try {
    const { productName } = req.query
    if (!productName || productName.trim() === '') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Query "productName" is required' })
    }
    const ratings = await ratingService.findByProductName(productName.trim())
    res.status(StatusCodes.OK).json(ratings)
  } catch (error) {
    next(error)
  }
}

// Lấy chi tiết đánh giá theo id
const getRatingById = async (req, res, next) => {
  try {
    const rating = await ratingService.updateOne(req.params.id)
    res.status(StatusCodes.OK).json(rating)
  } catch (error) {
    next(error)
  }
}
// Xoá đánh giá theo id
const deleteRating = async (req, res, next) => {
  try {
    const result = await ratingService.deleteRating(req.params.id)
    res.status(StatusCodes.OK).json({
      message: 'Đánh giá đã được xoá',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    next(error)
  }
}
const getRatingsByProductId = async (req, res, next) => {
    try {
      const { productId } = req.params
      const ratings = await ratingService.getRatingsByProductId(productId)
      res.status(StatusCodes.OK).json(ratings)
    } catch (error) {
      next(error)
    }
  }

export const ratingController = {
  addRating,
  getAllRatings,
  searchByProductName,
  getRatingById,
  deleteRating,
  getRatingsByProductId
}