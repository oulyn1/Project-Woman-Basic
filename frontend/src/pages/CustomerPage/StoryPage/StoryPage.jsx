import { Box, Typography, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { StaffData } from './StaffData.jsx'
import { useEffect, useState } from 'react'

function StoryPage() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToSlide = (index) => {
    if (index < 0) index = StaffData.length - 1
    if (index >= StaffData.length) index = 0
    setCurrentIndex(index)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide(currentIndex + 1)
    }, 4000)
    return () => clearInterval(timer)
  }, [currentIndex])
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box
        sx={{
          backgroundImage:'url("https://res.cloudinary.com/dj53ibv5n/image/upload/v1758380605/banner-vie_i3ara6.jpg")',
          width: '1200px',
          maxWidth: '100%',
          height: '451px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mt: '1px'
        }}
      />
      <Box sx={{ maxWidth: '800px', px: 2, py: 4, textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: '25px',
            color: '#003468',
            fontFamily: 'Times New Roman, serif',
            fontWeight: 'bold',
          }}
        >
          GIỚI THIỆU VỀ CÔNG TY
        </Typography>
        <Typography sx={{ mt: 2, lineHeight: 1.5, color: '#003468', fontFamily: 'Times New Roman, serif', }}>
          Thành lập từ năm 1988, từ Cửa hàng kinh doanh Vàng bạc Đá quý Phú Nhuận phát triển thành Công ty cổ phần Vàng bạc Đá quý Phú Nhuận (Tên tiếng anh là "Phu Nhuan Jewelry Joint Stock Company"), đến năm 2025, thương hiệu PNJ đã có 37 năm hình thành và phát triển.
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: '#fff4e7',
          width: '100%',
          maxWidth: '1000px',
          mt: 0.5,
          py: 2.5,
          px: 1,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          textAlign: 'center',
        }}
      >
        <Box sx={{ width: '20%', p: 1 }}>
          <Typography sx={{ color: '#003468', fontWeight: 'bold' }}>CHÍNH TRỰC<br />ĐỂ TRƯỜNG TỒN</Typography>
        </Box>
        <Box sx={{ width: '20%', p: 1 }}>
          <Typography sx={{ color: '#003468', fontWeight: 'bold' }}>KIÊN ĐỊNH<br />BÁM MỤC TIÊU</Typography>
        </Box>
        <Box sx={{ width: '20%', p: 1 }}>
          <Typography sx={{ color: '#003468', fontWeight: 'bold' }}>TIÊN PHONG<br />TẠO KHÁC BIỆT</Typography>
        </Box>
        <Box sx={{ width: '20%', p: 1 }}>
          <Typography sx={{ color: '#003468', fontWeight: 'bold' }}>QUAN TÂM<br />CÙNG PHÁT TRIỂN</Typography>
        </Box>
        <Box sx={{ width: '20%', p: 1 }}>
          <Typography sx={{ color: '#003468', fontWeight: 'bold' }}>TẬN TÂM<br />VÌ KHÁCH HÀNG</Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: '800px', px: 2, py: 4, }}>
        <Typography
          sx={{
            fontSize: '25px',
            color: '#003468',
            fontFamily: 'Times New Roman, serif',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 3,
          }}
        >
          GIÁ TRỊ DOANH NGHIỆP
        </Typography>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Typography sx={{ color: '#dbbd8a', fontSize: '20px', mr: 1 }}>-</Typography>
            <Box>
              <Typography sx={{ fontWeight: 'bold', color: '#dbbd8a' }}>TẦM NHÌN</Typography>
              <Typography sx={{ color: '#003468' }}>TRỞ THÀNH CÔNG TY HÀNG ĐẦU CHÂU Á VỀ CHẾ TÁC TRANG SỨC VÀ BÁN LẺ SẢN PHẨM TÔN VINH VẺ ĐẸP, VƯƠN TẦM THẾ GIỚI</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Typography sx={{ color: '#dbbd8a', fontSize: '20px', mr: 1 }}>-</Typography>
            <Box>
              <Typography sx={{ fontWeight: 'bold', color: '#dbbd8a' }}>SỨ MỆNH</Typography>
              <Typography sx={{ color: '#003468' }}>KHÔNG NGỪNG SÁNG TẠO ĐỂ MANG LẠI NHỮNG SẢN PHẨM TINH TẾ VỚI GIÁ TRỊ THẬT ĐỂ TÔN VINH VẺ ĐẸP CHO CON NGƯỜI VÀ CUỘC SỐNG</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography sx={{ color: '#dbbd8a', fontSize: '20px', mr: 1 }}>-</Typography>
            <Box>
              <Typography sx={{ fontWeight: 'bold', color: '#dbbd8a' }}>TRIẾT LÝ PHÁT TRIỂN BỀN VỮNG</Typography>
              <Typography sx={{ color: '#003468' }}>ĐẶT LỢI ÍCH KHÁCH HÀNG VÀ LỢI ÍCH XÃ HỘI VÀO LỢI ÍCH CỦA DOANH NGHIỆP</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{
        backgroundImage: 'url("https://res.cloudinary.com/dj53ibv5n/image/upload/v1758380605/HDQT-VIE_ernzjv.jpg")',
        width: '1200px',
        maxWidth: '100%',
        height: '451px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      </Box>
      {/* ✅ Carousel */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '1200px',
          maxWidth: '100%',
          height: '501px',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transition: 'transform 0.7s ease-in-out',
            transform: `translateX(-${currentIndex * 90}%)`,
            height: '100%',
          }}
        >
          {StaffData.map((staff, index) => (
            <Box
              key={staff.id}
              sx={{
                minWidth: '90%',
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                opacity: currentIndex === index ? 1 : 0.5,
                transition: 'opacity 0.3s ease',
                pl: 10
              }}
            >
              <img
                src={staff.Image}
                alt={staff.name}
                style={{
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
            </Box>
          ))}
        </Box>

        <IconButton
          onClick={() => goToSlide(currentIndex - 1)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff'
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={() => goToSlide(currentIndex + 1)}
          sx={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff'
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, mb: 3 }}>
        {StaffData.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: currentIndex === index ? 14 : 10,
              height: currentIndex === index ? 14 : 10,
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? '#003468' : '#ccc',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>

      <Box sx={{
        backgroundImage: 'url("https://res.cloudinary.com/dj53ibv5n/image/upload/v1758380605/BDH-VIE_z7dhs7.jpg")',
        width: '1200px',
        maxWidth: '100%',
        height: '451px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        mb: '2',
      }}>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          px: 2,
        }}
      >
        {/* Tiêu đề */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography
            sx={{
              fontSize: '25px',
              color: '#003468',
              fontFamily: 'Times New Roman, serif',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            CÁC LĨNH VỰC KINH DOANH
          </Typography>
          <img
            src="https://res.cloudinary.com/dj53ibv5n/image/upload/v1758380606/kimcuong_vgnpb8.png"
            alt="Diamond icon"
            style={{ width: '98px', height: 'auto' }}
          />
          <Typography
            sx={{
              fontSize: '22px',
              color: '#003468',
              fontFamily: 'Times New Roman, serif',
              mt: 1,
            }}
          >
            THƯƠNG HIỆU SẢN PHẨM
          </Typography>
        </Box>
      </Box>

    </Box>
  )
}

export default StoryPage
