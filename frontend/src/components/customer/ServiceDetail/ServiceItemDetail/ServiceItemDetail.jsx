import { Box } from '@mui/material'
import React from 'react'

function ServiceItemDetail({ img, text }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#003468',
        height: '20px',
        fontSize: '14px',
        backgroundColor: '#F2F2F2',
        fontWeight: 'bold'
      }}
    >
      <img style={{ height: '18px' }} src={img} alt="" />
      {text}
    </Box>
  )
}

export default ServiceItemDetail
