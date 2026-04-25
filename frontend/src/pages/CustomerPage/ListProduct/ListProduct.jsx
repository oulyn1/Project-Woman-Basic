import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Grid,
  Typography,
  Container,
  Button,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  InputBase,
  Paper,
  Drawer,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllCategoriesAPI } from '~/apis/categoryAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'
import ProductCard from '~/components/customer/ProductHome/ProductCard/ProductCard'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'

function ListProduct() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // States for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity })
  const [sortBy, setSortBy] = useState('newest')

  // Load current user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setCurrentUser(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, prodRes, promos] = await Promise.all([
          fetchAllCategoriesAPI(),
          fetchAllProductsAPI(),
          fetchAllPromotionsAPI(),
        ])
        setCategories(cats)
        setAllProducts(prodRes.data || [])
        setPromotions(promos.items || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  // Helper: promotions applicable to a given product for current user
  const promosForProduct = (prod) => {
    if (!prod) return []
    const now = new Date()
    return promotions.filter((p) => {
      const isProductPromo =
        p.productIds?.includes('ALL') || p.productIds?.includes(prod._id)
      const isActive =
        p.computedStatus === 'active' &&
        (!p.startDate || new Date(p.startDate) <= now) &&
        (!p.endDate || p.endDate === null || new Date(p.endDate) >= now)
      const cond = p.condition ?? {
        type: 'all',
        loyalTiers: [],
        specificCustomerIds: [],
      }
      let eligible = true
      switch (cond.type) {
      case 'all':
        eligible = true
        break
      case 'loyal':
        eligible =
            !!currentUser?.loyaltyTier &&
            (cond.loyalTiers ?? []).includes(currentUser.loyaltyTier)
        break
      case 'specific':
        eligible =
            !!currentUser?._id &&
            (cond.specificCustomerIds ?? []).some(
              (id) => String(id) === String(currentUser._id),
            )
        break
      case 'new':
        eligible = (cond.newCustomerMaxOrders ?? null) == null
        break
      default:
        eligible = true
      }
      return isProductPromo && isActive && eligible
    })
  }

  // Calculate Product Count per Category
  const categoryCounts = useMemo(() => {
    const counts = {}
    allProducts.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1
    })
    return counts
  }, [allProducts])

  // Centralized Filtering and Sorting Logic
  const processedProducts = useMemo(() => {
    let result = [...allProducts]

    // 1. Filter by Primary Logic (Category Slug)
    if (categorySlug === 'newest') {
      result = result.filter(
        (p) => p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0,
      )
    } else if (categorySlug === 'sale') {
      result = result.filter((p) => promosForProduct(p).length > 0)
    } else if (categorySlug && categorySlug !== 'all') {
      const targetCat = categories.find((c) => c.slug === categorySlug)
      if (targetCat) {
        result = result.filter((p) => p.categoryId === targetCat._id)
      } else {
        return []
      }
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    // 3. Filter by Price Range
    if (priceRange.max !== Infinity || priceRange.min !== 0) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max,
      )
    }

    // 4. Always filter by Stock
    result = result.filter(
      (p) => p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0,
    )

    // 5. Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [
    allProducts,
    categorySlug,
    categories,
    promotions,
    searchQuery,
    priceRange,
    sortBy,
  ])

  const handlePriceClick = (min, max) => {
    if (priceRange.min === min && priceRange.max === max) {
      setPriceRange({ min: 0, max: Infinity })
    } else {
      setPriceRange({ min, max })
    }
  }

  // Reusable sidebar content
  const SidebarContent = ({ onClose }) => (
    <Box>
      {onClose && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Bộ lọc</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      )}

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#f2f2f2',
          borderRadius: 50,
          mb: 4,
        }}
      >
        <InputBase
          sx={{ ml: 2, flex: 1, fontSize: '0.9rem' }}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton sx={{ p: '10px' }}>
          <SearchIcon />
        </IconButton>
      </Paper>

      {/* Price Filter */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Giá tiền
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
        {[
          { label: '0-100K', min: 0, max: 100000 },
          { label: '100-500K', min: 100000, max: 500000 },
          { label: '500K-1000K', min: 500000, max: 1000000 },
        ].map((btn) => (
          <Button
            key={btn.label}
            variant={
              priceRange.min === btn.min && priceRange.max === btn.max
                ? 'contained'
                : 'outlined'
            }
            onClick={() => handlePriceClick(btn.min, btn.max)}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              bgcolor:
                priceRange.min === btn.min && priceRange.max === btn.max
                  ? '#ccc'
                  : 'transparent',
              color: 'black',
              borderColor: '#ccc',
              '&:hover': { borderColor: '#999', bgcolor: '#eee' },
            }}
          >
            {btn.label}
          </Button>
        ))}
      </Box>

      {/* Category Filter */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Danh Mục Sản Phẩm
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {categories.map((cat) => (
          <Typography
            key={cat._id}
            onClick={() => {
              navigate(`/listproduct/${cat.slug}`)
              if (onClose) onClose()
            }}
            sx={{
              cursor: 'pointer',
              fontSize: '0.95rem',
              color: categorySlug === cat.slug ? '#000' : '#666',
              fontWeight: categorySlug === cat.slug ? 700 : 400,
              '&:hover': { color: '#000' },
              py: 0.5,
            }}
          >
            {cat.name} ({categoryCounts[cat._id] || 0})
          </Typography>
        ))}
      </Box>
    </Box>
  )

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 10 }, pb: 10 }}>
      {/* Mobile: Filter button + Sort row */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
          <Button
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ textTransform: 'none', borderColor: '#ccc', color: '#333', flex: 1 }}
          >
            Lọc & Tìm kiếm
            {(searchQuery || priceRange.min !== 0 || priceRange.max !== Infinity) && (
              <Box component="span" sx={{ ml: 1, bgcolor: '#ad2a36', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                !
              </Box>
            )}
          </Button>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              variant="outlined"
              sx={{ borderRadius: 1, bgcolor: '#fff', fontSize: '0.85rem' }}
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="priceAsc">Giá: Thấp → Cao</MenuItem>
              <MenuItem value="priceDesc">Giá: Cao → Thấp</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Sidebar - desktop only */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 120 }}>
            <SidebarContent />
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Desktop: top bar with count and sort */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing all {processedProducts.length} results
              </Typography>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  variant="outlined"
                  sx={{ borderRadius: 1, bgcolor: '#fff', fontSize: '0.9rem' }}
                >
                  <MenuItem value="newest">Sắp xếp theo mới nhất</MenuItem>
                  <MenuItem value="priceAsc">Giá: Thấp đến Cao</MenuItem>
                  <MenuItem value="priceDesc">Giá: Cao đến Thấp</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Mobile: result count */}
          {isMobile && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              {processedProducts.length} sản phẩm
            </Typography>
          )}

          {processedProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h5" color="text.secondary">
                Không tìm thấy sản phẩm phù hợp.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {processedProducts.map((product) => (
                <Grid item xs={6} sm={6} md={4} key={product._id}>
                  <Box
                    onClick={() => navigate(`/productdetail/${product._id}`)}
                  >
                    <ProductCard
                      product={product}
                      promotions={promosForProduct(product)}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Filter Drawer for mobile */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '85vw', sm: 340 }, p: 2.5 } }}
      >
        <SidebarContent onClose={() => setFilterDrawerOpen(false)} />
      </Drawer>
    </Container>
  )
}

export default ListProduct
