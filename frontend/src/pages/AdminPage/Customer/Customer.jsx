import { Box, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import TableCustomer from '~/components/admin/TableCustomer/TableCustomer'

function Customer() {
  const navigate = useNavigate()
  return (
    <Box sx={{ backgroundColor: '#343a40', height: 'auto', overflow: 'auto', mx: 5, my: 1, borderRadius: '8px' }}>
      <Box sx={{ color: 'white', m: '16px 48px 16px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant='h5'>Danh sách Khách Hàng</Typography>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableCustomer onRowClick={(id) => navigate(`/admin/customers/${id}`)} />
      </Box>
    </Box>
  )
}
export default Customer
