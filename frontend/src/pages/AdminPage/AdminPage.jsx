import { Box, Breadcrumbs, Link, Typography, Snackbar, Alert } from '@mui/material'
import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminBreadcrumbs from '~/components/admin/AdminBreadcrumbs/AdminBreadcrumbs'
import AppBar from '~/components/admin/AppBar/AppBar'
import SideBar from '~/components/admin/SideBar/SideBar'
import { useState } from 'react'
import { useEffect } from 'react'
import { createShiftAPI } from '~/apis/workshiftAPIs'

function AdminPage() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const handleCloseSnackbar = () => setSnackbar(s => ({ ...s, open: false }))
  const AddworkshiftHandler = async (ratingData) => {
    try {
      const res= await createShiftAPI(ratingData)
      localStorage.setItem('workshift', JSON.stringify(res.newShift))
      setSnackbar({
        open: true,
        message: 'Ca làm việc đã được thêm thành công!',
        severity: 'success'
      })
    } catch (error) {
      const backendMsg = error.response?.data?.message || 'Có lỗi xảy ra khi thêm ca làm việc. Vui lòng thử lại!'
      setSnackbar({
        open: true,
        message: backendMsg,
        severity: 'error'
      })
    }

  }
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    const user = JSON.parse(userStr)
    const id = user._id
    const role = user.role
    const hasVisited = sessionStorage.getItem('visited')
    if (!hasVisited) {
      if (id) {
        navigator.sendBeacon(`http://localhost:8017/v1/user/login/${id}`, null)
        sessionStorage.setItem('visited', 'true')
        if (role === 'employee') {
          const workshift = {
            employeeId: id,
            workDate: new Date().toISOString().split('T')[0], // yyyy-mm-dd
            startTime: new Date(),
            endTime: null,
            shiftStatus: 'Scheduled',
          }
          AddworkshiftHandler(workshift)
        }
      }
    }
    const handleBeforeUnload = () => {
      if (!token) return
      const shiftStr = localStorage.getItem('workshift')
      const shift = JSON.parse(shiftStr)
      const shiftid = shift._id
      navigator.sendBeacon(`http://localhost:8017/v1/workshift/${shiftid}/close`, null)
      navigator.sendBeacon(`http://localhost:8017/v1/user/logout/${id}`, null)
      sessionStorage.removeItem('visited')
      localStorage.removeItem('workshift')
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
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
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
