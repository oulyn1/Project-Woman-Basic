/* eslint-disable no-console */
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductDetailAPI } from '~/apis/productAPIs'
import { getRatingsByProductId } from '~/apis/ratingAPIs'
import { useCart } from '~/context/Cart/useCart'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'
import AuthDialog from '~/components/customer/Header/AuthDialog'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount,
  )

function ProductDetail() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { addToCart, cartItems } = useCart()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [ratings, setRatings] = useState([])
  const [averageStar, setAverageStar] = useState(0)
  const [promotions, setPromotions] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [quantity, setQuantity] = useState(1)

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [mainImage, setMainImage] = useState('')
  const [openAuthDialog, setOpenAuthDialog] = useState(false)

  // Load current user từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Error loading user:', err)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, promos] = await Promise.all([
          getProductDetailAPI(productId),
          fetchAllPromotionsAPI(),
        ])
        const prodData = prodRes.data
        setProduct(prodData)
        setMainImage(prodData.images?.[0] || '')

        const ratingsData = await getRatingsByProductId(productId)
        setRatings(ratingsData)

        if (ratingsData?.length > 0) {
          const total = ratingsData.reduce((sum, r) => sum + r.star, 0)
          setAverageStar(total / ratingsData.length)
        }

        // Filter promotions to apply to this product and current user
        const now = new Date()
        const promosList = promos.items ?? []
        const user = currentUser
        const isProductPromo = (p) =>
          p.productIds?.includes('ALL') || p.productIds?.includes(prodData._id)
        const isActivePromo = (p) => {
          if (p.status !== 'active') return false
          const startOk = !p.startDate || new Date(p.startDate) <= now
          const endOk =
            !p.endDate || p.endDate === null || new Date(p.endDate) >= now
          return startOk && endOk
        }
        const isEligibleForUser = (p) => {
          const cond = p.condition ?? { type: 'all', loyalTiers: [] }
          switch (cond.type) {
          case 'all':
            return true
          case 'loyal':
            return (
              !!user?.loyaltyTier &&
                (cond.loyalTiers ?? []).includes(user.loyaltyTier)
            )
          case 'specific':
            return (
              !!user?._id &&
                (cond.specificCustomerIds ?? []).some(
                  (id) => String(id) === String(user._id),
                )
            )
          case 'new':
            return (cond.newCustomerMaxOrders ?? null) == null
          default:
            return true
          }
        }
        const appliedPromos = promosList.filter(
          (p) => isProductPromo(p) && isActivePromo(p) && isEligibleForUser(p),
        )
        setPromotions(appliedPromos)
      } catch {
        /* error handled in layout */
      }
      setLoading(false)
    }
    if (productId) fetchData()
  }, [productId, currentUser?.id, currentUser])

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedSize, selectedColor])

  const uniqueSizes = useMemo(() => {
    if (!product?.variants) return []
    return [...new Set(product.variants.map((v) => v.size))]
  }, [product])

  const uniqueColors = useMemo(() => {
    if (!product?.variants) return []
    const colors = []
    const seen = new Set()
    product.variants.forEach((v) => {
      if (!seen.has(v.color.hex)) {
        seen.add(v.color.hex)
        colors.push(v.color)
      }
    })
    return colors
  }, [product])

  const currentVariant = useMemo(() => {
    if (!product?.variants || !selectedSize || !selectedColor) return null
    return product.variants.find(
      (v) => v.size === selectedSize && v.color.hex === selectedColor.hex,
    )
  }, [product, selectedSize, selectedColor])

  const isOutOfStock = useMemo(() => {
    if (!currentVariant) return true
    const existingInCart = cartItems.find(
      (i) => i.productId === product._id && i.variantId === currentVariant._id,
    )
    const quantityInCart = existingInCart ? existingInCart.quantity : 0
    return (
      quantityInCart + quantity > currentVariant.stock ||
      currentVariant.stock === 0
    )
  }, [currentVariant, cartItems, product, quantity])

  const handleCartClick = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setOpenAuthDialog(true)
      return
    }
    if (currentVariant && !isOutOfStock) {
      setIsAdding(true)
      const res = await addToCart(
        product,
        currentVariant._id,
        quantity,
        currentVariant.color?.name || '',
        currentVariant.size || '',
      )
      setIsAdding(false)

      if (res?.success) {
        setSnackbar({
          open: true,
          message: 'Đã thêm sản phẩm vào giỏ hàng!',
          severity: 'success',
        })
      } else {
        setSnackbar({
          open: true,
          message: res?.error || 'Có lỗi xảy ra, vui lòng thử lại!',
          severity: 'error',
        })
      }
    }
  }

  const handleNowClick = () => {
    if (!currentVariant) return
    navigate('/checkout', {
      state: {
        products: [
          {
            _id: product._id,
            variantId: currentVariant._id,
            name: `${product.name} (${selectedSize} / ${selectedColor.name})`,
            image: product.images?.[0],
            price: finalPrice,
            quantity: quantity,
          },
        ],
        fromBuyNow: true,
      },
    })
  }

  const bestPromotion = useMemo(() => {
    if (!promotions.length || !product) return null
    return promotions.reduce((prev, curr) => {
      const getVal = (p) =>
        p.discountType === 'percent'
          ? (product.price * p.discountValue) / 100
          : p.discountValue
      return getVal(prev) > getVal(curr) ? prev : curr
    })
  }, [promotions, product])

  const finalPrice = useMemo(() => {
    if (!product) return 0
    if (!bestPromotion) return product.price
    const discount =
      bestPromotion.discountType === 'percent'
        ? Math.round(product.price * (bestPromotion.discountValue / 100))
        : bestPromotion.discountValue
    return product.price - discount
  }, [product, bestPromotion])

  if (loading || !product) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container sx={{ py: { xs: 3, md: 6 }, pb: { xs: isMobile ? '90px' : 6, md: 6 } }}>
      <Grid container spacing={{ xs: 3, md: 8 }}>
        {/* Gallery Column */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 4,
              overflow: 'hidden',
              mb: 2,
            }}
          >
            <img
              src={mainImage}
              alt={product.name}
              style={{ width: '100%', height: isMobile ? '300px' : '500px', objectFit: 'contain' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {product.images?.map((img, idx) => (
              <Box
                key={idx}
                onClick={() => setMainImage(img)}
                sx={{
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border:
                    mainImage === img ? '2px solid #ad2a36' : '1px solid #ddd',
                }}
              >
                <img
                  src={img}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Info Column */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1, fontSize: { xs: '1.4rem', md: '2.125rem' } }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: '#FFD700' }} />
              <Typography fontWeight="bold">
                {averageStar.toFixed(1)}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Typography color="text.secondary">
              {product.sold || 0} đã bán
            </Typography>
          </Box>

          {bestPromotion ? (
            <Box sx={{ bgcolor: '#fff5f5', p: 3, borderRadius: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: '#ad2a36', fontSize: { xs: '1.4rem', md: '2.125rem' } }}
                >
                  {formatCurrency(finalPrice)}
                </Typography>
                {finalPrice < product.price && (
                  <Typography
                    sx={{ textDecoration: 'line-through', color: '#999' }}
                  >
                    {formatCurrency(product.price)}
                  </Typography>
                )}
              </Box>
              <Chip
                label={`Giảm ${bestPromotion.discountValue}${bestPromotion.discountType === 'percent' ? '%' : 'đ'} - ${bestPromotion.title}`}
                color="error"
                size="small"
                sx={{ mt: 1, fontWeight: 'bold' }}
              />
            </Box>
          ) : (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: 'inherit', fontSize: { xs: '1.4rem', md: '2.125rem' } }}
              >
                {formatCurrency(finalPrice)}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Màu sắc
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {uniqueColors.map((color) => (
                <Tooltip key={color.hex} title={color.name}>
                  <Box
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: color.hex,
                      cursor: 'pointer',
                      border:
                        selectedColor?.hex === color.hex
                          ? '3px solid #ad2a36'
                          : '1px solid #ddd',
                      outline:
                        selectedColor?.hex === color.hex
                          ? '2px solid white'
                          : 'none',
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Kích thước
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {uniqueSizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'contained' : 'outlined'}
                  onClick={() => setSelectedSize(size)}
                  sx={{ minWidth: 60, borderRadius: 2 }}
                >
                  {size}
                </Button>
              ))}
            </Box>
          </Box>

          {currentVariant && (
            <>
              <Typography
                variant="body2"
                color={currentVariant.stock > 0 ? 'success.main' : 'error.main'}
                sx={{ mb: 2, fontWeight: 'bold' }}
              >
                {currentVariant.stock > 0
                  ? `Còn ${currentVariant.stock} sản phẩm`
                  : 'Hết hàng cho biến thể này'}
              </Typography>

              {currentVariant.stock > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Số lượng
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #ddd',
                      borderRadius: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      disabled={quantity <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 3, fontWeight: 'bold' }}>
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setQuantity((prev) =>
                          currentVariant && prev < currentVariant.stock
                            ? prev + 1
                            : prev,
                        )
                      }
                      disabled={
                        currentVariant && quantity >= currentVariant.stock
                      }
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </>
          )}

          {/* Desktop: inline CTA buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button
              disabled={isAdding || !currentVariant || isOutOfStock}
              variant="contained"
              size="large"
              onClick={handleNowClick}
              sx={{
                flex: 1,
                bgcolor: '#ad2a36',
                '&:hover': { bgcolor: '#8e212b' },
                py: 1.5,
                borderRadius: 3,
              }}
            >
              Mua ngay
            </Button>
            <Button
              disabled={isAdding || !currentVariant || isOutOfStock}
              variant="outlined"
              size="large"
              onClick={handleCartClick}
              sx={{
                flex: 1,
                color: '#ad2a36',
                borderColor: '#ad2a36',
                '&:hover': { borderColor: '#8e212b' },
                py: 1.5,
                borderRadius: 3,
              }}
            >
              {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </Button>
          </Box>

          {/* Mobile: sticky bottom bar */}
          {isMobile && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                bgcolor: 'white',
                borderTop: '1px solid #eee',
                p: 1.5,
                display: 'flex',
                gap: 1,
                boxShadow: '0 -2px 12px rgba(0,0,0,0.12)',
              }}
            >
              <Button
                disabled={isAdding || !currentVariant || isOutOfStock}
                variant="outlined"
                fullWidth
                onClick={handleCartClick}
                sx={{
                  color: '#ad2a36',
                  borderColor: '#ad2a36',
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
              <Button
                disabled={isAdding || !currentVariant || isOutOfStock}
                variant="contained"
                fullWidth
                onClick={handleNowClick}
                sx={{
                  bgcolor: '#ad2a36',
                  '&:hover': { bgcolor: '#8e212b' },
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Mua ngay
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h5"
          sx={{
            borderLeft: '5px solid #ad2a36',
            pl: 2,
            mb: 3,
            fontWeight: 'bold',
          }}
        >
          CHI TIẾT SẢN PHẨM
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#444', lineHeight: 1.8, whiteSpace: 'pre-line' }}
        >
          {product.description}
        </Typography>
      </Box>

      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h5"
          sx={{
            borderLeft: '5px solid #ad2a36',
            pl: 2,
            mb: 4,
            fontWeight: 'bold',
          }}
        >
          ĐÁNH GIÁ TỪ KHÁCH HÀNG
        </Typography>
        {ratings.length > 0 ? (
          ratings.map((review, i) => (
            <Box
              key={i}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: '#fafafa',
                borderRadius: 4,
                border: '1px solid #eee',
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[...Array(5)].map((_, star) => (
                    <StarIcon
                      key={star}
                      sx={{
                        fontSize: 18,
                        color: star < review.star ? 'gold' : '#ddd',
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#333' }}>
                {review.description}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">
            Chưa có đánh giá nào cho sản phẩm này.
          </Typography>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '80px' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AuthDialog
        open={openAuthDialog}
        onClose={() => setOpenAuthDialog(false)}
      />
    </Container>
  )
}

export default ProductDetail
