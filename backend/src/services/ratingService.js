import { ratingModel } from '~/models/ratingModel.js'
import { orderModel } from '~/models/orderModel.js'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Thêm đánh giá mới
const addRating = async (data) => {
  if (data?.userId && data?.productId) {
    if (!data?.orderId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn phải đặt hàng và nhận hàng thành công mới có thể đánh giá')
    }

    const order = await orderModel.getDetails(data.orderId)
    if (!order || order.status !== 'delivered') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn chỉ được đánh giá các sản phẩm trong đơn hàng đã được nhận thành công (delivered)')
    }

    // Kiểm tra sản phẩm có trong đơn hàng không
    const itemInOrder = (order.items || []).some(
      (item) => item.productId?.toString() === data.productId?.toString()
    )
    if (!itemInOrder) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Sản phẩm này không có trong đơn hàng đã chọn')
    }

    const existing = await ratingModel.findByComposite(data.userId, data.orderId, data.productId)
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã đánh giá sản phẩm này cho đơn hàng này')
    }
  }
  // Tạo đánh giá mới
  const createdRating = await ratingModel.createNew(data)
  if (!createdRating?.insertedId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thêm đánh giá thất bại')
  }
  // Lấy document vừa tạo
  const newRating = await ratingModel.findOneId(createdRating.insertedId)
  return newRating
}

// Lấy tất cả đánh giá
const getAllRatings = async () => {
  const ratings = await ratingModel.getAll()
  return ratings || []
}

// Tìm đánh giá theo tên sản phẩm
const findByProductName = async (productName) => {
  if (!productName || productName.trim() === '') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên sản phẩm không được để trống')
  }
  const ratings = await ratingModel.searchByProductName(productName.trim())
  if (!ratings || ratings.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá cho sản phẩm này')
  }
  return ratings
}

// Lấy chi tiết đánh giá theo id
const getRatingById = async (id) => {
  const rating = await ratingModel.findOneId(id)
  if (!rating) throw new ApiError(StatusCodes.NOT_FOUND, 'Đánh giá không tồn tại')
  return rating
}

// Xoá đánh giá theo id
const deleteRating = async (id) => {
  const result = await ratingModel.deleteOne(id)
  if (!result || result.deletedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Xoá đánh giá thất bại hoặc không tồn tại')
  }
  return { message: 'Đánh giá đã được xoá', deletedCount: result.deletedCount }
}

const getRatingsByProductId = async (productId) => {
    const ratings = await ratingModel.findByProductId(productId)
    return ratings || []
  }

export const ratingService = {
  addRating,
  getAllRatings,
  findByProductName,
  getRatingById,
  deleteRating,
  getRatingsByProductId
}
