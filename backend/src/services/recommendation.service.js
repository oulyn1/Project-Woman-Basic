import User from '~/models/userModel.js'
import GuestBehavior from '~/models/guestBehavior.model.js'
import Product from '~/models/productModel.js'
import Category from '~/models/categoryModel.js'

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000

/**
 * Tính effective score với time decay:
 * Events > 60 ngày → nhân hệ số 0.5
 * Trả về Map<categoryId_string, effectiveScore>
 */
const calcEffectiveScores = (behaviorEvents = [], categoryScoresMap = {}) => {
  const now = Date.now()
  const scores = {}

  // Tính lại từ events (có time decay)
  for (const ev of behaviorEvents) {
    const catId = ev.categoryId?.toString()
    if (!catId) continue
    const age = now - new Date(ev.createdAt).getTime()
    const decayFactor = age > SIXTY_DAYS_MS ? 0.5 : 1
    scores[catId] = (scores[catId] || 0) + (ev.score || 0) * decayFactor
  }

  // Nếu không có events, fall back vào categoryScores tổng
  if (Object.keys(scores).length === 0) {
    const raw = categoryScoresMap instanceof Map
      ? Object.fromEntries(categoryScoresMap)
      : (categoryScoresMap || {})
    for (const [k, v] of Object.entries(raw)) {
      scores[k] = v
    }
  }

  return scores
}

/**
 * Lấy danh sách sản phẩm gợi ý.
 * Nhánh A: có dữ liệu hành vi → gợi ý theo category sở thích
 * Nhánh B: không có dữ liệu → bestseller (totalScore) hoặc mới nhất
 */
export const getRecommendedProducts = async ({ userId, sessionId, limit = 10 }) => {
  let categoryScoresMap = {}
  let behaviorEvents = []
  let hasData = false

  // Lấy dữ liệu hành vi
  if (userId) {
    const user = await User.findById(userId).select('categoryScores behaviorEvents').lean()
    if (user?.categoryScores && (
      (user.categoryScores instanceof Map && user.categoryScores.size > 0) ||
      (typeof user.categoryScores === 'object' && Object.keys(user.categoryScores).length > 0)
    )) {
      categoryScoresMap = user.categoryScores
      behaviorEvents = user.behaviorEvents || []
      hasData = true
    }
  } else if (sessionId) {
    const guest = await GuestBehavior.findOne({ sessionId }).lean()
    if (guest?.categoryScores && (
      (guest.categoryScores instanceof Map && guest.categoryScores.size > 0) ||
      (typeof guest.categoryScores === 'object' && Object.keys(guest.categoryScores).length > 0)
    )) {
      categoryScoresMap = guest.categoryScores
      behaviorEvents = guest.behaviorEvents || []
      hasData = true
    }
  }

  // Nhánh A — Có dữ liệu hành vi
  if (hasData) {
    const effectiveScores = calcEffectiveScores(behaviorEvents, categoryScoresMap)
    // Sort categories theo điểm giảm dần, lấy top 3
    const topCategoryIds = Object.entries(effectiveScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id)

    if (topCategoryIds.length === 0) return fallbackRecommendations(limit)

    // Lấy tên category của top 1 để hiển thị reason
    const topCategory = await Category.findById(topCategoryIds[0]).lean()
    const reason = topCategory
      ? `Dựa trên sở thích của bạn với ${topCategory.name}`
      : 'Dựa trên sở thích của bạn'

    // Query products trong top 3 categories, còn hàng (có ít nhất 1 variant stock > 0), chưa xóa
    const products = await Product.find({
      categoryId: { $in: topCategoryIds },
      isDeleted: { $ne: true },
      'variants.0': { $exists: true }
    })
      .populate('categoryId', 'name slug')
      .lean()

    // Lọc thêm: phải có ít nhất 1 variant stock > 0
    const inStockProducts = products.filter(p =>
      (p.variants || []).some(v => v.stock > 0)
    )

    // Sort: ưu tiên category điểm cao nhất, trong category sort theo stats.totalScore
    const catOrderMap = Object.fromEntries(topCategoryIds.map((id, idx) => [id, idx]))
    inStockProducts.sort((a, b) => {
      const catA = catOrderMap[a.categoryId?._id?.toString() ?? a.categoryId?.toString()] ?? 99
      const catB = catOrderMap[b.categoryId?._id?.toString() ?? b.categoryId?.toString()] ?? 99
      if (catA !== catB) return catA - catB
      return (b.stats?.totalScore || 0) - (a.stats?.totalScore || 0)
    })

    const limited = inStockProducts.slice(0, limit)
    return limited.map(p => ({ ...p, recommendReason: reason }))
  }

  // Nhánh B — Fallback
  return fallbackRecommendations(limit)
}

/**
 * Fallback: bestseller theo totalScore, fallback 2 theo sold/createdAt
 */
const fallbackRecommendations = async (limit) => {
  const products = await Product.find({
    isDeleted: { $ne: true },
    'variants.0': { $exists: true }
  })
    .populate('categoryId', 'name slug')
    .sort({ 'stats.totalScore': -1, sold: -1, createdAt: -1 })
    .limit(limit)
    .lean()

  const inStock = products.filter(p => (p.variants || []).some(v => v.stock > 0))
  return inStock.map(p => ({ ...p, recommendReason: 'Sản phẩm được yêu thích nhất' }))
}

/**
 * Lấy sản phẩm tương tự (cùng danh mục).
 */
export const getSimilarProducts = async ({ productId, limit = 8 }) => {
  const product = await Product.findById(productId).lean()
  if (!product) return []

  const similar = await Product.find({
    categoryId: product.categoryId,
    _id: { $ne: product._id },
    isDeleted: { $ne: true },
    'variants.0': { $exists: true }
  })
    .populate('categoryId', 'name slug')
    .sort({ 'stats.totalScore': -1, sold: -1 })
    .limit(limit)
    .lean()

  return similar.filter(p => (p.variants || []).some(v => v.stock > 0))
}

/**
 * Aggregate insights theo danh mục — dùng cho Admin AI Copilot.
 */
export const getCategoryInsights = async () => {
  const results = await Product.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$categoryId',
        viewCount:      { $sum: '$stats.viewCount' },
        addToCartCount: { $sum: '$stats.addToCartCount' },
        purchaseCount:  { $sum: '$stats.purchaseCount' },
        totalScore:     { $sum: '$stats.totalScore' },
        products: {
          $push: {
            _id:        '$_id',
            name:       '$name',
            totalScore: '$stats.totalScore',
            sold:       '$sold'
          }
        }
      }
    },
    {
      $lookup: {
        from:         'categories', // ✅ FIX LỖI 5: Mongoose pluralizes 'Category' → 'categories'
        localField:   '_id',
        foreignField: '_id',
        as:           'categoryInfo'
      }
    },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
    { $sort: { totalScore: -1 } }
  ])

  return results.map(r => ({
    categoryId:     r._id,
    categoryName:   r.categoryInfo?.name || 'Chưa phân loại',
    viewCount:      r.viewCount,
    addToCartCount: r.addToCartCount,
    purchaseCount:  r.purchaseCount,
    totalScore:     r.totalScore,
    topProducts:    (r.products || [])
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, 3)
      .map(p => ({ name: p.name, totalScore: p.totalScore, sold: p.sold }))
  }))
}
