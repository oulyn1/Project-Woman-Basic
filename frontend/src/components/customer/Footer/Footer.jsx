import React from 'react'
import { Box, Container, Grid, Typography, Link, IconButton, Button, Divider } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LogoWB from '~/assets/logo_wb.png'
import CertBCT from '~/assets/cert_bct.png'

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Box sx={{ bgcolor: 'white', pt: 8, pb: 4, borderTop: '1px solid #eee' }}>
      <Container maxWidth="lg">
        <Grid container justifyContent="space-around" spacing={4}>
          {/* Brand and Certification */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={LogoWB} alt="Woman Basic" style={{ height: '35px' }} />
              <img src={CertBCT} alt="Bộ Công Thương" style={{ height: '30px' }} />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <IconButton sx={{ border: '1px solid #333', borderRadius: '4px', p: 0.5 }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton sx={{ border: '1px solid #333', borderRadius: '4px', p: 0.5 }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>

            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'black', color: 'white', px: 2, py: 1.5,
                borderRadius: 1, fontWeight: 'bold', fontSize: '0.8rem',
                '&:hover': { bgcolor: '#333' }
              }}
            >
              HOTLINE: 0965715289
            </Button>
          </Grid>

          {/* About Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Giới thiệu</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Về Woman Basic</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Tin Tức</Link>
            </Box>
          </Grid>

          {/* Customer Service Links */}
          <Grid item xs={12} sm={6} md={3.5}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dịch vụ khách hàng</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Chính sách điều khoản</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Hướng dẫn mua hàng</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Hướng dẫn chọn size</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Chính sách thanh toán</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Chính sách bảo hành và đổi trả</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Chính sách giao nhận vận chuyển</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Q&A</Link>
            </Box>
          </Grid>

          {/* Contact Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Liên hệ</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Email</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Messenger</Link>
              <Link href="#" underline="none" color="text.secondary" sx={{ fontSize: '0.9rem' }}>Liên hệ</Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 8, mb: 4 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <IconButton 
            onClick={scrollToTop}
            sx={{ 
              position: 'absolute', left: 0,
              bgcolor: 'black', color: 'white',
              borderRadius: 1, '&:hover': { bgcolor: '#333' }
            }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            © WomanBasic All rights reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
