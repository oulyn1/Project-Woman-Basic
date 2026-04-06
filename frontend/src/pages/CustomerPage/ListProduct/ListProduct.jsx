import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Grid, Typography, Card,
  CardMedia, CardContent
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllCategorysAPI } from '~/apis/categoryAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'

function ListProduct() {
  const navigate = useNavigate()
  const { genderSlug, typeSlug, materialSlug } = useParams()

  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])

  // Load products, categories, promotions
  useEffect(() => {
    const loadData = async () => {
      const [cats, prods, promos] = await Promise.all([
        fetchAllCategorysAPI(),
        fetchAllProductsAPI(),
        fetchAllPromotionsAPI()
      ])
      setCategories(cats)
      setAllProducts(prods)
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
    if (!categories.length || !allProducts.length) return []

    const genderCat = categories.find(c => c.slug === genderSlug)
    if (!genderCat) return []

    const typeCat = categories.find(
      c => c.slug === typeSlug && c.parentId === genderCat._id
    )
    if (!typeCat) return []

    const materialCat = categories.find(
      c => c.slug === materialSlug && c.parentId === typeCat._id
    )
    if (!materialCat) return []

    // Lọc sản phẩm đúng material và còn stock
    return allProducts.filter(p => p.categoryId === materialCat._id && p.stock > 0)
  }, [categories, allProducts, genderSlug, typeSlug, materialSlug])

  // Banner theo type
  const bannerData = [
    { slug: 'nhan', imageUrl: 'https://cdn.pnj.io/images/promo/235/1200x450-nhan-t01-25.jpg', altText: 'Nhẫn' },
    { slug: 'day-chuyen', imageUrl: 'https://cdn.pnj.io/images/promo/257/daychuyen-t7-25-1200x450.jpg', altText: 'Dây chuyền' },
    { slug: 'bong-tai', imageUrl: 'https://cdn.pnj.io/images/promo/235/1200x450-bong-tai-t1-25.jpg', altText: 'Bông tai' }
  ]
  const banner = bannerData.find(b => b.slug === typeSlug)

  const now = new Date()

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ px: 18.5 }}>
        {/* Banner */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {banner && (
            <img
              src={banner.imageUrl}
              alt={banner.altText}
              style={{ width: '100%' }}
            />
          )}
        </Box>
      </Box>

      {/* Danh sách sản phẩm */}
      <Grid container spacing={2} justifyContent="center">
        {filteredProducts.length === 0 && (
          <Typography variant="h6" color="error">
            Không có sản phẩm phù hợp
          </Typography>
        )}

        {filteredProducts.map(product => {
          const isNew = newProducts.some(np => np._id === product._id)

          // Lọc khuyến mãi đang áp dụng cho sản phẩm
          const appliedPromotions = promotions.filter(promo =>
            promo.productIds?.includes(product._id) &&
            new Date(promo.startDate) <= now &&
            new Date(promo.endDate) >= now
          )

          return (
            <Grid item key={product._id}>
              <Card
                sx={{
                  width: 292,
                  height: 450,
                  borderRadius: 2,
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onClick={() => navigate(`/productdetail/${product._id}`)}
              >
                {isNew && (
                  <Box sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'white',
                    p: 0.5,
                    borderRadius: '50%',
                    boxShadow: 1
                  }}>
                    <Typography variant="caption" sx={{ color: '#143765', fontWeight: 'bold' }}>
                      NEW
                    </Typography>
                  </Box>
                )}

                <CardMedia
                  component="img"
                  sx={{ width: 292, height: 292, objectFit: 'cover' }}
                  image={product.image}
                  alt={product.name}
                />

                <CardContent sx={{ p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Typography sx={{ fontSize: 14, color: '#5A5A5A', textAlign: 'center', minHeight: '63px' }}>
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: '#c48c46', textAlign: 'center', mt: 1 }}>
                      {product.price.toLocaleString()} ₫
                    </Typography>

                    {/* Hiển thị promotion nếu có */}
                    {appliedPromotions.map((promo, idx) => (
                      <Typography key={idx} sx={{ fontSize: 11, color: '#DC2626', textAlign: 'center', mt: 1 }}>
                        {promo.title} giảm {promo.discountPercent}%
                      </Typography>
                    ))}
                  </Box>

                  <Typography sx={{ fontSize: 10, color: '#5A5A5A', textAlign: 'right', mt: 1 }}>
                    {product.sold || 0} đã bán
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default ListProduct
