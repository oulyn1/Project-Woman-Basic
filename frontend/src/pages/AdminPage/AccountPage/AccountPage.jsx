import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useNavigate } from 'react-router-dom'
import TableAccount from '~/components/admin/TableAccount/TableAccount'

function AccountPage() {
  const navigate = useNavigate()
  const handleAddAccountClick = () => {
    navigate('/admin/account/add-account')
  }
  const handleEditAccountClick = (id) => {
    navigate(`/admin/account/edit-account/${id}`)
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
            Quản Lý Tài Khoản
        </Typography>
        <Box>
          <Tooltip title='Thêm tài khoản'>
            <Button onClick={handleAddAccountClick} sx={{ backgroundColor: '#66FF99', height: '40px', minWidth: '46px', marginRight: '8px' }}>
              <AddOutlinedIcon sx={{ color: 'white' }}/>
            </Button>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableAccount onEditAccount={handleEditAccountClick} />
      </Box>
    </Box>
  )
}
export default AccountPage