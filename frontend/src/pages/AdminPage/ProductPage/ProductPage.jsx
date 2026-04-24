import { Box, Button, Typography, InputBase, FormControl, Select, MenuItem } from '@mui/material'
import React, { useState, useEffect } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import SearchIcon from '@mui/icons-material/Search'
import TableProduct from '~/components/admin/TableProduct/TableProduct'
import AddProduct from './AddProduct/AddProduct'
import EditProduct from './EditProduct/EditProduct'
import { fetchAllCategoriesAPI } from '~/apis/categoryAPIs'

function ProductPage() {
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL')
  const [categories, setCategories] = useState([])
  const [fetchTrigger, setFetchTrigger] = useState(0)

  useEffect(() => {
    fetchAllCategoriesAPI().then(res => setCategories(res || []))
  }, [])

  const handleAddProduct = () => setOpenAddModal(true)
  
  const handleEditProduct = (productId) => {
    setSelectedProductId(productId)
    setOpenEditModal(true)
  }

  const handleSuccess = () => {
    setOpenAddModal(false)
    setOpenEditModal(false)
    setFetchTrigger(prev => prev + 1)
  }

  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        mx: 5,
        my: 1,
        borderRadius: '8px',
        minHeight: '80vh',
        pb: 4
      }}
    >
      {/* Header with Search and Add Button */}
      <Box
        sx={{
          px: 5,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            px: 2,
            py: 0.5,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <SearchIcon sx={{ color: '#888', mr: 1 }} />
          <InputBase
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: 'white', flex: 1 }}
          />
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            displayEmpty
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#66FF99' }
            }}
          >
            <MenuItem value="ALL">Tất cả danh mục</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={handleAddProduct}
          sx={{
            color: 'white',
            borderColor: '#333',
            textTransform: 'none',
            borderRadius: '8px',
            height: '40px',
            px: 3,
            '&:hover': { borderColor: '#444', backgroundColor: '#1a1a1a' }
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      <Box sx={{ px: 5 }}>
        <TableProduct 
          onEditProduct={handleEditProduct} 
          searchQuery={searchQuery}
          categoryId={selectedCategoryId}
          fetchTrigger={fetchTrigger}
        />
      </Box>

      {/* Modals */}
      <AddProduct 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        onSuccess={handleSuccess}
      />

      {selectedProductId && (
        <EditProduct 
          open={openEditModal}
          productId={selectedProductId}
          onClose={() => setOpenEditModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  )
}

export default ProductPage
