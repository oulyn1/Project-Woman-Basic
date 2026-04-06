import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import TableWorkShift from '~/components/admin/TableWorkShift/TableWorkShift'

function WorkShiftPage() {
  const navigate = useNavigate()
  const handleEditAccountClick = (id) => {
    navigate(`/admin/employee/salary/${id}`)
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
            Lịch sử ca làm
        </Typography>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableWorkShift onEditAccount={handleEditAccountClick} />
      </Box>
    </Box>
  )
}
export default WorkShiftPage