import express from "express"
import { orderController } from '~/controllers/orderController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { isStaff } from '~/middlewares/roleMiddleware'

const Router = express.Router()

// Admin/Staff: Lấy tất cả đơn hàng
Router.route('/')
  .get(authMiddleware, isStaff, orderController.getAll)
  .post(orderController.createNew) // Tạo đơn không cần auth (guest checkout)

// Admin/Staff: Search đơn hàng (theo keyword: tên KH, email, status...)
Router.route('/search')
  .get(authMiddleware, isStaff, orderController.search)

// Đặt /my-orders/search TRƯỚC /my-orders để tránh route shadow
// User: tìm kiếm trong các đơn của mình
Router.route('/my-orders/search')
  .get(authMiddleware, orderController.searchMyOrders)

// User: lấy đơn hàng của mình
Router.route('/my-orders')
  .get(authMiddleware, orderController.getMyOrders)

// Các thao tác với 1 đơn hàng cụ thể (GET public để customer tra cứu theo orderId)
Router.route('/detail/:id')
  .get(orderController.getDetails)
  .delete(authMiddleware, isStaff, orderController.deleteOne)
  .put(authMiddleware, orderController.updateOne)

Router.post('/confirm/:id', authMiddleware, isStaff, orderController.confirmOrder)

export const orderRoute = Router
