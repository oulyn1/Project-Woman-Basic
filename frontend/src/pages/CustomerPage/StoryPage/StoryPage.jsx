import React from 'react'
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SpaIcon from '@mui/icons-material/Spa'

const coreValues = [
  {
    title: 'Minimalism',
    subtitle: 'Sự Tối Giản',
    desc: 'Thiết kế loại bỏ những chi tiết rườm rà, tập trung vào phom dáng chuẩn mực và tính ứng dụng cao.',
    icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4b5563' }} />
  },
  {
    title: 'Comfort',
    subtitle: 'Sự Thoải Mái',
    desc: 'Ưu tiên chất liệu mềm mịn, thoáng mát, mang lại cảm giác dễ chịu tuyệt đối suốt ngày dài.',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#4b5563' }} />
  },
  {
    title: 'Confident',
    subtitle: 'Sự Tự Tin',
    desc: 'Trang phục giúp bạn tỏa sáng theo cách riêng, không chạy theo xu hướng mà tôn vinh bản sắc cá nhân.',
    icon: <FavoriteBorderIcon sx={{ fontSize: 40, color: '#4b5563' }} />
  },
  {
    title: 'Sustainable',
    subtitle: 'Tính Bền Vững',
    desc: 'Lựa chọn thân thiện với môi trường, thiết kế vượt thời gian không sợ lỗi mốt.',
    icon: <SpaIcon sx={{ fontSize: 40, color: '#4b5563' }} />
  }
]

function StoryPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100vw', bgcolor: '#ffffff', pb: 8, overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Hero Banner Area */}
      <Box
        sx={{
          backgroundImage: 'url("/woman_basic_hero_banner_1777018158632.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: { xs: '300px', md: '500px' },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} />
        <Typography
          variant="h2"
          sx={{
            color: '#fff',
            fontWeight: 300,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            px: 2,
            textShadow: '0px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          Câu Chuyện Woman Basic
        </Typography>
      </Box>

      {/* Our Story Section */}
      <Container maxWidth="md" sx={{ width: '100%', textAlign: 'center', py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" sx={{ fontWeight: 400, color: '#111827', mb: 3, letterSpacing: '2px' }}>
          VỀ CHÚNG TÔI
        </Typography>
        <Box sx={{ width: '60px', height: '2px', bgcolor: '#111827', mx: 'auto', mb: 4 }} />
        <Typography variant="body1" sx={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.8, mb: 2 }}>
          Ra đời từ khát khao định nghĩa lại vẻ đẹp của sự giản đơn, <strong>Woman Basic</strong> không chỉ là một thương hiệu thời trang, mà là một lối sống. Chúng tôi tin rằng, vẻ thanh lịch đích thực không đến từ những hoa văn cầu kỳ hay xu hướng chớp nhoáng, mà bắt nguồn từ sự thoải mái và tự tin khi là chính mình.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.8 }}>
          Mọi thiết kế của Woman Basic đều bắt đầu từ một dấu gạch ngang cơ bản – đường cắt may tinh tế, chất liệu chọn lọc, bảng màu trung tính. Tất cả hòa quyện để tạo nên chiếc móng vững chắc cho tủ đồ của mọi cô gái hiện đại.
        </Typography>
      </Container>


      {/* Mission & Vision */}
      <Box sx={{ bgcolor: '#f9fafb', py: { xs: 8, md: 12 }, width: '100%' }}>
        <Container maxWidth="lg" sx={{ width: '100%' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ pr: { md: 4 }, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 400, color: '#111827', mb: 2, letterSpacing: '1px' }}>
                  TẦM NHÌN & SỨ MỆNH
                </Typography>
                <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.8, mb: 3 }}>
                  Sứ mệnh của chúng tôi là mang đến những trang phục cơ bản (basics) chất lượng cao nhất với mức giá hợp lý. Để mỗi cô gái, dù ở bất kỳ độ tuổi hay môi trường nào, đều có thể dễ dàng tìm thấy "bộ cánh" chân ái cho riêng mình.
                </Typography>
                <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.8 }}>
                  Khát vọng dài hạn của Woman Basic là trở thành thương hiệu thời trang thiết yếu hàng đầu trong tủ đồ của phụ nữ Việt Nam, gắn liền với sự tinh tế, chuẩn mực và bền vững.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/woman_basic_vision_1777018174293.png"
                alt="Woman Basic Vision"
                sx={{
                  width: '100%',
                  maxWidth: '500px',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Values */}
      <Container maxWidth="lg" sx={{ width: '100%', py: { xs: 8, md: 10 } }}>
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 400, color: '#111827', mb: 3, letterSpacing: '2px' }}>
          GIÁ TRỊ CỐT LÕI
        </Typography>
        <Box sx={{ width: '60px', height: '2px', bgcolor: '#111827', mx: 'auto', mb: 8 }} />

        <Grid container spacing={4} justifyContent="center">
          {coreValues.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  bgcolor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.3s',
                  mx: 'auto',
                  maxWidth: '300px',
                  '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#9ca3af', textTransform: 'uppercase', mb: 2, letterSpacing: '1px' }}>
                    {value.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                    {value.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Bottom Picture / Banner */}
      <Container maxWidth="lg" sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
        <Box
          component="img"
          src="/woman_basic_core_values_1777018185820.png"
          alt="Woman Basic Lifestyle"
          sx={{
            width: '100%',
            height: { xs: '300px', md: '500px' },
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      </Container>
    </Box>
  )
}

export default StoryPage
