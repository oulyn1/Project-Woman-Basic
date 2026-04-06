import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Box, Typography, IconButton, TextField, Button } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate, useLocation } from 'react-router-dom'
import CartContext from '~/context/Cart/CartContext'
import { createOrderAPI } from '~/apis/orderAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'

function Checkout() {
  const { cartItems = [], updateQuantity, removeManyFromCart } = useContext(CartContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { products: buyNowProducts = [], fromBuyNow = false } = location.state || {}

  const [buyNowState, setBuyNowState] = useState(
    buyNowProducts.map(p => ({ ...p, quantity: p.quantity || 1 }))
  )
  const [promotions, setPromotions] = useState([])

  useEffect(() => {
    const loadPromotions = async () => {
      const allPromos = await fetchAllPromotionsAPI()
      setPromotions(allPromos)
    }
    loadPromotions()
  }, [])

  const products = useMemo(() => {
    if (fromBuyNow) {
      return buyNowState.map(p => ({
        productId: p._id,
        product: p,
        quantity: p.quantity || 1
      }))
    }
    return cartItems
  }, [fromBuyNow, buyNowState, cartItems])

  // Hàm tính giá giảm cho sản phẩm nếu có khuyến mãi
  const getDiscountedPrice = (product) => {
    const now = new Date()
    const applied = promotions.find(promo =>
      promo.productIds?.includes(product._id) &&
      new Date(promo.startDate) <= now &&
      new Date(promo.endDate) >= now
    )
    if (applied) {
      return product.price * (1 - applied.discountPercent / 100)
    }
    return product.price
  }

  const subtotal = products.reduce((acc, item) => {
    return acc + getDiscountedPrice(item.product) * item.quantity
  }, 0)

  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setBuyerInfo({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          address: user.address || ''
        })
      } catch {
        //
      }
    }
  }, [])

  const handleQuantityChange = (productId, newQty) => {
    if (newQty < 1) return
    if (fromBuyNow) {
      setBuyNowState(prev =>
        prev.map(p => (p._id === productId ? { ...p, quantity: newQty } : p))
      )
    } else {
      updateQuantity(productId, newQty)
    }
  }

  const handlePlaceOrder = async () => {
    if (!buyerInfo.name || !buyerInfo.phone || !buyerInfo.email || !buyerInfo.address) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      let userId = null
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        userId = user._id || user.id || null
      }

      const orderData = {
        userId,
        buyerInfo,
        items: products.map((p) => ({
          productId: p.productId || p._id,
          quantity: p.quantity,
          price: getDiscountedPrice(p.product)
        })),
        total: subtotal
      }

      const orderRes = await createOrderAPI(orderData)

      if (orderRes && (orderRes._id || orderRes.data?._id)) {
        if (!fromBuyNow) {
          await removeManyFromCart(products.map((p) => p.productId))
        }
        alert('Đặt hàng thành công!')
        navigate('/thank-you', { state: { order: orderRes.data || orderRes } })
      } else {
        alert(orderRes.message || 'Đặt hàng thất bại, vui lòng thử lại!')
      }
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại!')
    }
  }

  return (
    <Box sx={{ backgroundColor: '#F5F5F5', py: 6 }}>
      <Box sx={{ backgroundColor: 'white', width: '800px', minHeight: '600px', mx: 'auto', borderRadius: '8px', p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#003468' }} onClick={() => navigate(-1)}>
            <ArrowBackIosIcon sx={{ fontSize: '14px' }} />
            <Typography variant='body2'>Quay lại</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant='body1' sx={{ fontWeight: 'bold' }}>Thông tin đặt hàng</Typography>
          </Box>
        </Box>

        {products.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 15 }}>
            <img
              src="https://cdn.pnj.io/images/2023/relayout-pdp/empty_product_line.png"
              alt=""
              style={{ width: '300px', marginBottom: '10px' }}
            />
            <Typography variant='body2' color='text.secondary'>Không có sản phẩm nào để thanh toán</Typography>
          </Box>
        ) : (
          <Box>
            {products.map((item) => {
              const now = new Date()
              const applied = promotions.find(promo =>
                promo.productIds?.includes(item.product._id) &&
                new Date(promo.startDate) <= now &&
                new Date(promo.endDate) >= now
              )
              const finalPrice = getDiscountedPrice(item.product)
              return (
                <Box key={item.productId} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box component="img" src={item.product?.image} alt={item.product?.name} sx={{ width: 80, height: 80, objectFit: 'cover', mr: 2, border: '1px solid #eee' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#0066cc', mb: 0.5 }}>{item.product?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>Mã: {item.product?.name?.split(' ').pop()}</Typography>

                    {/* Số lượng */}
                    <Box sx={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', width: '120px' }}>
                      <IconButton onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} size="small" sx={{ borderRadius: 0, borderRight: '1px solid #ccc', p: '4px 8px' }} disabled={item.quantity <= 1}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant='body2' sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</Typography>
                      <IconButton onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} size="small" sx={{ borderRadius: 0, borderLeft: '1px solid #ccc', p: '4px 8px' }} disabled={item.quantity >= (item.product?.stock ?? Infinity)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Giá sản phẩm + khuyến mãi */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      {applied && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#999' }}>
                          {item.product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: applied ? '#DC2626' : '#333' }}>
                        {finalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Typography>
                    </Box>
                    {applied && (
                      <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.5 }}>
                        Giảm {applied.discountPercent}% - {applied.title}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )
            })}

            {/* Tổng tiền */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2'>Tạm tính</Typography>
                <Typography variant='body2'>
                  {subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
              </Box>
            </Box>

            {/* Thông tin người mua */}
            <Box sx={{ mt: 4, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Thông tin người mua</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <TextField label="Họ và tên *" fullWidth value={buyerInfo.name} onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })} />
                <TextField label="Số điện thoại *" fullWidth value={buyerInfo.phone} onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })} />
                <TextField label="Email *" fullWidth value={buyerInfo.email} onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })} />
                <TextField label="Địa chỉ *" fullWidth multiline minRows={2} value={buyerInfo.address} onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })} />
              </Box>
              <Button variant="contained" sx={{ mt: 3, bgcolor: '#003468', '&:hover': { bgcolor: '#004c8f' } }} onClick={handlePlaceOrder} fullWidth>
                Đặt hàng
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Checkout
