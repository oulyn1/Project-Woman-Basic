import { Box, Typography, InputBase, Button, Tooltip } from '@mui/material'
import React, { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import TablePromotion from '~/components/admin/TablePromotion/TablePromotion'
import AddPromotion from './AddPromotion/AddPromotion'
import EditPromotion from './EditPromotion/EditPromotion'

function PromotionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [editInfo, setEditInfo] = useState({ open: false, promotionId: null })

  const handleEditClick = (id) => setEditInfo({ open: true, promotionId: id })
  const handleRefresh = () => {
    setOpenAdd(false)
    setEditInfo({ open: false, promotionId: null })
    // Table will re-fetch if we trigger a state change or if it has internal refresh
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
      <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
            placeholder="Tìm theo tên khuyến mãi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: 'white', flex: 1 }}
          />
        </Box>

        <Tooltip title="Thêm khuyến mãi mới">
          <Button
            onClick={() => setOpenAdd(true)}
            variant="contained"
            sx={{
              backgroundColor: '#66FF99',
              color: 'white',
              height: '40px',
              minWidth: '46px',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#52d17c' }
            }}
          >
            <AddOutlinedIcon />
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ px: 5 }}>
        <TablePromotion searchQuery={searchQuery} onEditPromotion={handleEditClick} />
      </Box>

      {/* Modals */}
      <AddPromotion 
        open={openAdd} 
        onClose={() => setOpenAdd(false)} 
        onSuccess={handleRefresh} 
      />
      
      <EditPromotion 
        open={editInfo.open} 
        promotionId={editInfo.promotionId} 
        onClose={() => setEditInfo({ open: false, promotionId: null })} 
        onSuccess={handleRefresh} 
      />
    </Box>
  )
}

export default PromotionPage
