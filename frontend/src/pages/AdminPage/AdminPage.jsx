import { Box } from '@mui/material'
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminBreadcrumbs from '~/components/admin/AdminBreadcrumbs/AdminBreadcrumbs'
import AppBar from '~/components/admin/AppBar/AppBar'
import SideBar from '~/components/admin/SideBar/SideBar'

function AdminPage() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    let user = null
    let id = null
    
    try {
      user = userStr ? JSON.parse(userStr) : null
      id = user?._id || null
    } catch {
      //
    }

    const hasVisited = sessionStorage.getItem('visited')
    if (!hasVisited && id) {
      navigator.sendBeacon(`http://localhost:8017/v1/user/login/${id}`, null)
      sessionStorage.setItem('visited', 'true')
    }
    const handleBeforeUnload = () => {
      if (!token || !id) return
      navigator.sendBeacon(`http://localhost:8017/v1/user/logout/${id}`, null)
      sessionStorage.removeItem('visited')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
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
      <SideBar />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.admin.focusColor,
        }}
      >
        <Box sx={{ flex: '0 0 72px' }}>
          <AppBar />
        </Box>
        <Box sx={{ flex: '1', overflow: 'auto' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mr: 6, mt: 4 }}
          >
            <AdminBreadcrumbs />
          </Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AdminPage
