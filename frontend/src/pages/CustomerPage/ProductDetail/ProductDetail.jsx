import { Box, Button, Container, Typography } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import React, { useEffect, useState } from 'react'
import ServiceDetail from '~/components/customer/ServiceDetail/ServiceDetail'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductDetailAPI } from '~/apis/productAPIs'
import { getRatingsByProductId } from '~/apis/ratingAPIs'
import { useCart } from '~/context/Cart/useCart'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

function ProductDetail() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { addToCart, cartItems } = useCart()
  const [product, setProduct] = useState({})
  const [_loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [_ratings, setRatings] = useState([])
  const [averageStar, setAverageStar] = useState(0)
  const [promotions, setPromotions] = useState([])

  useEffect(() => {
    setLoading(true)
    const calculateAverageRating = (ratings) => {
      if (!ratings || ratings.length === 0) return 0
      const total = ratings.reduce((sum, r) => sum + r.star, 0)
      return total / ratings.length
    }
    const fetchData = async () => {
      try {
        const [product, promotions] = await Promise.all([
          getProductDetailAPI(productId),
          fetchAllPromotionsAPI()
        ])
        setProduct(product)
        const ratings = await getRatingsByProductId(productId)
        setRatings(ratings)
        setAverageStar(calculateAverageRating(ratings))

        const now = new Date()
        const appliedPromos = promotions.filter(
          p => p.productIds?.includes(product._id) &&
               new Date(p.startDate) <= now &&
               new Date(p.endDate) >= now
        )
        setPromotions(appliedPromos)
      } catch {
        //
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId])

  const existingItem = cartItems.find(item => item.productId === product._id)
  const currentQuantity = existingItem ? existingItem.quantity : 0
  const maxStock = product.stock || 0
  const isOutOfStock = currentQuantity >= maxStock || maxStock === 0

  const handleCartClick = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }
    if (product && product._id && !isOutOfStock) {
      try {
        setIsAdding(true)
        await addToCart(product, 1)
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleNowClick = () => {
    navigate('/checkout', {
      state: {
        products: [
          {
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: 1
          }
        ],
        fromBuyNow: true
      }
    })
  }

  // Hàm tính giá sau khi áp dụng khuyến mãi
  const getDiscountedPrice = (product) => {
    if (!promotions || promotions.length === 0) return product.price
    const now = new Date()
    const promo = promotions.find(p =>
      p.productIds?.includes(product._id) &&
      new Date(p.startDate) <= now &&
      new Date(p.endDate) >= now
    )
    if (promo) {
      return Math.round(product.price * (1 - promo.discountPercent / 100))
    }
    return product.price
  }

  const finalPrice = getDiscountedPrice(product)

  return (
    <>
      <Container sx={{ px: 10, py: 4, display: 'flex', gap: 10 }}>
        <Box sx={{ backgroundColor: '#f7f7f7' }}>
          <img src={product.image} alt={product.name} style={{ width: '500px' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Mã: {product.name?.split(' ').pop()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <StarIcon sx={{ fontSize: 20, color: 'gold' }} /> ({averageStar.toFixed(1)})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.sold || 0} đã bán
              </Typography>
            </Box>
          </Box>
          {/* Giá sản phẩm với khuyến mãi */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            {finalPrice < product.price && (
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: '#999' }}
              >
                {formatCurrency(product.price)}
              </Typography>
            )}
            <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#cc3300' }}>
              {formatCurrency(finalPrice)}
            </Typography>
          </Box>
          {/* Dòng khuyến mãi */}
          {promotions.length > 0 && (
            <Typography sx={{ fontSize: 14, color: '#DC2626', mb: 2 }}>
              Giảm {promotions[0].discountPercent}% - {promotions[0].title}
            </Typography>
          )}
          <ServiceDetail />
          <Box sx={{ mt: 2, borderRadius: '8px' }}>
            <Box
              sx={{
                backgroundColor: '#f7f7f7',
                height: '50px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                px: 2
              }}
            >
              <Typography variant="h6">Mô tả sản phẩm</Typography>
            </Box>
            <Box sx={{ borderBottomRightRadius: '8px', borderBottomLeftRadius: '8px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                {product.description}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            sx={{
              width: '100%',
              mt: 2,
              textTransform: 'none',
              backgroundColor: '#ad2a36',
              color: 'white'
            }}
            onClick={handleNowClick}
            disabled={_loading || isAdding}
          >
            <Typography sx={{ m: 0.5 }}>Mua ngay</Typography>
          </Button>
          <Button
            variant="outlined"
            sx={{ width: '100%', mt: 2, textTransform: 'none' }}
            onClick={handleCartClick}
            disabled={_loading || isAdding || isOutOfStock}
          >
            <Typography sx={{ m: 0.5 }}>Thêm vào giỏ hàng</Typography>
          </Button>
        </Box>
      </Container>
      {/* Box hiển thị đánh giá sản phẩm */}
      <Container>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Đánh giá sản phẩm
          </Typography>
          {_ratings && _ratings.length > 0 ? (
            _ratings.map((review, index) => {
              const formattedDate = new Date(review.createdAt).toLocaleDateString('vi-VN')
              return (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    backgroundColor: '#fafafa'
                  }}
                >
                  {/* Ngày tạo */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formattedDate}
                  </Typography>
                  {/* Sao đánh giá */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{
                          fontSize: 20,
                          color: i < review.star ? 'gold' : '#ccc'
                        }}
                      />
                    ))}
                  </Box>
                  {/* Nội dung */}
                  <Typography variant="body1">{review.description}</Typography>
                </Box>
              )
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chưa có đánh giá nào cho sản phẩm này
            </Typography>
          )}
        </Box>
      </Container>
    </>
  )
}

export default ProductDetail
