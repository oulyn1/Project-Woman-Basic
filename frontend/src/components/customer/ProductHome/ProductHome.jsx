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

  // Filter Discounted Products
  const saleProducts = useMemo(() => {
    const productWithPromo = allProducts.filter(p => 
      promotions.some(promo => 
        promo.computedStatus === 'active' &&
        (promo.productIds?.includes('ALL') || promo.productIds?.includes(p._id))
      )
    )
    return productWithPromo.slice(0, 10)
  }, [allProducts, promotions])

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
                  <ProductCard product={product} promotions={promotions} />
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
                  <ProductCard product={product} promotions={promotions} />
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
