import { Badge, Box, Button } from '@mui/material'
import React from 'react'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import { useNavigate } from 'react-router-dom'
import { useCart } from '~/context/Cart/useCart'

function TopBar() {
  const navigate = useNavigate()
  const { cartItems = [] } = useCart()
  const itemCount = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const token = localStorage.getItem('accessToken')
  const handleAccountClick = () => {
    if (!token) {
      navigate('/login')
    } else {
      navigate('/editprofile')
    }
  }
  const handleHomeClick = () => {
    navigate('/')
  }
  const handleStoryClick = () => {
    navigate('/story')
  }
  const handleStoreClick = () => {
    navigate('/storelocator')
  }
  const handleCartClick = () => {
    navigate('/cart')
  }
  const handleOrderClick = () => {
    if (!token) {
      navigate('/login')
    } else {
      navigate('/myorders')
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        height: '49px',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Button
          key='cauchuyen'
          sx={{
            my: 2,
            color: '#696969',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'white'
            },
          }}
          onClick={handleStoryClick}
        >
          <AutoStoriesOutlinedIcon />
          Câu Chuyện PNJ
        </Button>
        <Button
          key='cuahang'
          sx={{
            my: 2,
            color: '#696969',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'white'
            },
          }}
          onClick={handleStoreClick}
        >
          <PinDropOutlinedIcon />
          Cửa Hàng
        </Button>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        onClick={handleHomeClick}
      >
        <img src="https://cdn.pnj.io/images/logo/pnj.com.vn.png" alt="" style={{ height: '100%', objectFit: 'contain' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Button
          key='taikhoan'
          sx={{
            my: 2,
            color: '#696969',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'white'
            },
          }}
          onClick={handleAccountClick}
        >
          <PersonOutlineOutlinedIcon />
          Tài Khoản Của Tôi
        </Button>
        <Button
          key='donhang'
          sx={{
            my: 2,
            color: '#696969',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'white'
            },
          }}
          onClick={handleOrderClick}
        >
          <LocalMallOutlinedIcon />
          Đơn Hàng Của Tôi
        </Button>
        <Button
          key='giohang'
          sx={{
            my: 2,
            color: '#696969',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'white'
            },
          }}
          onClick={handleCartClick}
        >
          <Badge
            badgeContent={itemCount}
            color="error"
            showZero
            anchorOrigin={{
              vertical: 'bottom', // Nằm ở phía dưới
              horizontal: 'right', // Nằm ở phía bên phải
            }}
            sx={{
              '& .MuiBadge-badge': {
                width: '12px',
                height: '20px',
                top: 2,
                right: 5,
              }
            }}
          >
            <ShoppingBagOutlinedIcon />
          </Badge>
          Giỏ Hàng
        </Button>
      </Box>
    </Box>
  )
}

export default TopBar
