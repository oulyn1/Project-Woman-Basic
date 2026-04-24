import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

function ThankYou() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  if (!order) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6">Không tìm thấy đơn hàng</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>
          Quay về trang chủ
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#F5F5F5', py: 6, minHeight: '100vh' }}>
      <Box sx={{ backgroundColor: 'white', width: '700px', mx: 'auto', p: 4, borderRadius: '8px' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#003468' }}>
          Cảm ơn bạn đã đặt hàng!
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Mã đơn hàng: <strong>{order._id}</strong>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Người nhận: <strong>{order.buyerInfo?.name}</strong>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Số điện thoại: <strong>{order.buyerInfo?.phone}</strong>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Email: <strong>{order.buyerInfo?.email}</strong>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Địa chỉ: <strong>{order.buyerInfo?.address}</strong>
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Sản phẩm đã đặt:</Typography>
        {order.items?.map((item, idx) => {
          const product = item.product || { name: 'Sản phẩm' }
          const variantLabel = [
            item.size,
            item.color
          ].filter(Boolean).join(' / ')

          return (
            <Box key={`${item.productId}-${item.variantId || idx}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" fontWeight="500">{product.name} x {item.quantity}</Typography>
                {variantLabel && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Phân loại: {variantLabel}
                  </Typography>
                )}
              </Box>
              <Box textAlign="right">
                {item.originalPrice > item.price && (
                  <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999', display: 'block' }}>
                    {(item.originalPrice * item.quantity).toLocaleString()}đ
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: '#ad2a36', fontWeight: 'bold' }}>
                  {(item.price * item.quantity).toLocaleString()}đ
                </Typography>
              </Box>
            </Box>
          )
        })}

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #ddd' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Tạm tính:</Typography>
            <Typography variant="body2">{(order.originalSubtotal || order.total).toLocaleString()}đ</Typography>
          </Box>

          {(order.totalItemDiscount > 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Giảm giá sản phẩm:</Typography>
              <Typography variant="body2" color="#ad2a36">-{order.totalItemDiscount.toLocaleString()}đ</Typography>
            </Box>
          )}

          {(order.orderDiscount > 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Mã giảm giá đơn:</Typography>
              <Typography variant="body2" color="#ad2a36">-{order.orderDiscount.toLocaleString()}đ</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ad2a36' }}>
              {order.total.toLocaleString()}đ
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{ mt: 4, bgcolor: '#003468', '&:hover': { bgcolor: '#004c8f' } }}
          fullWidth
          onClick={() => navigate('/')}
        >
          Quay về trang chủ
        </Button>
      </Box>
    </Box>
  )
}

export default ThankYou
