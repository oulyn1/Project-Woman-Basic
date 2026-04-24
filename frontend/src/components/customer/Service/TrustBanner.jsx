import React from 'react'
import { Box, Typography, Container, Grid } from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'

const serviceItems = [
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 40, color: '#e67e22' }} />,
    title: 'Freeship',
    desc: 'Cho đơn hàng từ 100K'
  },
  {
    icon: <CachedOutlinedIcon sx={{ fontSize: 40, color: '#3498db' }} />,
    title: 'Đổi trả miễn phí',
    desc: 'Hỗ trợ đổi trả trong 30 ngày'
  },
  {
    icon: <VerifiedOutlinedIcon sx={{ fontSize: 40, color: '#f1c40f' }} />,
    title: 'Sản phẩm chất lượng',
    desc: 'Đảm bảo trải nghiệm tốt'
  },
  {
    icon: <CardGiftcardOutlinedIcon sx={{ fontSize: 40, color: '#e74c3c' }} />,
    title: 'Giá trị quà tặng',
    desc: 'Nhiều Voucher hấp dẫn'
  }
]

function TrustBanner() {
  return (
    <Box sx={{ py: 4, bgcolor: '#ffffff', position: 'relative', zIndex: 10 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center" alignItems="center">
          {serviceItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default TrustBanner
