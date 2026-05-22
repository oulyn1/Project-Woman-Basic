import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminBreadcrumbs from '~/components/admin/AdminBreadcrumbs/AdminBreadcrumbs'
import AppBar from '~/components/admin/AppBar/AppBar'
import SideBar from '~/components/admin/SideBar/SideBar'
import AdminChatBubble from '~/components/chat/AdminChatBubble'
import { sendHeartbeatAPI } from '~/apis/userAPIs'

function AdminPage() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

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
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar — passes mobile drawer state */}
      <SideBar
        mobileOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main content area */}
      <Box
        sx={{
          width: '100%',
          minWidth: 0, // prevents flexbox overflow
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0B0F19',
          backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(0, 255, 135, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(96, 239, 255, 0.05), transparent 25%)',
        }}
      >
        {/* Top AppBar */}
        <Box sx={{ flex: '0 0 72px' }}>
          <AppBar onMenuToggle={() => setMobileDrawerOpen(true)} />
        </Box>

        {/* Page content */}
        <Box sx={{ flex: '1', overflow: 'auto' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mr: { xs: 2, md: 6 }, mt: { xs: 2, md: 4 } }}
          >
            <AdminBreadcrumbs />
          </Box>
          <Outlet />
        </Box>
      </Box>

      {/* Admin Chat Bubble — tự ẩn trên /admin/dashboard */}
      <AdminChatBubble />
    </Box>
  )
}

export default AdminPage
