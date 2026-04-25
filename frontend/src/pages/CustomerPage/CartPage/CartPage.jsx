import React, { useState, useContext, useEffect } from 'react'
import { Box, Typography, Checkbox, IconButton } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import CartContext from '~/context/Cart/CartContext'
import { useNavigate } from 'react-router-dom'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs'

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext)
  const [selectedItems, setSelectedItems] = useState([])
  const [promotions, setPromotions] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

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
    const loadPromotions = async () => {
      try {
        // Pass customerId để backend filter theo tier
        const params = { type: 'product', computedStatus: 'active' }
        if (currentUser?._id) {
          params.customerId = currentUser._id
        }
        const res = await fetchAllPromotionsAPI(params)
        setPromotions(res.items || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadPromotions()
  }, [currentUser])

  // Toggle chọn 1 sản phẩm
  const handleSelectItem = (uniqueKey, checked) => {
    setSelectedItems((prev) =>
      checked ? [...prev, uniqueKey] : prev.filter((key) => key !== uniqueKey),
    )
  }

  const getUniqueKey = (item) => `${item.productId}-${item.variantId}`

  // Toggle chọn tất cả sản phẩm
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => getUniqueKey(item)))
    } else {
      setSelectedItems([])
    }
  }

  const canApplyPromo = (p, productId) => {
    // product match?
    const isProductPromo =
      p.productIds?.includes('ALL') || p.productIds?.includes(productId)
    const isActive =
      p.computedStatus === 'active' || p.computedStatus === 'Active'
    // user eligibility
    const now = new Date()
    const isWithinDate =
      (!p.startDate || new Date(p.startDate) <= now) &&
      (!p.endDate || p.endDate === null || new Date(p.endDate) >= now)
    const cond = p.condition ?? {
      type: 'all',
      loyaltyTiers: [],
      specificCustomerIds: [],
    }
    let isEligible = true
    switch (cond.type) {
    case 'all':
      break
    case 'loyal':
      isEligible =
          !!currentUser?.loyaltyTier &&
          (cond.loyalTiers ?? []).includes(currentUser.loyaltyTier)
      break
    case 'specific':
      isEligible =
          !!currentUser?._id &&
          (cond.specificCustomerIds ?? []).some(
            (id) => String(id) === String(currentUser._id),
          )
      break
    case 'new':
      isEligible = (cond.newCustomerMaxOrders ?? null) == null
      break
    default:
      break
    }
    return isProductPromo && isActive && isWithinDate && isEligible
  }

  const getDiscountedPrice = (product) => {
    const applied = promotions.find((promo) =>
      canApplyPromo(promo, product._id),
    )
    if (applied) {
      const val = parseFloat(applied.discountValue || 0)
      if (applied.discountType === 'percent') {
        return Math.round(product.price * (1 - val / 100))
      } else {
        return Math.max(0, product.price - val)
      }
    }
    return product.price
  }

  const subtotal = cartItems.reduce((acc, item) => {
    if (!selectedItems.includes(getUniqueKey(item))) return acc
    const finalPrice = getDiscountedPrice(item.product)
    return acc + finalPrice * item.quantity
  }, 0)

  const handleCheckout = () => {
    if (selectedItems.length === 0) return
    const productsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(getUniqueKey(item)),
    )
    navigate('/checkout', { state: { products: productsToCheckout } })
  }

  return (
    <Box sx={{ backgroundColor: '#F5F5F5', py: 6 }}>
      <Box
        sx={{
          backgroundColor: 'white',
          width: '800px',
          minHeight: '600px',
          mx: 'auto',
          borderRadius: '8px',
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: '#003468',
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIosIcon sx={{ fontSize: '14px' }} />
            <Typography variant="body2">Quay lại</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Giỏ hàng
            </Typography>
          </Box>
        </Box>

        {cartItems.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 15,
            }}
          >
            <img
              src="https://cdn.pnj.io/images/2023/relayout-pdp/empty_product_line.png"
              alt=""
              style={{ width: '300px', marginBottom: '10px' }}
            />
            <Typography variant="body2" color="text.secondary">
              Giỏ hàng trống
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Chọn tất cả và xóa tất cả */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #eee',
                pb: 1,
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectedItems.length === cartItems.length}
                  indeterminate={
                    selectedItems.length > 0 &&
                    selectedItems.length < cartItems.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  size="small"
                  sx={{ p: 0, mr: 1 }}
                />
                <Typography variant="body2">
                  Tất cả (
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}{' '}
                  sản phẩm)
                </Typography>
              </Box>
              <IconButton
                aria-label="Xóa tất cả"
                size="small"
                onClick={clearCart}
              >
                <DeleteIcon sx={{ color: '#ccc', fontSize: 20 }} />
              </IconButton>
            </Box>

            {cartItems.map((item) => {
              const now = new Date()
              const applied = promotions.find(
                (promo) =>
                  promo.productIds?.includes(item.product._id) &&
                  new Date(promo.startDate) <= now &&
                  new Date(promo.endDate) >= now,
              )
              const finalPrice = getDiscountedPrice(item.product)
              const resolvedSize = item.variant?.size || item.size || '--'
              const resolvedColor =
                item.variant?.color?.name ||
                item.variant?.color ||
                item.color ||
                '--'
              return (
                <Box
                  key={getUniqueKey(item)}
                  sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}
                >
                  <Checkbox
                    checked={selectedItems.includes(getUniqueKey(item))}
                    onChange={(e) =>
                      handleSelectItem(getUniqueKey(item), e.target.checked)
                    }
                    sx={{ alignSelf: 'flex-start', p: 0, mr: 1, mt: '12px' }}
                    size="small"
                  />
                  <Box
                    component="img"
                    src={item.product?.image}
                    alt={item.product?.name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      mr: 2,
                      border: '1px solid #eee',
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: '#0066cc', mb: 0.5 }}
                    >
                      {item.product?.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Mã: {item.product?.name.split(' ').pop()}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      Size: {resolvedSize} | Màu: {resolvedColor}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        width: '120px',
                      }}
                    >
                      <IconButton
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1,
                          )
                        }
                        size="small"
                        sx={{
                          borderRadius: 0,
                          borderRight: '1px solid #ccc',
                          p: '4px 8px',
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>

                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.quantity}
                      </Typography>

                      <IconButton
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity + 1,
                          )
                        }
                        size="small"
                        sx={{
                          borderRadius: 0,
                          borderLeft: '1px solid #ccc',
                          p: '4px 8px',
                        }}
                        disabled={
                          item.quantity >= (item.variant?.stock ?? Infinity)
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      {applied && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: '#999' }}
                        >
                          {item.product.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: '#cc3300' }}
                      >
                        {finalPrice.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </Typography>
                    </Box>
                    {applied && (
                      <Typography
                        sx={{ fontSize: 12, color: '#DC2626', mt: 0.5 }}
                      >
                        Giảm {applied.discountValue}
                        {applied.discountType === 'percent' ? '%' : 'đ'} -{' '}
                        {applied.title}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    aria-label="Xóa sản phẩm"
                    sx={{ alignSelf: 'flex-start' }}
                    size="small"
                    onClick={() =>
                      removeFromCart(item.productId, item.variantId)
                    }
                  >
                    <DeleteIcon sx={{ color: '#ccc', fontSize: 20 }} />
                  </IconButton>
                </Box>
              )
            })}

            {/* Tổng tiền */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Tạm tính</Typography>
                <Typography variant="body2">
                  {subtotal.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: selectedItems.length > 0 ? '#003468' : '#ccc',
                  height: '40px',
                  borderRadius: '8px',
                  mt: 2,
                  cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
                  '&:hover': {
                    bgcolor: selectedItems.length > 0 ? '#004c8f' : '#ccc',
                  },
                }}
                onClick={handleCheckout}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: 'white' }}
                >
                  Tiếp tục
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CartPage
