import express from "express"
import { orderController } from '~/controllers/orderController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Lấy danh sách đơn hàng hoặc tạo mới đơn hàng
Router.route('/')
  .get(orderController.getAll) // Admin lấy hết, User chỉ lấy của mình
  .post(orderController.createNew)

// Search đơn hàng (theo keyword: tên KH, email, status...)
Router.route('/search')
  .get(orderController.search)

// Các thao tác với 1 đơn hàng cụ thể
Router.route('/detail/:id')
  .get(orderController.getDetails)
  .delete(orderController.deleteOne)
  .put(orderController.updateOne)

Router.post('/confirm/:id', orderController.confirmOrder)

Router.route('/my-orders')
  .get(authMiddleware, orderController.getMyOrders)

// 🔍 User: tìm kiếm trong các đơn của mình
Router.route('/my-orders/search')
  .get(authMiddleware, orderController.searchMyOrders)

export const orderRoute = Router
