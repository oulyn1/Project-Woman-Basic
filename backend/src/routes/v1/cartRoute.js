import express from "express"
import { cartController } from '~/controllers/cartController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware, cartController.getCart)
  .delete(authMiddleware, cartController.clearCart)

Router.route('/items')
  .post(authMiddleware, cartController.addToCart)
  .put(authMiddleware, cartController.updateQuantity)
  .delete(authMiddleware, cartController.removeItem)

export const cartRoute = Router
