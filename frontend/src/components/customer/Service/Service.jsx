import { Box } from '@mui/material'
import React from 'react'
import ServiceItem from './ServiceItem/ServiceItem'

function Service() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-evenly', px: 16 }}>
      <ServiceItem img='https://cdn.pnj.io/images/2023/relayout-pdp/shipping-icon.svg?1724816317359' text='Miễn Phí' />
      <ServiceItem img='https://cdn.pnj.io/images/2023/relayout-pdp/shopping%20247-icon.svg?1724816239732' text='Phục vụ 24/7' />
      <ServiceItem img='https://cdn.pnj.io/images/2023/relayout-pdp/thudoi-icon.svg?1724816287975' text='Thu đổi 48H' />
    </Box>
  )
}

export default Service
