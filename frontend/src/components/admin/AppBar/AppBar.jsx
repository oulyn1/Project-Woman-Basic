import { Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'
import EditAccount from '~/pages/AdminPage/AccountPage/EditAccount/EditAccount'

function AppBar({ onMenuToggle }) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [openProfile, setOpenProfile] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user?.name || ''
  const id = user?._id || ''

  const handleEditAccountClick = () => {
    setOpenProfile(true)
  }

  const handleLogout = () => {
    const userStr = localStorage.getItem('user')
    const user = JSON.parse(userStr)
    const id = user._id
    navigator.sendBeacon(`http://localhost:8017/v1/user/logout/${id}`, null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('visited')
    navigate('/')
  }

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(11, 15, 25, 0.6)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        flex: '1',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, md: 4 },
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: Hamburger (mobile only) + Greeting */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Hamburger - mobile only */}
        <IconButton
          onClick={onMenuToggle}
          sx={{
            display: { xs: 'flex', md: 'none' },
            color: 'white',
            p: 0.5,
          }}
          aria-label="Mở menu điều hướng"
        >
          <MenuIcon />
        </IconButton>

        {/* Greeting */}
        <Box
          sx={{
            fontSize: { xs: '15px', md: '20px' },
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
          onClick={handleEditAccountClick}
        >
          {isMobile ? `${userName}` : `Xin chào, ${userName}`}
        </Box>
      </Box>

      {openProfile && id && (
        <EditAccount
          open={openProfile}
          accountId={id}
          onClose={() => setOpenProfile(false)}
          onSuccess={() => {
            setOpenProfile(false)
            window.location.reload()
          }}
        />
      )}

      {/* Right: Logout */}
      <Box
        sx={{
          fontSize: { xs: '14px', md: '20px' },
          color: 'white',
          display: 'flex',
          gap: 0.5,
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
        onClick={handleLogout}
      >
        <LogoutOutlinedIcon sx={{ fontSize: { xs: 22, md: 28 } }} />
        {!isMobile && 'Đăng Xuất'}
      </Box>
    </Box>
  )
}

export default AppBar
