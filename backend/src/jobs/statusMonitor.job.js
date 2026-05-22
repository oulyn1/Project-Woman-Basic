import { userModel } from '~/models/userModel.js'

// Kiểm tra và chuyển trạng thái offline cho các user quá 45 giây không gửi heartbeat
const startStatusMonitor = () => {
  console.log('[StatusMonitor] Khởi động trình theo dõi trạng thái hoạt động...')
  setInterval(async () => {
    try {
      const result = await userModel.checkAndOfflineUsers(45000)
      if (result && result.modifiedCount > 0) {
        console.log(`[StatusMonitor] Đã chuyển ${result.modifiedCount} người dùng không hoạt động sang Offline.`)
      }
    } catch (err) {
      console.error('[StatusMonitor] Lỗi khi quét trạng thái người dùng:', err.message)
    }
  }, 10000) // Quét mỗi 10 giây để đảm bảo tính thời gian thực cao
}

startStatusMonitor()
