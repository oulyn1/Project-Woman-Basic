import { Box, Container, Grid, Typography, Link, Button, Avatar } from '@mui/material'
import React from 'react'

function Footer() {
  const imageUrls = [
    {
      imageUrl: 'https://cdn.pnj.io/images/image-update/footer/facebook.svg',
      linkUrl: 'https://www.facebook.com/PNJ.COM.VN'
    },
    {
      imageUrl: 'https://cdn.pnj.io/images/image-update/footer/instagram.svg',
      linkUrl: 'https://www.instagram.com/pnj_jewelry/'
    },
    {
      imageUrl: 'https://cdn.pnj.io/images/image-update/footer/youtube.svg',
      linkUrl: 'https://www.youtube.com/user/PhuNhuanJewelry'
    },
    {
      imageUrl: 'https://cdn.pnj.io/images/image-update/footer/email.svg',
      linkUrl: 'https://www.youtube.com/user/PhuNhuanJewelry'
    },
  ]
  return (
    <Box sx={{
      py: 4,
    }}>
      <Container maxWidth="lg" sx={{ borderTop: '1px solid #696969' }}>
        <img src="https://cdn.pnj.io/images/logo/pnj.com.vn.png" alt="" style={{ height: '100px', marginBottom: '24px', marginTop: '24px' }} />
        <Grid container spacing={8}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              © 2017 Công Ty Cổ Phần Vàng Bạc Đá Quý Phú Nhuận
            </Typography>
            <Typography variant="body2" color="text.secondary">
              170E Phan Đăng Lưu, Phường Đức Nhuận, TP.Hồ Chí Minh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ĐT: 028 3995 1703 - Fax: 028 3995 1702
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Giấy chứng nhận đăng ký doanh nghiệp: 0300521758
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng đài hỗ trợ (08:00-21:00, miễn phí gọi)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gọi mua: 1800545457 (phím 1)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Khiếu nại: 1800545457 (phím 2)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email góp ý: cskh@pnj.com.vn
            </Typography>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 2' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              VỀ PNJ
            </Typography>
            {['Quan hệ cổ đông (IR)', 'Tuyển dụng', 'Xuất khẩu', 'Kinh doanh sỉ'].map((text) => (
              <Typography key={text} color="text.secondary" display="block" variant="body2" sx={{ mb: 0.5 }}>
                {text}
              </Typography>
            ))}
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 3' } }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              DỊCH VỤ KHÁCH HÀNG
              </Typography>
              {['Hướng dẫn đo size trang sức', 'Mua hàng trả góp', 'Hướng dẫn mua hàng và thanh toán', 'Tổng Hợp Các Chính Sách PNJ'].map((text) => (
                <Typography key={text} color="text.secondary" display="block" variant="body2" sx={{ mb: 0.5 }}>
                  {text}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 3' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              KẾT NỐI VỚI CHÚNG TÔI
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {imageUrls.map((item, index) => (
                <a
                  key={index}
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Avatar
                    alt={`Ảnh đại diện ${index + 1}`}
                    src={item.imageUrl}
                    sx={{
                      width: 40,
                      height: 40,
                      '&:hover': {
                        opacity: 0.8,
                        cursor: 'pointer',
                      }
                    }}
                  />
                </a>
              ))}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                CHỨNG NHẬN
              </Typography>
              <img src="https://cdn.pnj.io/images/image-update/op-da-thong-bao-bo-cong-thuong-183x60.png" alt="" style={{ height: '38px' }}/>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  )
}

export default Footer
