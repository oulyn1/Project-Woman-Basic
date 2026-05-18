import { useRef, useCallback } from 'react'
import { trackBehaviorAPI } from '~/apis/recommendation.api'

/**
 * Custom hook để track hành vi người dùng.
 *
 * trackView    — debounce 15 giây (chỉ gửi nếu user ở lại đủ 15s)
 * trackAddToCart — gửi ngay
 * trackPurchase  — gửi ngay
 *
 * Mọi lỗi đều bị nuốt (console.warn) — KHÔNG làm crash UI.
 */
const useTrackBehavior = () => {
  const viewTimerRef = useRef(null)

  /**
   * Track lượt xem sản phẩm với debounce 15 giây.
   * Nếu gọi lại trước khi timer kích hoạt (user rời trang) → cancel.
   */
  const trackView = useCallback((productId, categoryId) => {
    // Cancel timer cũ nếu có
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current)
    }

    if (!productId || !categoryId) return

    viewTimerRef.current = setTimeout(async () => {
      try {
        await trackBehaviorAPI({ productId, categoryId, action: 'view' })
      } catch (err) {
        console.warn('[useTrackBehavior] trackView error:', err?.message)
      }
    }, 15000)
  }, [])

  /**
   * Track thêm vào giỏ hàng — gửi ngay không debounce.
   */
  const trackAddToCart = useCallback(async (productId, categoryId) => {
    if (!productId || !categoryId) return
    try {
      await trackBehaviorAPI({ productId, categoryId, action: 'add_to_cart' })
    } catch (err) {
      console.warn('[useTrackBehavior] trackAddToCart error:', err?.message)
    }
  }, [])

  /**
   * Track mua hàng — gửi ngay không debounce.
   */
  const trackPurchase = useCallback(async (productId, categoryId) => {
    if (!productId || !categoryId) return
    try {
      await trackBehaviorAPI({ productId, categoryId, action: 'purchase' })
    } catch (err) {
      console.warn('[useTrackBehavior] trackPurchase error:', err?.message)
    }
  }, [])

  return { trackView, trackAddToCart, trackPurchase, viewTimerRef }
}

export default useTrackBehavior
