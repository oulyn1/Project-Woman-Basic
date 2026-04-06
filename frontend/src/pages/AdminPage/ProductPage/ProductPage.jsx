import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import TableProduct from '~/components/admin/TableProduct/TableProduct'
import { useNavigate } from 'react-router-dom'

function ProductPage() {
  const navigate = useNavigate()
  const handleAddProductClick = () => {
    navigate('/admin/product/add-product')
  }
  const handleEditProductClick = (productId) => {
    navigate(`/admin/product/edit-product/${productId}`)
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
          Quản Lý Sản Phẩm
        </Typography>
        <Tooltip title='Thêm sản phẩm'>
          <Button onClick={handleAddProductClick} sx={{ backgroundColor: '#66FF99', height: '40px', minWidth: '46px' }}>
            <AddOutlinedIcon sx={{ color: 'white' }}/>
          </Button>
        </Tooltip>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableProduct onEditProduct={handleEditProductClick} />
      </Box>
    </Box>
  )
}

export default ProductPage
