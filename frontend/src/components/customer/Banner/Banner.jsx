import React from 'react'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Slider from 'react-slick'
import { Box } from '@mui/material'

function Banner({ banners }) {
  const settings = {
    dots: true, // Hiển thị các chấm điều hướng
    infinite: true, // Vòng lặp vô hạn
    speed: 500, // Tốc độ chuyển slide
    slidesToShow: 1, // Số slide hiển thị cùng lúc
    slidesToScroll: 1, // Số slide cuộn mỗi lần
    autoplay: true, // Tự động chạy
    autoplaySpeed: 3000, // Thời gian giữa các slide (3 giây)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '490px',
        '& .slick-dots': {
          bottom: '36px'
        },
        '& .slick-dots li button:before': {
          color: 'black',
          fontSize: '12px',
          textShadow: '0px 0px 4px rgba(0, 0, 0, 1)',
        },
        '& .slick-dots li.slick-active button:before': {
          color: 'white',
        },
        cursor: 'pointer'
      }}
    >
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <img
              src={banner.imageUrl}
              alt={banner.altText}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  )
}

export default Banner
