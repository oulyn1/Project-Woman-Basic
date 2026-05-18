/**
 * Quản lý sessionId cho khách vãng lai.
 * sessionId được tạo một lần và lưu trong localStorage.
 * Bị xóa sau khi guest đăng nhập (để merge behavior vào user account).
 */

const SESSION_KEY = 'wb_session_id'

/**
 * Lấy sessionId hiện tại. Nếu chưa có thì tạo mới bằng crypto.randomUUID().
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

/**
 * Xóa sessionId khỏi localStorage.
 * Gọi sau khi đã merge guest behavior vào user account.
 */
export const clearSessionId = () => {
  localStorage.removeItem(SESSION_KEY)
}
