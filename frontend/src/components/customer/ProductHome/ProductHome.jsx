import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Slider from 'react-slick'
import ProductCard from './ProductCard/ProductCard'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllPromotionsAPI } from '~/apis/promotionAPIs' // import API promotion
import { useNavigate } from 'react-router-dom'

function ProductHome() {
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [promotions, setPromotions] = useState([]) // state lưu promotions
  const [selectedButton, setSelectedButton] = useState('new')

  useEffect(() => {
    // Lấy tất cả sản phẩm
    fetchAllProductsAPI().then(data => setAllProducts(data))
    // Lấy tất cả promotion
    fetchAllPromotionsAPI().then(data => setPromotions(data))
  }, [])

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const newProducts = [...allProducts]
    .filter(product => product.createdAt > oneWeekAgo)
    .sort((a, b) => b.createdAt - a.createdAt)

  const bestSellerProducts = [...allProducts]
    .filter(product => product.sold > 20)
    .sort((a, b) => b.sold - a.sold)

  const productsToShow = selectedButton === 'new' ? newProducts : bestSellerProducts

  const getButtonStyle = (buttonName) => ({
    height: '42px',
    backgroundColor: selectedButton === buttonName ? '#143765' : 'white',
    color: selectedButton === buttonName ? 'white' : '#696969',
    border: 'solid 1px #696969',
    textTransform: 'none',
    fontSize: '20px',
    fontWeight: selectedButton === buttonName ? 'bold' : 'normal',
    borderRadius: '6px'
  })

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
  }

  return (
    <Box sx={{ height: '555px', width: '1152px', mt: 6, borderRadius: '8px', backgroundImage: 'url("https://cdn.pnj.io/images/2023/relayout-pdp/Frame%2055883.png?1730781085068")' }}>
      <Box sx={{ height: '92px', mt: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Button onClick={() => setSelectedButton('new')} sx={getButtonStyle('new')}>Sản phẩm mới</Button>
        <Button onClick={() => setSelectedButton('best-seller')} sx={getButtonStyle('best-seller')}>Sản phẩm bán chạy</Button>
      </Box>

      <Box sx={{ width: '90%', margin: 'auto' }}>
        <Slider {...settings}>
          {productsToShow.map(product => (
            <Box key={product._id} onClick={() => navigate(`/productdetail/${product._id}`)}>
              <ProductCard
                product={product}
                isNew={selectedButton === 'new'}
                promotions={promotions}
              />
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  )
}

export default ProductHome
