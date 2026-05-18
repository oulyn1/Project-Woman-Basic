import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Box, Typography, Skeleton, IconButton } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ProductCard from '~/components/customer/ProductHome/ProductCard/ProductCard'
import { getSimilarProductsAPI } from '~/apis/recommendation.api'
import { useNavigate } from 'react-router-dom'

function SimilarSkeletons() {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
      {[...Array(4)].map((_, i) => (
        <Box key={i} sx={{ flex: '0 0 auto', width: { xs: '45%', sm: '30%', md: '23%' } }}>
          <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2, mb: 1 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="50%" />
        </Box>
      ))}
    </Box>
  )
}

function SimilarScroll({ products, navigate }) {
  const scrollRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    updateArrows()
    return () => el.removeEventListener('scroll', updateArrows)
  }, [updateArrows, products])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector(':scope > div')?.offsetWidth || 260
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' })
  }

  return (
    <Box sx={{ position: 'relative', '&:hover .scroll-arrow': { opacity: 1 } }}>
      {showLeft && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute', left: { xs: 0, md: -20 }, top: '40%', zIndex: 2,
            bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: { xs: 1, md: 0 }, transition: 'opacity 0.3s',
            '&:hover': { bgcolor: '#f5f5f5' }, width: 40, height: 40,
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 16, color: '#333' }} />
        </IconButton>
      )}
      {showRight && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute', right: { xs: 0, md: -20 }, top: '40%', zIndex: 2,
            bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: { xs: 1, md: 0 }, transition: 'opacity 0.3s',
            '&:hover': { bgcolor: '#f5f5f5' }, width: 40, height: 40,
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 16, color: '#333' }} />
        </IconButton>
      )}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex', gap: { xs: 1.5, md: 2 },
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth', pb: 1.5, px: 0.5,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: '#f0f0f0', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3, '&:hover': { bgcolor: '#aaa' } },
          scrollbarWidth: 'thin', scrollbarColor: '#ccc #f0f0f0',
        }}
      >
        {products.map(product => (
          <Box
            key={product._id}
            onClick={() => navigate(`/productdetail/${product._id}`)}
            sx={{
              flex: '0 0 auto',
              width: { xs: '45%', sm: '30%', md: '23%' },
              scrollSnapAlign: 'start',
              cursor: 'pointer',
            }}
          >
            <ProductCard product={product} promotions={[]} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

/**
 * Section "Sản phẩm tương tự" cho ProductDetail page.
 * Ẩn hoàn toàn nếu API trả về rỗng.
 */
function SimilarProductsSection({ productId }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    const fetch = async () => {
      try {
        const res = await getSimilarProductsAPI(productId)
        setProducts(res?.data || [])
      } catch (err) {
        console.warn('[SimilarProductsSection] fetch error:', err?.message)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [productId])

  if (!loading && products.length === 0) return null

  return (
    <Box sx={{ mt: 8 }}>
      <Typography
        variant="h5"
        sx={{ borderLeft: '5px solid #ad2a36', pl: 2, mb: 3, fontWeight: 'bold' }}
      >
        SẢN PHẨM TƯƠNG TỰ
      </Typography>

      {loading
        ? <SimilarSkeletons />
        : <SimilarScroll products={products} navigate={navigate} />
      }
    </Box>
  )
}

export default SimilarProductsSection
