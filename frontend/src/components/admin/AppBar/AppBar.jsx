import { Box, Typography } from '@mui/material'
import React, { useState } from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useNavigate } from 'react-router-dom'
import EditAccount from '~/pages/AdminPage/AccountPage/EditAccount/EditAccount'

function AppBar() {
  const navigate = useNavigate()
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
        backgroundColor: 'black',
        flex: '1',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2
      }}
    >
      <Box
        sx={{
          height: '50px',
          fontSize: '20px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textTransform: 'none',
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
        onClick={handleEditAccountClick}
      >
        Xin chào, {userName}
      </Box>

      {openProfile && id && (
        <EditAccount
          open={openProfile}
          accountId={id}
          onClose={() => setOpenProfile(false)}
          onSuccess={() => {
            setOpenProfile(false)
            // Optionally refresh user info if name changed
            window.location.reload()
          }}
        />
      )}

      <Box
        sx={{
          height: '50px',
          fontSize: '20px',
          color: 'white',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center',
          textTransform: 'none',
          cursor: 'pointer'
        }}
        onClick={handleLogout}
      >
        <LogoutOutlinedIcon sx={{ fontSize: 28 }} />
        Đăng Xuất
      </Box>
    </Box>
  )
}

export default AppBar
