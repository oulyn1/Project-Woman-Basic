import { Box, Container } from '@mui/material'
import Banner from '~/components/customer/Banner/Banner'
import Service from '~/components/customer/Service/Service'
import ProductHome from '~/components/customer/ProductHome/ProductHome'

function HomePage() {
  const bannerData = [
    { imageUrl: 'https://cdn.pnj.io/images/promo/265/22-ngaydoi99-1972x640KPN.jpg', altText: 'Banner 1' },
    { imageUrl: 'https://cdn.pnj.io/images/promo/240/egift-t3-25-1972x640CTA.jpg', altText: 'Banner 2' },
    { imageUrl: 'https://cdn.pnj.io/images/promo/264/PNJ_fast_2025-_banner-1972x640-CTA.png', altText: 'Banner 3' },
  ]
  return (
    <>
      <Banner banners={bannerData} />
      <Container sx={{ mt: 3 }}>
        <Service />
        <ProductHome />
      </Container>
    </>
  )
}

export default HomePage
