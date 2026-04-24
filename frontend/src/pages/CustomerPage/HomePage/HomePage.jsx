import { Box, Container } from '@mui/material'
import Banner from '~/components/customer/Banner/Banner'
import ProductHome from '~/components/customer/ProductHome/ProductHome'
import TrustBanner from '~/components/customer/Service/TrustBanner'

function HomePage() {
  const bannerData = [
    { imageUrl: '/banner1.jpg', altText: 'Lunar Pretty - New Collection' },
    { imageUrl: '/banner2.jpg', altText: 'Tết Rạng Ngời - Đón Xuân Sang' },
    { imageUrl: '/banner3.jpg', altText: 'Banner 3' },
  ]
  return (
    <>
      <Container sx={{ pt: 2 }}>
        <Banner banners={bannerData} />
      </Container>
      <Box sx={{ my: 4, position: 'relative', zIndex: 100, bgcolor: 'white' }}>
        <TrustBanner />
      </Box>
      <Container sx={{ mt: 3 }}>
        <ProductHome />
      </Container>
    </>
  )
}

export default HomePage
