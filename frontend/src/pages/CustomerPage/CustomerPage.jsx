import { Box } from '@mui/material'
import Header from '~/components/customer/Header/Header'
import { Outlet } from 'react-router-dom'
import Footer from '~/components/customer/Footer/Footer'
import { useEffect } from 'react'
import ChatProvider from '~/context/Chat/ChatProvider'
import CustomerChatBubble from '~/components/chat/CustomerChatBubble'
import { sendHeartbeatAPI } from '~/apis/userAPIs'

function CustomerPage() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    // Gửi heartbeat ngay khi vừa truy cập/mount
    sendHeartbeatAPI().catch(() => {})

    // Cứ 25 giây gửi heartbeat một lần để duy trì trạng thái online
    const intervalId = setInterval(() => {
      sendHeartbeatAPI().catch(() => {})
    }, 25000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])
  return (
    <ChatProvider mode="customer">
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Header />
        <Box sx={{ pt: { xs: '64px', md: '85px' } }}>
          <Outlet />
        </Box>
        <Footer />
        <CustomerChatBubble />
      </Box>
    </ChatProvider>
  )
}

export default CustomerPage