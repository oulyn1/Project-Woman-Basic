import express from 'express'
import rateLimit from 'express-rate-limit'
import { chatController } from '~/controllers/chat.controller'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Rate limiting cho customer chat: tối đa 20 requests/phút/IP
const customerChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20,
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau 1 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// POST /v1/chat/customer — không cần auth, có rate limit
Router.route('/customer')
  .post(customerChatLimiter, chatController.customerChat)

// POST /v1/chat/admin — cần auth + role admin
Router.route('/admin')
  .post(authMiddleware, chatController.adminChat)

// Middleware auth tùy chọn — set req.user nếu có token, nhưng không block nếu không có
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next)
  }
  next()
}

// GET /v1/chat/history — cần auth (admin) hoặc query ?sessionId= (customer)
// DELETE /v1/chat/history — tương tự
Router.route('/history')
  .get(optionalAuth, chatController.getChatHistory)
  .delete(optionalAuth, chatController.clearChatHistory)

// GET /v1/chat/admin/conversations — danh sách các phiên chat cho admin
Router.route('/admin/conversations')
  .get(authMiddleware, chatController.getAdminConversations)

export const chatRoute = Router
