import express from 'express'
import { ratingController } from '~/controllers/ratingController'


const Router = express.Router()

// Thêm đánh giá mới
Router.route('/add')
  .post(ratingController.addRating)

// Lấy tất cả đánh giá
Router.route('/')
  .get(ratingController.getAllRatings)

// Tìm đánh giá theo productName
Router.route('/search')
  .get(ratingController.searchByProductName)

Router.route('/product/:productId')
  .get(ratingController.getRatingsByProductId)
// Lấy chi tiết đánh giá theo id
Router.route('/:id')
  .get(ratingController.getRatingById)
  .delete(ratingController.deleteRating)

export const ratingRoute = Router