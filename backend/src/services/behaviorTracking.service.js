import User from '~/models/userModel.js'
import GuestBehavior from '~/models/guestBehavior.model.js'
import Product from '~/models/productModel.js'

// Bảng điểm theo action
const ACTION_SCORES = {
  view:         1,
  add_to_cart:  5,
  purchase:     10
}

/**
 * Cập nhật Product.stats theo action (dùng atomic $inc để tránh race condition)
 */
const updateProductStats = async (productId, action) => {
  const scoreIncrement = ACTION_SCORES[action] ?? 0
  const fieldMap = {
    view:        'stats.viewCount',
    add_to_cart: 'stats.addToCartCount',
    purchase:    'stats.purchaseCount'
  }
  const countField = fieldMap[action]
  if (!countField || !productId) return

  await Product.findByIdAndUpdate(productId, {
    $inc: {
      [countField]:      1,
      'stats.totalScore': scoreIncrement
    }
  })
}

/**
 * Track một hành vi người dùng.
 * Nếu có userId → ghi vào User.
 * Nếu chỉ có sessionId → ghi vào GuestBehavior (upsert).
 */
export const trackBehavior = async ({ userId, sessionId, productId, categoryId, action }) => {
  const score = ACTION_SCORES[action]
  if (score === undefined) return { success: false, error: 'action không hợp lệ' }

  const event = { categoryId, productId, action, score, createdAt: new Date() }

  if (userId) {
    // User đã đăng nhập
    await User.findByIdAndUpdate(userId, {
      // Tăng điểm theo danh mục (Map key = categoryId string)
      $inc: { [`categoryScores.${categoryId}`]: score },
      // Push event mới, giữ tối đa 50 events gần nhất
      $push: {
        behaviorEvents: {
          $each: [event],
          $slice: -50
        }
      }
    })
  } else if (sessionId) {
    // Khách vãng lai
    await GuestBehavior.findOneAndUpdate(
      { sessionId },
      {
        $inc: { [`categoryScores.${categoryId}`]: score },
        $push: {
          behaviorEvents: {
            $each: [event],
            $slice: -50
          }
        },
        // Gia hạn TTL mỗi lần có activity
        $set: { expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      { upsert: true, returnDocument: 'after' }
    )
  }

  // Cập nhật stats của product (chạy song song, không block response)
  if (productId) {
    updateProductStats(productId, action).catch(err =>
      console.warn('[BehaviorTracking] updateProductStats error:', err.message)
    )
  }

  return { success: true }
}

/**
 * Merge dữ liệu hành vi của guest vào user sau khi đăng nhập.
 * Gọi ngay sau khi login thành công.
 */
export const mergeGuestToUser = async ({ sessionId, userId }) => {
  if (!sessionId || !userId) return { merged: false }

  const guest = await GuestBehavior.findOne({ sessionId }).lean()
  if (!guest) return { merged: false }

  const guestScores = guest.categoryScores instanceof Map
    ? Object.fromEntries(guest.categoryScores)
    : (guest.categoryScores || {})

  const categoriesAffected = Object.keys(guestScores).length

  // Cộng dồn categoryScores của guest vào user
  const incUpdate = {}
  for (const [catId, score] of Object.entries(guestScores)) {
    incUpdate[`categoryScores.${catId}`] = score
  }

  await User.findByIdAndUpdate(userId, {
    ...(categoriesAffected > 0 ? { $inc: incUpdate } : {}),
    // Concat events, giữ 50 gần nhất
    $push: {
      behaviorEvents: {
        $each: guest.behaviorEvents || [],
        $slice: -50
      }
    }
  })

  // Xóa guest document sau khi merge
  await GuestBehavior.deleteOne({ sessionId })

  return { merged: true, categoriesAffected }
}
