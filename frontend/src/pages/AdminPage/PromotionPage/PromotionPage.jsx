import { Box, Typography, InputBase, Button, Tooltip, FormControl, Select, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import TablePromotion from '~/components/admin/TablePromotion/TablePromotion'
import AddPromotion from './AddPromotion/AddPromotion'
import EditPromotion from './EditPromotion/EditPromotion'

function PromotionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [openAdd, setOpenAdd] = useState(false)
  const [editInfo, setEditInfo] = useState({ open: false, promotionId: null })

  const handleEditClick = (id) => setEditInfo({ open: true, promotionId: id })
  const handleRefresh = () => {
    setOpenAdd(false)
    setEditInfo({ open: false, promotionId: null })
  }

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        mx: { xs: 1, md: 5 },
        my: 1,
        borderRadius: '8px',
        minHeight: '80vh',
        pb: 4
      }}
    >
      {/* Header with Search and Add Button */}
      <Box sx={{ px: { xs: 2, md: 5 }, py: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            displayEmpty
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#66FF99' }
            }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="active">Đang hoạt động</MenuItem>
            <MenuItem value="scheduled">Sắp diễn ra</MenuItem>
            <MenuItem value="ended">Đã kết thúc</MenuItem>
            <MenuItem value="inactive">Đã tạm dừng</MenuItem>
          </Select>
        </FormControl>

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

      <Box sx={{ px: { xs: 2, md: 5 } }}>
        <TablePromotion searchQuery={searchQuery} computedStatus={selectedStatus} onEditPromotion={handleEditClick} />
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
