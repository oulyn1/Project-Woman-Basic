import { Box, Typography } from '@mui/material'
import React from 'react'
import TableOrder from '~/components/admin/TableOrder/TableOrder'
import { useNavigate } from 'react-router-dom'

function OrderPage() {
  const navigate = useNavigate()
  const handleEditOrderClick = (OrderId) => {
    navigate(`/admin/Order/edit-Order/${OrderId}`)
  }
  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        height: 'auto',
        overflow: 'auto',
        mx: 5,
        my: 1,
        borderRadius: '8px'
      }}
    >
      <Box
        sx={{
          color: 'white',
          m: '16px 48px 16px 16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant='h5'>
          Quản Lý Đơn Hàng
        </Typography>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableOrder onEditOrder={handleEditOrderClick} />
      </Box>
    </Box>
  )
}

export default OrderPage
