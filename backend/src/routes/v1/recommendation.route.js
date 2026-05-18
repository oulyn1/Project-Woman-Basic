import express from 'express'
import jwt from 'jsonwebtoken'
import {
  trackBehaviorController,
  getRecommendationsController,
  getSimilarProductsController,
  mergeGuestBehaviorController
} from '~/controllers/recommendation.controller.js'
import { authMiddleware } from '~/middlewares/authMiddleware.js'
import { env } from '~/config/environment.js'

/**
 * Middleware auth "mềm": decode JWT nếu có, không throw lỗi nếu thiếu/sai token.
 * Dùng cho route public nhưng vẫn muốn nhận userId khi user đã login.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      req.user = jwt.verify(token, env.JWT_SECRET)
    } catch {
      // Token không hợp lệ — bỏ qua, xem như guest
    }
  }
  next()
}

const recommendationRoute = express.Router()

// Public routes (cả guest lẫn user đều gọi được)
recommendationRoute.post('/track', optionalAuth, trackBehaviorController)
recommendationRoute.get('/', optionalAuth, getRecommendationsController)
recommendationRoute.get('/similar/:productId', getSimilarProductsController)

// Protected route (cần JWT hợp lệ)
recommendationRoute.post('/merge-guest', authMiddleware, mergeGuestBehaviorController)

export { recommendationRoute }

