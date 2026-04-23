import React, { useContext, useMemo, useState, useEffect } from 'react'
import {
  Box, Typography, IconButton, TextField, Button,
  Divider, Stack, Paper, Chip, CircularProgress, Dialog,
  DialogTitle, DialogContent, Radio, RadioGroup, FormControlLabel,
  Container
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { useNavigate, useLocation } from 'react-router-dom'

import CartContext from '~/context/Cart/CartContext'
import { createOrderAPI } from '~/apis/orderAPIs'
import { fetchAllPromotionsAPI, getEligibleOrderPromosAPI, applyPromotionsAPI } from '~/apis/promotionAPIs'

function Checkout() {
  const { cartItems = [], updateQuantity, removeManyFromCart } = useContext(CartContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { products: buyNowProducts = [], fromBuyNow = false } = location.state || {}

  const [buyNowState, setBuyNowState] = useState(
    buyNowProducts.map(p => ({ ...p, quantity: p.quantity || 1 }))
  )

  const [promotions, setPromotions] = useState([])
  const [eligibleCoupons, setEligibleCoupons] = useState([])
  const [selectedCouponCode, setSelectedCouponCode] = useState('')
  const [calculationResult, setCalculationResult] = useState(null)
  const [loadingCalc, setLoadingCalc] = useState(false)
  const [openCouponModal, setOpenCouponModal] = useState(false)

  const [buyerInfo, setBuyerInfo] = useState({
    name: '', phone: '', email: '', address: ''
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
      } catch { /* ignore */ }
    }
  }, [])

  const products = useMemo(() => {
    if (fromBuyNow) {
      return buyNowState.map(p => ({
        productId: p._id,
        variantId: p.variantId || p.selectedVariant?._id || null,
        variant: p.selectedVariant || null,
        product: p,
        quantity: p.quantity || 1
      }))
    }
    return cartItems
  }, [fromBuyNow, buyNowState, cartItems])

  // Initial load: Fetch product promotions for display
  useEffect(() => {
    const loadData = async () => {
      try {
        const promoRes = await fetchAllPromotionsAPI({ type: 'product', computedStatus: 'active' })
        setPromotions(promoRes.items || [])
      } catch (err) { console.error(err) }
    }
    loadData()
  }, [])

  // Whenever products or coupon change, calculate total via API
  useEffect(() => {
    const calculateTotal = async () => {
      if (products.length === 0) return
      setLoadingCalc(true)
      try {
        const items = products.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
          variantId: typeof item.variantId === 'object' ? item.variantId._id : item.variantId,
          quantity: item.quantity,
          price: item.product?.price || item.price // Support price from cart items or buy now state
        }))
        
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const customerId = user._id || user.id
        const result = await applyPromotionsAPI({
          items,
          couponCode: selectedCouponCode,
          customerId: customerId
        })
        setCalculationResult(result)

        // Also refresh eligible order coupons (ONLY if logged in)
        if (customerId) {
          const eligible = await getEligibleOrderPromosAPI(customerId, result.discountedSubtotal)
          setEligibleCoupons(eligible || [])
        } else {
          setEligibleCoupons([])
        }
      } catch (err) {
        console.error("Calculation Error:", err)
      } finally {
        setLoadingCalc(false)
      }
    }
    calculateTotal()
  }, [products, selectedCouponCode])

  const handleQuantityChange = (productId, variantId, newQty) => {
    if (newQty < 1) return
    if (fromBuyNow) {
      setBuyNowState(prev => prev.map(p => (p._id === productId ? { ...p, quantity: newQty } : p)))
    } else {
      updateQuantity(productId, variantId, newQty)
    }
  }

  const handlePlaceOrder = async () => {
    if (!buyerInfo.name || !buyerInfo.phone || !buyerInfo.email || !buyerInfo.address) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const orderData = {
        userId: savedUser._id || savedUser.id || null,
        buyerInfo,
        items: calculationResult.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          size: item.size || '',
          color: item.color || '',
          originalPrice: item.originalUnitPrice,
          price: item.finalUnitPrice,
          quantity: item.quantity,
          appliedPromo: item.appliedPromo
        })),
        originalSubtotal: calculationResult.originalSubtotal,
        totalItemDiscount: calculationResult.totalItemDiscount,
        orderDiscount: calculationResult.orderDiscount,
        appliedOrderPromoId: calculationResult.appliedOrderPromo?._id || null,
        total: calculationResult.finalTotal
      }

      const orderRes = await createOrderAPI(orderData)
      if (orderRes && (orderRes._id || orderRes.data?._id)) {
        if (!fromBuyNow) {
          await removeManyFromCart(products.map(p => ({ productId: p.productId, variantId: p.variantId })))
        }
        alert('Đặt hàng thành công!')
        navigate('/thank-you', { state: { order: orderRes.data || orderRes } })
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!')
    }
  }

  const getProductPromo = (productId) => {
    return promotions.find(p => p.productIds?.includes('ALL') || p.productIds?.includes(productId))
  }

  return (
    <Box sx={{ backgroundColor: '#F8F9FA', py: 6, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          
          {/* Left Side: Order Items and Information */}
          <Box sx={{ flex: 1.5 }}>
            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer' }} onClick={() => navigate(-1)}>
                <ArrowBackIosIcon sx={{ fontSize: '14px', mr: 0.5 }} />
                <Typography variant='body2' fontWeight="bold">Quay lại giỏ hàng</Typography>
              </Box>

              <Typography variant='h5' fontWeight="bold" sx={{ mb: 4 }}>Chi tiết đơn hàng</Typography>

              {products.length === 0 ? (
                <Box textAlign="center" py={5}>
                  <Typography color="text.secondary">Giỏ hàng đang trống.</Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {products.map((item) => {
                    const promo = getProductPromo(item.product._id)
                    const calcItem = calculationResult?.items?.find(i => i.productId === item.product._id && i.variantId === item.variantId)
                    
                    return (
                      <Box key={`${item.productId}-${item.variantId}`} sx={{ display: 'flex', gap: 2 }}>
                        <Box component="img" src={item.product?.image} sx={{ width: 100, height: 120, objectFit: 'cover', borderRadius: '8px' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">{item.product?.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[item.variant?.size || item.size, item.variant?.color?.name || item.color].filter(Boolean).join(' / ')}
                          </Typography>
                          
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1.5 }}>
                            <Box sx={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px' }}>
                              <IconButton size="small" onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity - 1)} disabled={item.quantity <= 1}><RemoveIcon fontSize="small" /></IconButton>
                              <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>{item.quantity}</Box>
                              <IconButton size="small" onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                            </Box>
                            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                              {calcItem?.promotionApplied && (
                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#888', display: 'block' }}>
                                  {calcItem?.originalUnitPrice?.toLocaleString()}đ
                                </Typography>
                              )}
                              <Typography variant="subtitle1" fontWeight="bold" color={calcItem?.promotionApplied ? '#ad2a36' : 'inherit'}>
                                {calcItem?.finalUnitPrice?.toLocaleString() || item.product?.price?.toLocaleString()}đ
                              </Typography>
                            </Box>
                          </Stack>
                          {promo && (
                            <Chip size="small" icon={<LocalOfferIcon />} label={`Giảm ${promo.discountValue}${promo.discountType === 'percent'?'%':'đ'} - ${promo.title}`} sx={{ mt: 1, height: 24, fontSize: 11, bgcolor: '#fff5f5', color: '#ad2a36', border: '1px solid #ffc9c9' }} />
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              )}

              <Divider sx={{ my: 4 }} />

              <Typography variant='h6' fontWeight="bold" sx={{ mb: 3 }}>Thông tin giao hàng</Typography>
              <Stack spacing={2.5}>
                <TextField label="Họ và tên" fullWidth value={buyerInfo.name} onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })} />
                <Stack direction="row" spacing={2}>
                  <TextField label="Số điện thoại" fullWidth value={buyerInfo.phone} onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })} />
                  <TextField label="Email" fullWidth value={buyerInfo.email} onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })} />
                </Stack>
                <TextField label="Địa chỉ" fullWidth multiline rows={3} value={buyerInfo.address} onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })} />
              </Stack>
            </Paper>
          </Box>

          {/* Right Side: Price Summary & Coupons */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
              
              {/* Coupon Section */}
              <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumberIcon sx={{ color: '#ad2a36' }} /> Khuyến mãi đơn hàng
                </Typography>
                
                {localStorage.getItem('user') ? (
                  selectedCouponCode ? (
                    <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', mb: 2, position: 'relative' }}>
                      <Typography variant="body2" fontWeight="bold" color="#0369a1">Mã: {selectedCouponCode}</Typography>
                      <Typography variant="caption" color="#0c4a6e">
                        {calculationResult?.orderDiscount > 0 ? `Đã giảm ${calculationResult?.orderDiscount?.toLocaleString()}đ` : 'Đang tính toán...'}
                      </Typography>
                      <Button size="small" sx={{ position: 'absolute', right: 8, top: 8, color: '#0369a1' }} onClick={() => setSelectedCouponCode('')}>Gỡ</Button>
                    </Box>
                  ) : (
                    <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenCouponModal(true)} sx={{ py: 1.5, borderColor: '#ad2a36', color: '#ad2a36', '&:hover': { bgcolor: '#fff5f5' } }}>
                      Chọn mã giảm giá ({eligibleCoupons.length})
                    </Button>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', bgcolor: '#f5f5f5', p: 2, borderRadius: '8px' }}>
                    Hãy đăng nhập để nhận các ưu đãi hấp dẫn hơn!
                  </Typography>
                )}
              </Paper>

              {/* Summary Section */}
              <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: 'white', color: 'black', border: '1px solid #eee' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Tổng cộng</Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Tạm tính</Typography>
                    <Typography fontWeight="500">{calculationResult?.originalSubtotal?.toLocaleString() || '0'}đ</Typography>
                  </Box>
                  
                  {calculationResult?.totalItemDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Giảm sản phẩm</Typography>
                      <Typography color="#ad2a36">-{calculationResult?.totalItemDiscount?.toLocaleString()}đ</Typography>
                    </Box>
                  )}

                  {calculationResult?.orderDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Mã giảm giá đơn</Typography>
                      <Typography color="#ad2a36">-{calculationResult?.orderDiscount?.toLocaleString()}đ</Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Thành tiền</Typography>
                    {loadingCalc ? <CircularProgress size={20} color="inherit" /> : (
                      <Typography variant="h5" fontWeight="bold" color="#ad2a36">
                        {calculationResult?.finalTotal?.toLocaleString() || '0'}đ
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Button fullWidth variant="contained" onClick={handlePlaceOrder} disabled={loadingCalc || products.length === 0} sx={{ mt: 4, py: 2, bgcolor: '#66FF99', color: 'black', fontWeight: 'bold', fontSize: '1.1rem', '&:hover': { bgcolor: '#52d17c' } }}>
                  THANH TOÁN NGAY
                </Button>
                <Typography align="center" variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                  Bằng cách nhấn thanh toán, bạn đồng ý với các điều khoản của WOMAN BASIC.
                </Typography>
              </Paper>

            </Stack>
          </Box>
        </Stack>
      </Container>

      {/* Coupon Modal */}
      <Dialog open={openCouponModal} onClose={() => setOpenCouponModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chọn mã khuyến mãi</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          {eligibleCoupons.length === 0 ? (
            <Typography align="center" py={4} color="text.secondary">Rất tiếc, hiện tại chưa có mã nào khả dụng với đơn hàng này.</Typography>
          ) : (
            <RadioGroup value={selectedCouponCode} onChange={(e) => { setSelectedCouponCode(e.target.value); setOpenCouponModal(false); }}>
              <Stack spacing={2}>
                {eligibleCoupons.map((coupon) => (
                  <Paper key={coupon._id} variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: selectedCouponCode === coupon.title ? '#f0f9ff' : 'white', borderColor: selectedCouponCode === coupon.title ? '#0369a1' : '#eee' }}>
                    <FormControlLabel
                      value={coupon.title}
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography fontWeight="bold" sx={{ fontSize: '0.95rem' }}>{coupon.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{coupon.description}</Typography>
                          <Typography variant="caption" fontWeight="bold" color="#ad2a36">
                            Giảm {coupon.discountValue}{coupon.discountType === 'percent' ? '%' : 'đ'}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                ))}
              </Stack>
            </RadioGroup>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Checkout
