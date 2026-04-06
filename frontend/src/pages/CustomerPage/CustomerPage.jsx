import { Box } from '@mui/material'
import Header from '~/components/customer/Header/Header'
import { Outlet } from 'react-router-dom'
import Footer from '~/components/customer/Footer/Footer'
import { useEffect } from 'react'

function CustomerPage() {
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

    const hasVisited = sessionStorage.getItem('visitedcustomer')

    if (!hasVisited && id) {
      navigator.sendBeacon(`http://localhost:8017/v1/user/login/${id}`, null)
      sessionStorage.setItem('visitedcustomer', 'true')
    }

    const handleBeforeUnload = () => {
      if (!token || !id) return
      navigator.sendBeacon(`http://localhost:8017/v1/user/logout/${id}`, null)
      sessionStorage.removeItem('visitedcustomer')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', overflowY: 'hidden' }}>
      <Header />
      <Outlet />
      <Footer />
    </Box>
  )
}

export default CustomerPage