import { Button } from '@mui/material'
import React from 'react'

function ServiceItem({ img, text }) {
  return (
    <Button
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#003468',
        width: '270px',
        height: '77px',
        fontSize: '18px',
        backgroundColor: '#F2F2F2'
      }}
    >
      <img style={{ height: '48px' }} src={img} alt="" />
      {text}
    </Button>
  )
}

export default ServiceItem
