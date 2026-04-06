import { Box, Typography } from '@mui/material'
import React from 'react'
import TableRatings from '~/components/admin/TableRating/TableRating'

function RatingsPage() {

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
            Quản Lý Đánh Giá
        </Typography>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableRatings/>
      </Box>
    </Box>
  )
}
export default RatingsPage