import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useNavigate } from 'react-router-dom'
import TablePromotion from '~/components/admin/TablePromotion/TablePromotion'

function PromotionPage() {
  const navigate = useNavigate()
  const handleAddPromotionClick = () => {
    navigate('/admin/promotion/add-promotion')
  }
  const handleEditPromotionClick = (promotionId) => {
    navigate(`/admin/promotion/edit-promotion/${promotionId}`)
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
          Quản Lý Khuyến Mãi
        </Typography>
        <Tooltip title='Thêm sản phẩm'>
          <Button onClick={handleAddPromotionClick} sx={{ backgroundColor: '#66FF99', height: '40px', minWidth: '46px' }}>
            <AddOutlinedIcon sx={{ color: 'white' }}/>
          </Button>
        </Tooltip>
      </Box>
      <Box sx={{ px: 6 }}>
        <TablePromotion onEditPromotion={handleEditPromotionClick} />
      </Box>
    </Box>
  )
}

export default PromotionPage
