import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Grid, Typography, Container
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllCategorysAPI } from '~/apis/categoryAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'
import ProductCard from '~/components/customer/ProductHome/ProductCard/ProductCard'

function ListProduct() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()

  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])

  // Load products, categories, promotions
  useEffect(() => {
    const loadData = async () => {
      const [cats, prodRes, promos] = await Promise.all([ // prodRes instead of prods
        fetchAllCategorysAPI(),
        fetchAllProductsAPI(),
        fetchAllPromotionsAPI()
      ])
      setCategories(cats)
      setAllProducts(prodRes.data || []) // Extract .data
      setPromotions(promos)
    }
    loadData()
  }, [])

  // Sản phẩm mới trong 7 ngày
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const newProducts = useMemo(() => (
    allProducts.filter(p => new Date(p.createdAt).getTime() > oneWeekAgo)
  ), [allProducts, oneWeekAgo])

  // Lọc sản phẩm theo category
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return []

    // 1. HÀNG MỚI VỀ: Tất cả sản phẩm còn hàng, mới nhất lên đầu
    if (categorySlug === 'newest') {
      return [...allProducts]
        .filter(p => (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    // 2. FLASH SALE: Chỉ hiện các sản phẩm có khuyến mãi còn hiệu lực
    if (categorySlug === 'sale') {
      const now = new Date()
      return allProducts.filter(p => 
        promotions.some(promo => 
          promo.productIds?.includes(p._id) &&
          new Date(promo.startDate) <= now &&
          new Date(promo.endDate) >= now
        )
      )
    }

    // 3. TẤT CẢ SẢN PHẨM: Mặc định
    if (categorySlug === 'all') {
      return allProducts.filter(p => (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0))
    }

    if (!categories.length) return []
    const targetCat = categories.find(c => c.slug === categorySlug)
    if (!targetCat) return []

    // Lọc sản phẩm đúng category và còn stock
    return allProducts.filter(p => 
      p.categoryId === targetCat._id && 
      (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) > 0)
    )
  }, [categories, allProducts, categorySlug, promotions])

  // Banner theo category slug
  const bannerData = [
    { slug: 'nhan', imageUrl: 'https://cdn.pnj.io/images/promo/235/1200x450-nhan-t01-25.jpg', altText: 'Nhẫn' },
    { slug: 'day-chuyen', imageUrl: 'https://cdn.pnj.io/images/promo/257/daychuyen-t7-25-1200x450.jpg', altText: 'Dây chuyền' },
    { slug: 'bong-tai', imageUrl: 'https://cdn.pnj.io/images/promo/235/1200x450-bong-tai-t1-25.jpg', altText: 'Bông tai' }
  ]
  const banner = bannerData.find(b => b.slug === categorySlug)

  return (
    <Box sx={{ mt: 3, pb: 8 }}>
      <Box sx={{ px: 18.5 }}>
        {/* Banner */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {banner && (
            <img
              src={banner.imageUrl}
              alt={banner.altText}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          )}
        </Box>
      </Box>

      {/* Danh sách sản phẩm */}
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          {filteredProducts.length === 0 && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                Không có sản phẩm phù hợp
              </Typography>
            </Box>
          )}

          {filteredProducts.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={product._id}>
              <Box onClick={() => navigate(`/productdetail/${product._id}`)}>
                <ProductCard product={product} promotions={promotions} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default ListProduct
