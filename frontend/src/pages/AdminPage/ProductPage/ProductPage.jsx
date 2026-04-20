import { Box, Button, Typography, InputBase } from '@mui/material'
import React, { useState } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import SearchIcon from '@mui/icons-material/Search'
import TableProduct from '~/components/admin/TableProduct/TableProduct'
import AddProduct from './AddProduct/AddProduct'
import EditProduct from './EditProduct/EditProduct'

function ProductPage() {
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddProduct = () => setOpenAddModal(true)
  
  const handleEditProduct = (productId) => {
    setSelectedProductId(productId)
    setOpenEditModal(true)
  }

  const handleSuccess = () => {
    setOpenAddModal(false)
    setOpenEditModal(false)
    // TableProduct will refresh via its internal useEffect if we trigger a refresh or just rely on the user
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
        
        <Button
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={handleAddProduct}
          sx={{
            color: 'white',
            borderColor: '#333',
            textTransform: 'none',
            borderRadius: '8px',
            height: '46px',
            px: 3,
            '&:hover': {
              borderColor: '#444',
              backgroundColor: '#1a1a1a'
            }
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      <Box sx={{ px: 5 }}>
        <TableProduct 
          onEditProduct={handleEditProduct} 
          searchQuery={searchQuery}
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
