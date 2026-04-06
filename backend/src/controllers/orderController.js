import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/orderService'

// Tạo đơn hàng mới
const createNew = async (req, res, next) => {
  try {

    // user từ middleware (có thể undefined nếu chưa login)
    const userFromToken = req.user || {}

    const createdOrder = await orderService.createNew(req.body, userFromToken)
    res.status(StatusCodes.CREATED).json(createdOrder)
  } catch (error) {
    next(error)
  }
}

// Lấy chi tiết đơn hàng
const getDetails = async (req, res, next) => {
  try {
    const order = await orderService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(order)
  } catch (error) {
    next(error)
  }
}

// Lấy tất cả đơn hàng
const getAll = async (req, res, next) => {
  try {
    const orders = await orderService.getAll(req.user)
    res.status(StatusCodes.OK).json(orders)
  } catch (error) {
    next(error)
  }
}

// Xóa đơn hàng
const deleteOne = async (req, res, next) => {
  try {
    const orderId = req.params.id
    const result = await orderService.deleteOne(orderId)
    res.status(StatusCodes.OK).json({
      message: 'Order deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    next(error)
  }
}

// Tìm kiếm đơn hàng
export const search = async (req, res, next) => {
  try {
    const { keyword } = req.query

    if (!keyword || keyword.trim() === '') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Search query "keyword" is required' })
    }

    const orders = await orderService.search(keyword.trim())
    res.status(StatusCodes.OK).json(orders)
  } catch (error) {
    console.error('Search error:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' })
  }
}

// Update đơn hàng
const updateOne = async (req, res, next) => {
  try {
    const orderId = req.params.id
    const updatedOrder = await orderService.updateOne(orderId, req.body)
    res.status(StatusCodes.OK).json(updatedOrder)
  } catch (error) {
    next(error)
  }
}

const confirmOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id
    const updatedOrder = await orderService.confirmOrder(orderId)
    res.status(StatusCodes.OK).json(updatedOrder)
  } catch (error) {
    console.error('Confirm order error:', error)
    next(error)
  }
}

const getMyOrders = async (req, res, next) => {
  try {
    console.log('hi')
    const userId = req.user.userId
    const myOrders = await orderService.getMyOrders(userId)
    res.status(StatusCodes.OK).json(myOrders)
  } catch (error) {
    next(error)
  }
}

// Tìm kiếm đơn hàng của user đăng nhập
const searchMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { keyword } = req.query

    if (!keyword || keyword.trim() === '') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Search query "keyword" is required'
      })
    }

    const orders = await orderService.searchMyOrders(userId, keyword.trim())
    res.status(StatusCodes.OK).json(orders)
  } catch (error) {
    next(error)
  }
}

export const orderController = {
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
