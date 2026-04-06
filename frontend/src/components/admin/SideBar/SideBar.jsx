import { Box } from '@mui/material'
import React from 'react'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SideBarItem from './SideBarItem/SideBarItem'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined'
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { useNavigate } from 'react-router-dom'

function SideBar() {
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
    { icon: GroupsOutlinedIcon, title: 'Quản Lý Nhân Viên', path: '/admin/employee' },
    { icon: StoreOutlinedIcon, title: 'Quản Lý Chi Nhánh', path: '/admin/branch' }
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
    <Box sx={{ backgroundColor: '#343a40', flex: '0 0 250px' }}>
      <Box
        sx={{
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img src="/logo.png" alt="logo" style={{ width: '120px' }} />
      </Box>

      <Box
        sx={{
          height: 'calc(100% - 72px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          py: '10px'
        }}
      >
        {menuItems.map((item) => (
          <SideBarItem
            key={item.title}
            icon={item.icon}
            title={item.title}
            to={item.path}
            handleSideBarCllick={() => navigate(item.path)}
          />
        ))}
      </Box>
    </Box>
  )
}

export default SideBar
