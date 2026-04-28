import express from 'express'
import { aiController } from '~/controllers/ai.controller'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// POST /v1/ai/analyze-product — yêu cầu đăng nhập (admin)
Router.route('/analyze-product').post(authMiddleware, aiController.analyzeProduct)

export const aiRoute = Router
