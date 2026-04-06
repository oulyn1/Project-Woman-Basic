import { Box } from '@mui/material'
import React from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useNavigate } from 'react-router-dom'

function AppBar() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user?.name || ''
  const id=user?._id || ''
  const handleEditAccountClick = () => {
    navigate(`/admin/account/edit-account/${id}`)
  }
  const handleLogout = () => {
    const userStr = localStorage.getItem('user')
    const user = JSON.parse(userStr)
    const id = user._id
    const shiftStr = localStorage.getItem('workshift')
    const shift = JSON.parse(shiftStr)
    if (shift) {
      const shiftid = shift._id
      navigator.sendBeacon(`http://localhost:8017/v1/workshift/${shiftid}/close`, null)
      localStorage.removeItem('workshift')
    }
    navigator.sendBeacon(`http://localhost:8017/v1/user/logout/${id}`, null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('visited')
    navigate('/login')
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
        onClick={() => handleEditAccountClick()}
      >
        Xin chào, {userName}
      </Box>
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
        <LogoutOutlinedIcon sx={{ fontSize: 28 }}/>
        Đăng Xuất
      </Box>
    </Box>
  )
}

export default AppBar
