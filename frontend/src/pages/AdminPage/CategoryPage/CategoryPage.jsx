import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useNavigate } from 'react-router-dom'
import TableCategory from '~/components/admin/TableCategory/TableCategory'

function CategoryPage() {
  const navigate = useNavigate()
  const handleAddProductClick = () => {
    navigate('/admin/category/add-category')
  }
  const handleEditCategoryClick = (categoryId) => {
    navigate(`/admin/category/edit-category/${categoryId}`)
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
          Quản Lý Danh Mục
        </Typography>
        <Tooltip title='Thêm danh mục'>
          <Button onClick={handleAddProductClick} sx={{ backgroundColor: '#66FF99', height: '40px', minWidth: '46px' }}>
            <AddOutlinedIcon sx={{ color: 'white' }}/>
          </Button>
        </Tooltip>
      </Box>
      <Box sx={{ px: 6 }}>
        <TableCategory onEditCategory={handleEditCategoryClick} />
      </Box>
    </Box>
  )
}

export default CategoryPage

