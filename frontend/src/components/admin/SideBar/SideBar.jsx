import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SideBarItem from './SideBarItem/SideBarItem'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import { useNavigate } from 'react-router-dom'

const SIDEBAR_WIDTH = 280

function SideBarContent({ onItemClick }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role
  const adminMenu = [
    { icon: DashboardOutlinedIcon, title: 'Trang Chủ', path: '/admin/dashboard' },
    { icon: PersonOutlineOutlinedIcon, title: 'Quản Lý Tài Khoản', path: '/admin/account' },
    { icon: ShoppingBagOutlinedIcon, title: 'Quản Lý Sản Phẩm', path: '/admin/product' },
    { icon: ListAltOutlinedIcon, title: 'Quản Lý Danh Mục', path: '/admin/category' },
    { icon: ShoppingCartOutlinedIcon, title: 'Quản Lý Đơn Hàng', path: '/admin/order' },
    { icon: DiscountOutlinedIcon, title: 'Quản Lý Khuyến Mãi', path: '/admin/promotion' },
    { icon: RateReviewOutlinedIcon, title: 'Quản Lý Đánh Giá', path: '/admin/rating' },
    { icon: PeopleAltOutlinedIcon, title: 'Quản Lý Khách Hàng', path: '/admin/customer' },
  ]

  const employeeMenu = [
    { icon: DashboardOutlinedIcon, title: 'Trang Chủ', path: '/admin/dashboard' },
    { icon: ShoppingBagOutlinedIcon, title: 'Quản Lý Sản Phẩm', path: '/admin/product' },
    { icon: ListAltOutlinedIcon, title: 'Quản Lý Danh Mục', path: '/admin/category' },
    { icon: ShoppingCartOutlinedIcon, title: 'Quản Lý Đơn Hàng', path: '/admin/order' },
    { icon: RateReviewOutlinedIcon, title: 'Quản Lý Đánh Giá', path: '/admin/rating' }
  ]

  const menuItems = role === 'admin' ? adminMenu : employeeMenu

  return (
    <Box sx={{ backgroundColor: 'transparent', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img src="/logo.png" alt="logo" style={{ width: '120px', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }} />
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          py: '20px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }
        }}
      >
        {menuItems.map((item) => (
          <SideBarItem
            key={item.title}
            icon={item.icon}
            title={item.title}
            to={item.path}
            handleSideBarCllick={() => {
              navigate(item.path)
              if (onItemClick) onItemClick()
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

function SideBar({ mobileOpen, onClose }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  if (isDesktop) {
    // Floating permanent sidebar on desktop
    return (
      <Box sx={{ flex: `0 0 ${SIDEBAR_WIDTH}px`, height: '100vh', p: 2, background: '#0B0F19' }}>
        <Box
          sx={{
            height: '100%',
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <SideBarContent />
        </Box>
      </Box>
    )
  }

  // Temporary drawer on mobile
  return (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: SIDEBAR_WIDTH,
          backgroundColor: '#0B0F19', // Matches base UI
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        }
      }}
    >
      <SideBarContent onItemClick={onClose} />
    </Drawer>
  )
}

export default SideBar
