import { StatusCodes } from 'http-status-codes'
import { trackBehavior, mergeGuestToUser } from '~/services/behaviorTracking.service.js'
import { getRecommendedProducts, getSimilarProducts } from '~/services/recommendation.service.js'

/**
 * POST /v1/recommendations/track
 * Body: { productId, categoryId, action, sessionId? }
 * Header: Authorization (optional — nếu có JWT thì dùng userId từ token)
 */
export const trackBehaviorController = async (req, res, next) => {
  try {
    const { productId, categoryId, action, sessionId } = req.body
    // req.user được set bởi optionalAuthMiddleware nếu có token hợp lệ
    // ✅ FIX LỖI 3: JWT payload dùng key 'userId', không phải 'id' hay '_id'
    const userId = req.user?.userId || null

    const result = await trackBehavior({ userId, sessionId, productId, categoryId, action })
    res.status(StatusCodes.OK).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /v1/recommendations
 * Query: sessionId? (nếu không có token)
 */
export const getRecommendationsController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null
    const sessionId = req.query.sessionId || null
    const limit = parseInt(req.query.limit) || 10

    const products = await getRecommendedProducts({ userId, sessionId, limit })
    res.status(StatusCodes.OK).json({ success: true, data: products })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /v1/recommendations/similar/:productId
 */
export const getSimilarProductsController = async (req, res, next) => {
  try {
    const { productId } = req.params
    const limit = parseInt(req.query.limit) || 8

    const products = await getSimilarProducts({ productId, limit })
    res.status(StatusCodes.OK).json({ success: true, data: products })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /v1/recommendations/merge-guest
 * Gọi ngay sau khi user đăng nhập thành công.
 * Cần authMiddleware (JWT bắt buộc).
 * Body: { sessionId }
 */
export const mergeGuestBehaviorController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null
    const { sessionId } = req.body

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Cần đăng nhập' })
    }

    const result = await mergeGuestToUser({ sessionId, userId })
    res.status(StatusCodes.OK).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}
