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
        {order.items?.map((item) => (
          <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{item.product?.name || item.productId} x {item.quantity}</Typography>
            <Typography variant="body2" sx={{ color: '#cc3300' }}>
              {(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, borderTop: '1px solid #eee', pt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Tổng tiền:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#cc3300' }}>
            {order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Typography>
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
