import { orderModel } from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { productModel } from '~/models/productModel'

const createNew = async (reqBody, userFromToken) => {
  const newOrder = {
    userId: reqBody.userId || userFromToken?._id || userFromToken?.id || null,
    buyerInfo: reqBody.buyerInfo,
    items: reqBody.items,
    total: reqBody.total,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const createdOrder = await orderModel.createNew(newOrder)
  // Trả về chi tiết order kèm product info
  const getNewOrder = await orderModel.getDetailsWithProducts(createdOrder.insertedId)
  return getNewOrder
}

const getDetails = async (orderId) => {
  const order = await orderModel.getDetailsWithProducts(orderId)
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
  return order
}

const getAll = async (user) => {
  const filter = {}
  if (user?._id || user?.id) filter.userId = user._id || user.id

  const orders = await orderModel.getAllWithProducts(filter)
  if (!orders || orders.length === 0) throw new ApiError(StatusCodes.NOT_FOUND, 'No orders found')

  return orders
}

const deleteOne = async (orderId) => {
  const result = await orderModel.deleteOne(orderId)
  if (!result || result.deletedCount === 0) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
  return result
}

export const search = async (keyword) => {
  const orders = await orderModel.search(keyword)
  // Trả về mảng rỗng nếu không tìm thấy order
  return orders
}

const updateOne = async (orderId, reqBody) => {
  const updateData = { ...reqBody, updatedAt: Date.now() }
  const updatedOrder = await orderModel.updateOne(orderId, updateData)
  if (!updatedOrder) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found to update')
  return updatedOrder
}

const confirmOrder = async (orderId) => {
  // Lấy chi tiết đơn hàng
  const order = await orderModel.getDetailsWithProducts(orderId)
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
  if (order.status !== 'pending') throw new ApiError(StatusCodes.BAD_REQUEST, 'Chỉ đơn pending mới confirm')

  // Trừ stock tất cả sản phẩm
  const stockResults = await Promise.allSettled(
    order.items.map(item =>
      // dùng item.product._id cho chắc chắn trùng DB
      productModel.decreaseStock(item.product._id, item.quantity)
    )
  )

  // Kiểm tra nếu có sản phẩm không đủ stock
  const stockError = stockResults.find(r => r.status === 'rejected')
  if (stockError) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Có sản phẩm không đủ stock để xác nhận')
  }

  // Cập nhật trạng thái đơn hàng
  const updatedOrder = await orderModel.updateOne(orderId, {
    status: 'confirmed',
    updatedAt: Date.now()
  })

  // Trả về chi tiết order mới nhất
  return updatedOrder || await orderModel.getDetailsWithProducts(orderId)
}

const getMyOrders = async (userId) => {
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not logged in')

  const orders = await orderModel.getAllWithProducts({ userId })
  if (!orders || orders.length === 0)
    throw new ApiError(StatusCodes.NOT_FOUND, 'No orders found for this user')

  return orders
}

const searchMyOrders = async (userId, keyword) => {
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not logged in')

  const orders = await orderModel.searchByUser(userId, keyword)
  return orders || []
}

export const orderService = {
  createNew,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne,
  confirmOrder,
  getMyOrders,
  searchMyOrders
}
