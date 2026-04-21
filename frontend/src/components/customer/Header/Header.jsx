import React, { useState, useEffect } from 'react'
import { Box, Button, Menu, MenuItem, Container, Badge, IconButton, Tooltip, Typography, Modal, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { useCart } from '~/context/Cart/useCart'
import { fetchAllCategorysAPI } from '~/apis/categoryAPIs'
import { fetchAllProductsAPI, searchProductsAPI } from '~/apis/productAPIs'
import { getRatingsByProductId } from '~/apis/ratingAPIs'

// Icons
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import StarIcon from '@mui/icons-material/Star'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LogoWB from '~/assets/logo_wb.png'

// ==== Component con để load rating ====
function StarRating({ productId }) {
  const [avg, setAvg] = useState(0)
  useEffect(() => {
    const fetch = async () => {
      try {
        const ratings = await getRatingsByProductId(productId)
        const total = ratings.reduce((sum, r) => sum + r.star, 0)
        const average = ratings.length ? (total / ratings.length).toFixed(1) : 0
        setAvg(average)
      } catch { setAvg(0) }
    }
    fetch()
  }, [productId])

  return (
    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <StarIcon sx={{ fontSize: 16, color: 'gold' }} /> ({avg})
    </Typography>
  )
}

function Header() {
  const navigate = useNavigate()
  const { cartItems = [] } = useCart()
  const itemCount = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const token = localStorage.getItem('accessToken')

  const [categories, setCategories] = useState([])
  const [catAnchorEl, setCatAnchorEl] = useState(null)
  const [openSearchModal, setOpenSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategorysAPI()
        setCategories(data)
      } catch (err) { console.error(err) }
    }
    fetchCategories()
  }, [])

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        try {
          const res = await searchProductsAPI(searchQuery)
          setSearchResults(res.data || [])
        } catch { setSearchResults([]) }
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleAccountClick = () => token ? navigate('/editprofile') : navigate('/login')
  const handleOrderClick = () => token ? navigate('/myorders') : navigate('/login')

  const styleModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: 800 },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
    maxHeight: '80vh',
    overflowY: 'auto'
  }

  return (
    <Box sx={{ 
      borderBottom: '1px solid #e0e0e0', 
      bgcolor: 'white', 
      position: 'fixed', 
      top: 0, 
      left: 0,
      right: 0,
      zIndex: 2147483647, 
      py: 1.5,
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <Box sx={{ cursor: 'pointer', height: 45, display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
            <img src={LogoWB} alt="Woman Basic Logo" style={{ height: '100%', objectFit: 'contain' }} />
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Button 
              sx={{ color: 'black', fontWeight: 600, fontSize: '0.9rem' }}
              onClick={() => navigate('/listproduct/sale')}
            >
              FLASH SALE
            </Button>

            <Box>
              <Button 
                endIcon={<ExpandMoreIcon />}
                sx={{ color: 'black', fontWeight: 600, fontSize: '0.9rem' }}
                onClick={(e) => setCatAnchorEl(e.currentTarget)}
              >
                DANH MỤC SẢN PHẨM
              </Button>
              <Menu
                anchorEl={catAnchorEl}
                open={Boolean(catAnchorEl)}
                onClose={() => setCatAnchorEl(null)}
                sx={{ mt: 1 }}
              >
                {categories.map((cat) => (
                  <MenuItem 
                    key={cat._id} 
                    onClick={() => {
                      navigate(`/listproduct/${cat.slug}`)
                      setCatAnchorEl(null)
                    }}
                    sx={{ minWidth: 200, py: 1.5 }}
                  >
                    {cat.name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Button 
              sx={{ color: 'black', fontWeight: 600, fontSize: '0.9rem' }}
              onClick={() => navigate('/story')}
            >
              VỀ WOMAN BASIC
            </Button>
          </Box>

          {/* Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Tìm kiếm">
              <IconButton onClick={() => setOpenSearchModal(true)}>
                <SearchOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Tài khoản">
              <IconButton onClick={handleAccountClick}>
                <PersonOutlineOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Đơn hàng">
              <IconButton onClick={handleOrderClick}>
                <LocalMallOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Giỏ hàng">
              <IconButton onClick={() => navigate('/cart')}>
                <Badge badgeContent={itemCount} color="error">
                  <ShoppingBagOutlinedIcon color="action" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Container>

      {/* Search Modal */}
      <Modal open={openSearchModal} onClose={() => setOpenSearchModal(false)}>
        <Box sx={styleModal}>
          <TextField 
            fullWidth 
            autoFocus
            placeholder="Tìm kiếm sản phẩm nhanh..." 
            variant="outlined"
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {searchQuery && searchResults.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Không tìm thấy sản phẩm nào phù hợp.</Typography>
              </Box>
            )}
            {searchResults.map((product) => (
              <Box 
                key={product._id}
                onClick={() => { navigate(`/productdetail/${product._id}`); setOpenSearchModal(false) }}
                sx={{ 
                  display: 'flex', gap: 2, alignItems: 'center', p: 1, 
                  cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' }, borderRadius: 1 
                }}
              >
                <img src={product.images?.[0]} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="bold">{product.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="error">{product.price?.toLocaleString()} ₫</Typography>
                    <StarRating productId={product._id} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default Header
