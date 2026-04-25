import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardMedia, CardContent, Typography, Box, Chip, Rating } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { getRatingsByProductId } from '~/apis/ratingAPIs'

const ProductCard = ({ product, promotions = [] }) => {
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const ratings = await getRatingsByProductId(product._id)
        if (ratings?.length > 0) {
          const total = ratings.reduce((sum, r) => sum + r.star, 0)
          setAvgRating(total / ratings.length)
        }
      } catch { /* silent error */ }
    }
    fetchRating()
  }, [product._id])

  const highestPromotion = useMemo(() => {
    const active = promotions.filter(promo => {
      const isTargeted = promo.productIds?.includes('ALL') || promo.productIds?.includes(product._id)
      return isTargeted && promo.computedStatus === 'active'
    })

    if (active.length === 0) return null

    // Logic: Find the one that gives the maximum absolute discount
    return active.reduce((prev, curr) => {
      const getVal = (p) => p.discountType === 'percent'
        ? (product.price * p.discountValue / 100)
        : p.discountValue
      return getVal(prev) > getVal(curr) ? prev : curr
    })
  }, [product._id, product.price, promotions])

  const discountAmount = useMemo(() => {
    if (!highestPromotion) return 0
    return highestPromotion.discountType === 'percent'
      ? Math.round(product.price * (highestPromotion.discountValue / 100))
      : highestPromotion.discountValue
  }, [highestPromotion, product.price])

  const finalPrice = product.price - discountAmount

  const uniqueColors = useMemo(() => {
    const colors = []
    const seen = new Set()
    product.variants?.forEach(v => {
      if (v.color?.hex && !seen.has(v.color.hex)) {
        seen.add(v.color.hex)
        colors.push(v.color.hex)
      }
    })
    return colors
  }, [product.variants])

  return (
    <Card sx={{
      width: '100%',
      borderRadius: 1,
      position: 'relative',
      m: 0,
      cursor: 'pointer',
      boxShadow: 'none',
      '&:hover': {
        '& .MuiCardMedia-root': { transform: 'scale(1.05)' }
      },
      transition: '0.3s'
    }}>
      {/* Discount Badge */}
      {highestPromotion && (
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: '#ad2a36',
          color: 'white',
          px: 1,
          py: 0.2,
          borderRadius: 0.5,
          zIndex: 1,
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          -{highestPromotion.discountType === 'percent'
            ? `${highestPromotion.discountValue}%`
            : `${(highestPromotion.discountValue/1000)}k`}
        </Box>
      )}

      <Box sx={{ overflow: 'hidden', bgcolor: '#f7f7f7', borderRadius: 1 }}>
        <CardMedia
          component="img"
          image={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          sx={{
            height: { xs: 180, sm: 240, md: 300 },
            width: '100%',
            objectFit: 'cover',
            transition: '0.5s transform ease'
          }}
        />
      </Box>

      <CardContent sx={{ px: 1, pt: 2, pb: '8px !important' }}>
        {/* Title */}
        <Typography
          sx={{
            fontSize: { xs: '0.8rem', md: '0.95rem' },
            fontWeight: 500,
            color: '#1a1a1a',
            minHeight: '2.5rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 0.5
          }}
        >
          {product.name}
        </Typography>

        {/* Color Swatches */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          {uniqueColors.slice(0, 5).map((hex, idx) => (
            <Box
              key={idx}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: hex,
                border: '1px solid #ddd'
              }}
            />
          ))}
          {uniqueColors.length > 5 && (
            <Typography variant="caption" color="text.secondary">+{uniqueColors.length - 5}</Typography>
          )}
        </Box>

        {/* Rating & Sold */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ fontSize: 14, color: '#FFD700' }} />
            <Typography variant="caption" fontWeight="bold" sx={{ ml: 0.5 }}>
              {avgRating > 0 ? avgRating.toFixed(1) : '5.0'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">|</Typography>
          <Typography variant="caption" color="text.secondary">
            {product.sold || 0} đã bán
          </Typography>
        </Box>

        {/* Pricing */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 700, color: '#ad2a36' }}>
            {finalPrice.toLocaleString()} ₫
          </Typography>
          {highestPromotion && (
            <Typography sx={{ fontSize: '0.85rem', color: '#999', textDecoration: 'line-through' }}>
              {product.price.toLocaleString()} ₫
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProductCard
