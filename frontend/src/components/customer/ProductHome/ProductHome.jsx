import { Box, Button, Typography, Container, IconButton } from '@mui/material'
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ProductCard from './ProductCard/ProductCard'
import RecommendedSection from './RecommendedSection'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'
import { useNavigate } from 'react-router-dom'

/** Scrollbar ngang có nút điều hướng */
function HorizontalProductScroll({ products, navigate, promosForProduct }) {
  const scrollRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    updateArrows()
    return () => el.removeEventListener('scroll', updateArrows)
  }, [updateArrows, products])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector(':scope > div')?.offsetWidth || 260
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' })
  }

  return (
    <Box sx={{ position: 'relative', '&:hover .scroll-arrow': { opacity: 1 } }}>
      {/* Left Arrow */}
      {showLeft && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute', left: { xs: 0, md: -20 }, top: '40%', zIndex: 2,
            bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: { xs: 1, md: 0 }, transition: 'opacity 0.3s',
            '&:hover': { bgcolor: '#f5f5f5' },
            width: 40, height: 40,
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 16, color: '#333' }} />
        </IconButton>
      )}

      {/* Right Arrow */}
      {showRight && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute', right: { xs: 0, md: -20 }, top: '40%', zIndex: 2,
            bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: { xs: 1, md: 0 }, transition: 'opacity 0.3s',
            '&:hover': { bgcolor: '#f5f5f5' },
            width: 40, height: 40,
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 16, color: '#333' }} />
        </IconButton>
      )}

      {/* Scrollable Row */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: { xs: 1.5, md: 2 },
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          pb: 1.5,
          px: 0.5,
          // Custom scrollbar
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: '#f0f0f0', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#ccc', borderRadius: 3,
            '&:hover': { bgcolor: '#aaa' },
          },
          // Firefox
          scrollbarWidth: 'thin',
          scrollbarColor: '#ccc #f0f0f0',
        }}
      >
        {products.map(product => (
          <Box
            key={product._id}
            onClick={() => navigate(`/productdetail/${product._id}`)}
            sx={{
              flex: '0 0 auto',
              width: { xs: '45%', sm: '30%', md: '23%' },
              scrollSnapAlign: 'start',
              cursor: 'pointer',
            }}
          >
            <ProductCard product={product} promotions={promosForProduct(product)} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function ProductHome() {
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

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
    const fetchData = async () => {
      try {
        const [prodRes, promoRes] = await Promise.all([
          fetchAllProductsAPI(),
          fetchAllPromotionsAPI()
        ])
        setAllProducts(prodRes.data || [])
        setPromotions(promoRes.items || [])
      } catch (err) { console.error(err) }
    }
    fetchData()
  }, [])

  // Filter New Products (Created within last 30 days)
  const newProducts = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return allProducts
      .filter(p => new Date(p.createdAt).getTime() > thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
  }, [allProducts])

  // Helper: check if promo is active today
  const nowDate = new Date()
  const isPromoActive = (p) => p.computedStatus === 'active' && (!p.startDate || new Date(p.startDate) <= nowDate) && (!p.endDate || p.endDate === null || new Date(p.endDate) >= nowDate)
  // Helper: check if promo targets given product
  const isProductPromo = (p, productId) => p.productIds?.includes('ALL') || p.productIds?.includes(productId)
  // Helper: check user eligibility for promo
  const isPromoEligibleForUser = (p) => {
    const user = currentUser
    const cond = p.condition ?? { type: 'all', loyalTiers: [], specificCustomerIds: [] }
    switch (cond.type) {
    case 'all': return true
    case 'loyal': return !!user?.loyaltyTier && (cond.loyalTiers ?? []).includes(user.loyaltyTier)
    case 'specific': return !!user?._id && (cond.specificCustomerIds ?? []).some(id => String(id) === String(user._id))
    case 'new': return (cond.newCustomerMaxOrders ?? null) == null
    default: return true
    }
  }
  const promosForProduct = (prod) => promotions.filter(p => isProductPromo(p, prod._id) && isPromoActive(p) && isPromoEligibleForUser(p))

  // Tính % giảm giá cao nhất cho 1 sản phẩm
  const getMaxDiscount = (product) => {
    const now = new Date()
    let maxDiscount = 0
    promotions.forEach(promo => {
      const isTarget = promo.productIds?.includes('ALL') || promo.productIds?.includes(product._id)
      const isActive = promo.computedStatus === 'active' && (!promo.startDate || new Date(promo.startDate) <= now) && (!promo.endDate || promo.endDate === null || new Date(promo.endDate) >= now)
      if (!isTarget || !isActive) return
      const cond = promo.condition ?? { type: 'all' }
      let isEligible = true
      switch (cond.type) {
      case 'all': break
      case 'loyal': isEligible = !!currentUser?.loyaltyTier && (cond.loyalTiers ?? []).includes(currentUser.loyaltyTier); break
      case 'specific': isEligible = !!currentUser?._id && (cond.specificCustomerIds ?? []).some(id => String(id) === String(currentUser._id)); break
      case 'new': isEligible = (cond.newCustomerMaxOrders ?? null) == null; break
      default: break
      }
      if (isEligible && (promo.discountPercent || 0) > maxDiscount) {
        maxDiscount = promo.discountPercent || 0
      }
    })
    return maxDiscount
  }

  // Lọc sản phẩm có khuyến mãi, sort theo % giảm giá cao nhất, lấy 10 sản phẩm
  const saleProducts = useMemo(() => {
    const now = new Date()
    const productWithPromo = allProducts.filter(p => promotions.some(promo => {
      const isTargetProduct = promo.productIds?.includes('ALL') || promo.productIds?.includes(p._id)
      const isActive = promo.computedStatus === 'active' && (!promo.startDate || new Date(promo.startDate) <= now) && (!promo.endDate || promo.endDate === null || new Date(promo.endDate) >= now)
      let isEligible = true
      const cond = promo.condition ?? { type: 'all', loyalTiers: [], specificCustomerIds: [] }
      switch (cond.type) {
      case 'all': break
      case 'loyal': isEligible = !!currentUser?.loyaltyTier && (cond.loyalTiers ?? []).includes(currentUser.loyaltyTier); break
      case 'specific': isEligible = !!currentUser?._id && (cond.specificCustomerIds ?? []).some(id => String(id) === String(currentUser._id)); break
      case 'new': isEligible = (cond.newCustomerMaxOrders ?? null) == null; break
      default: break
      }
      return isTargetProduct && isActive && isEligible
    }))
    // Sort theo % giảm giá cao nhất
    return productWithPromo
      .sort((a, b) => getMaxDiscount(b) - getMaxDiscount(a))
      .slice(0, 10)
  }, [allProducts, promotions, currentUser])

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="lg">
        {/* Recommended Section — phía trên New Arrivals */}
        <RecommendedSection />

        {/* New Arrivals Section */}
        <Box sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              mb: { xs: 3, md: 4 },
              letterSpacing: 1,
              fontSize: { xs: '1.4rem', md: '2.125rem' },
            }}
          >
            HÀNG MỚI VỀ
          </Typography>
          <HorizontalProductScroll
            products={newProducts}
            navigate={navigate}
            promosForProduct={promosForProduct}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/listproduct/newest')}
              sx={{
                px: { xs: 3, md: 4 },
                py: 1,
                borderRadius: 2,
                borderColor: '#333',
                color: '#333',
                fontSize: { xs: '0.85rem', md: '1rem' },
              }}
            >
              Xem thêm
            </Button>
          </Box>
        </Box>

        {/* Promotion Section */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              mb: { xs: 3, md: 4 },
              letterSpacing: 1,
              fontSize: { xs: '1.2rem', md: '2.125rem' },
            }}
          >
            WOMAN BASIC - GIẢM GIÁ ĐẾN 50%
          </Typography>
          <HorizontalProductScroll
            products={saleProducts}
            navigate={navigate}
            promosForProduct={promosForProduct}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/listproduct/sale')}
              sx={{
                px: { xs: 3, md: 4 },
                py: 1,
                borderRadius: 2,
                borderColor: '#333',
                color: '#333',
                fontSize: { xs: '0.85rem', md: '1rem' },
              }}
            >
              Xem thêm
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default ProductHome

