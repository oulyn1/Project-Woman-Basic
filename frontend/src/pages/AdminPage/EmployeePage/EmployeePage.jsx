import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import TableEmployee from '~/components/admin/TableEmployee/TableEmployee'

function EmployeePage() {
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
            Quản Lý Nhân Viên
        </Typography>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableEmployee onEditAccount={handleEditAccountClick} />
      </Box>
    </Box>
  )
}
export default EmployeePage