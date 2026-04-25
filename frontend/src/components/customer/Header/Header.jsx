import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Container,
  Badge,
  IconButton,
  Tooltip,
  Typography,
  Modal,
  TextField,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '~/context/Cart/useCart'
import { fetchAllCategoriesAPI } from '~/apis/categoryAPIs'
import { searchProductsAPI } from '~/apis/productAPIs'
import { getRatingsByProductId } from '~/apis/ratingAPIs'

// Icons
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import StarIcon from '@mui/icons-material/Star'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LogoWB from '~/assets/logo_wb.png'
import AuthDialog from './AuthDialog'


// ==== Component con để load rating ====
function StarRating({ productId }) {
  const [avg, setAvg] = useState(0)
  useEffect(() => {
    const fetch = async () => {
      try {
        const ratings = await getRatingsByProductId(productId)
        const total = ratings.reduce((sum, r) => sum + r.star, 0)
        const average = ratings.length
          ? (total / ratings.length).toFixed(1)
          : 0
        setAvg(average)
      } catch {
        setAvg(0)
      }
    }
    fetch()
  }, [productId])

  return (
    <Typography
      variant="body2"
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
    >
      <StarIcon sx={{ fontSize: 16, color: 'gold' }} /> ({avg})
    </Typography>
  )
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { cartItems = [] } = useCart()
  const itemCount = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const token = localStorage.getItem('accessToken')

  const [categories, setCategories] = useState([])
  const [catAnchorEl, setCatAnchorEl] = useState(null)
  const [openSearchModal, setOpenSearchModal] = useState(false)
  const [openAuthDialog, setOpenAuthDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [catExpandedInDrawer, setCatExpandedInDrawer] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategoriesAPI()
        setCategories(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategories()
  }, [])

  // URL Trigger for AuthDialog
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const authType = searchParams.get('auth')
    if (authType === 'login') {
      setOpenAuthDialog(true)
    } else if (authType === 'register') {
      setOpenAuthDialog(true)
    }
    if (authType) {
      navigate(location.pathname, { replace: true })
    }
  }, [location.search, navigate, location.pathname])

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        try {
          const res = await searchProductsAPI(searchQuery)
          setSearchResults(res.data || [])
        } catch {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleAccountClick = () =>
    token ? navigate('/editprofile') : setOpenAuthDialog(true)
  const handleOrderClick = () =>
    token ? navigate('/myorders') : setOpenAuthDialog(true)
  const handleCartClick = () =>
    token ? navigate('/cart') : setOpenAuthDialog(true)

  const closeDrawerAndNavigate = (path) => {
    setDrawerOpen(false)
    navigate(path)
  }

  const styleModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '80%', md: 800 },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: { xs: 2, md: 3 },
    maxHeight: '85vh',
    overflowY: 'auto',
  }

  return (
    <Box
      sx={{
        borderBottom: '1px solid #e0e0e0',
        bgcolor: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        py: { xs: 1, md: 1.5 },
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Hamburger (mobile) + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Hamburger Icon - only on mobile/tablet */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, p: 0.5 }}
              aria-label="Mở menu điều hướng"
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box
              sx={{
                cursor: 'pointer',
                height: { xs: 36, md: 45 },
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => navigate('/')}
            >
              <img
                src={LogoWB}
                alt="Woman Basic Logo"
                style={{ height: '100%', objectFit: 'contain' }}
              />
            </Box>
          </Box>

          {/* Center: Navigation Menu - desktop only */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
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

          {/* Right: Action Icons - always visible */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, md: 1 } }}>
            <Tooltip title="Tìm kiếm">
              <IconButton onClick={() => setOpenSearchModal(true)} size={isMobile ? 'small' : 'medium'}>
                <SearchOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Tài khoản">
              <IconButton onClick={handleAccountClick} size={isMobile ? 'small' : 'medium'}>
                <PersonOutlineOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Đơn hàng">
              <IconButton onClick={handleOrderClick} size={isMobile ? 'small' : 'medium'}>
                <LocalMallOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Giỏ hàng">
              <IconButton onClick={handleCartClick} size={isMobile ? 'small' : 'medium'}>
                <Badge badgeContent={itemCount} color="error">
                  <ShoppingBagOutlinedIcon color="action" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Container>

      {/* === Mobile Drawer Navigation === */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '80vw', sm: 320 }, maxWidth: 360 }
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #eee',
          }}
        >
          <img src={LogoWB} alt="Woman Basic" style={{ height: 32, objectFit: 'contain' }} />
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer Nav Links */}
        <List sx={{ pt: 1 }} disablePadding>
          <ListItemButton
            onClick={() => closeDrawerAndNavigate('/listproduct/sale')}
            sx={{ py: 1.5 }}
          >
            <ListItemText
              primary="🔥 FLASH SALE"
              primaryTypographyProps={{ fontWeight: 700, color: '#ad2a36' }}
            />
          </ListItemButton>

          <Divider />

          {/* Danh mục với expand */}
          <ListItemButton
            onClick={() => setCatExpandedInDrawer(!catExpandedInDrawer)}
            sx={{ py: 1.5 }}
          >
            <ListItemText
              primary="DANH MỤC SẢN PHẨM"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            {catExpandedInDrawer ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={catExpandedInDrawer} timeout="auto" unmountOnExit>
            <List disablePadding>
              {categories.map((cat) => (
                <ListItemButton
                  key={cat._id}
                  sx={{ pl: 4, py: 1 }}
                  onClick={() => closeDrawerAndNavigate(`/listproduct/${cat.slug}`)}
                >
                  <ListItemText
                    primary={cat.name}
                    primaryTypographyProps={{ fontSize: '0.9rem', color: '#444' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          <Divider />

          <ListItemButton
            onClick={() => closeDrawerAndNavigate('/story')}
            sx={{ py: 1.5 }}
          >
            <ListItemText
              primary="VỀ WOMAN BASIC"
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>

          <Divider />
        </List>

        {/* Auth Actions */}
        <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {token ? (
            <>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => closeDrawerAndNavigate('/editprofile')}
                startIcon={<PersonOutlineOutlinedIcon />}
              >
                Tài khoản của tôi
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => closeDrawerAndNavigate('/myorders')}
                startIcon={<LocalMallOutlinedIcon />}
              >
                Đơn hàng của tôi
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              fullWidth
              sx={{ bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
              onClick={() => {
                setDrawerOpen(false)
                setOpenAuthDialog(true)
              }}
            >
              Đăng nhập / Đăng ký
            </Button>
          )}
        </Box>
      </Drawer>

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
                <Typography color="text.secondary">
                  Không tìm thấy sản phẩm nào phù hợp.
                </Typography>
              </Box>
            )}
            {searchResults.map((product) => (
              <Box
                key={product._id}
                onClick={() => {
                  navigate(`/productdetail/${product._id}`)
                  setOpenSearchModal(false)
                }}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  p: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  borderRadius: 1,
                }}
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2" color="error">
                      {product.price?.toLocaleString()} ₫
                    </Typography>
                    <StarRating productId={product._id} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Modal>

      {/* Auth Dialog */}
      <AuthDialog
        open={openAuthDialog}
        onClose={() => setOpenAuthDialog(false)}
      />
    </Box>
  )
}

export default Header
