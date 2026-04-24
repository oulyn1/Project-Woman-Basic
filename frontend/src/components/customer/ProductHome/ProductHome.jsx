import { Box, Button, Typography, Container, Grid } from '@mui/material'
import React, { useEffect, useState, useMemo } from 'react'
import ProductCard from './ProductCard/ProductCard'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'
import { useNavigate } from 'react-router-dom'

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
        // Filter promotions to apply per-user in UI layer
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
  // Filter Discounted Products
  const saleProducts = useMemo(() => {
    const now = new Date()
    const productWithPromo = allProducts.filter(p => promotions.some(promo => {
      const isProductPromo = promo.productIds?.includes('ALL') || promo.productIds?.includes(p._id)
      const isActive = promo.computedStatus === 'active' && (!promo.startDate || new Date(promo.startDate) <= now) && (!promo.endDate || promo.endDate === null || new Date(promo.endDate) >= now)
      // user eligibility gating
      let isEligible = true
      const cond = promo.condition ?? { type: 'all', loyalTiers: [], specificCustomerIds: [] }
      switch (cond.type) {
        case 'all': break
        case 'loyal': isEligible = !!currentUser?.loyaltyTier && (cond.loyalTiers ?? []).includes(currentUser.loyaltyTier); break
        case 'specific': isEligible = !!currentUser?._id && (cond.specificCustomerIds ?? []).some(id => String(id) === String(currentUser._id)); break
        case 'new': isEligible = (cond.newCustomerMaxOrders ?? null) == null; break
        default: break
      }
      return isProductPromo && isActive && isEligible
    }))
    return productWithPromo.slice(0, 10)
  }, [allProducts, promotions, currentUser])

  return (
    <Box sx={{ pb: 8 }}>
      <Container maxWidth="xl">
        {/* New Arrivals Section */}
        <Box sx={{ mt: 6, mb: 8 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ fontWeight: 'bold', mb: 4, letterSpacing: 1 }}
          >
            HÀNG MỚI VỀ
          </Typography>
          <Grid container spacing={2}>
            {newProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={product._id}>
                <Box onClick={() => navigate(`/productdetail/${product._id}`)}>
                  <ProductCard product={product} promotions={promosForProduct(product)} />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/listproduct/newest')}
              sx={{ px: 4, py: 1, borderRadius: 2, borderColor: '#333', color: '#333' }}
            >
              Xem thêm
            </Button>
          </Box>
        </Box>

        {/* Promotion Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ fontWeight: 'bold', mb: 4, letterSpacing: 1 }}
          >
            WOMAN BASIC - GIẢM GIÁ ĐẾN 50%
          </Typography>
          <Grid container spacing={2}>
            {saleProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={product._id}>
                <Box onClick={() => navigate(`/productdetail/${product._id}`)}>
                  <ProductCard product={product} promotions={promosForProduct(product)} />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/listproduct/sale')}
              sx={{ px: 4, py: 1, borderRadius: 2, borderColor: '#333', color: '#333' }}
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
