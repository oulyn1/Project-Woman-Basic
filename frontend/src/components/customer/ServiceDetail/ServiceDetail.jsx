import { Box } from '@mui/material'
import React from 'react'
import ServiceItemDetail from './ServiceItemDetail/ServiceItemDetail'

function ServiceDetail() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-evenly',
        backgroundColor: '#F2F2F2',
        height: '46px',
        alignItems: 'center',
        borderRadius: '8px'
      }}>
      <ServiceItemDetail img='https://cdn.pnj.io/images/2023/relayout-pdp/shipping-icon.svg?1724816317359' text='Miễn Phí' />
      <ServiceItemDetail img='https://cdn.pnj.io/images/2023/relayout-pdp/shopping%20247-icon.svg?1724816239732' text='Phục vụ 24/7' />
      <ServiceItemDetail img='https://cdn.pnj.io/images/2023/relayout-pdp/thudoi-icon.svg?1724816287975' text='Thu đổi 48H' />
    </Box>
  )
}

export default ServiceDetail
