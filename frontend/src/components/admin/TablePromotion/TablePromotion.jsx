import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Stack,
  Collapse,
  Avatar,
  Divider,
  Menu,
  MenuItem
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PercentIcon from '@mui/icons-material/Percent'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DescriptionIcon from '@mui/icons-material/Description'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Chip } from '@mui/material'

import { fetchAllPromotionsAPI, deletePromotionAPI, clonePromotionAPI } from '~/apis/promotionAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const TablePromotion = ({ onEditPromotion, searchQuery, computedStatus = 'ALL' }) => {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true)
      try {
        const query = { search: searchQuery }
        if (computedStatus !== 'ALL') query.computedStatus = computedStatus
        const response = await fetchAllPromotionsAPI(query)
        setRows(response.items || [])
        setPage(0)
      } catch (error) {
        setRows([])
        setSnackbar({ open: true, message: 'Lỗi khi tải khuyến mãi!', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchPromotions()
  }, [searchQuery, computedStatus])

  const handleOpenMenu = (event, id) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedId(id)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    // Removed setSelectedId(null) here because it's needed for the delete confirm dialog
  }

  const handleAction = async (type) => {
    if (type === 'edit') {
      onEditPromotion(selectedId)
      handleCloseMenu()
    }
    else if (type === 'delete') {
      setOpenDeleteConfirm(true)
      setAnchorEl(null) // Only close the menu, keep selectedId
    }
    else if (type === 'clone') {
      try {
        await clonePromotionAPI(selectedId)
        const response = await fetchAllPromotionsAPI({ search: searchQuery })
        setRows(response.items || [])
        setSnackbar({ open: true, message: 'Nhân bản thành công!', severity: 'success' })
      } catch (error) {
        setSnackbar({ open: true, message: 'Lỗi nhân bản!', severity: 'error' })
      }
      handleCloseMenu()
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deletePromotionAPI(selectedId || expandedId)
      setRows(rows.filter(p => p._id !== (selectedId || expandedId)))
      setSnackbar({ open: true, message: 'Đã xóa khuyến mãi!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Lỗi!', severity: 'error' })
    } finally {
      setSelectedId(null)
      setOpenDeleteConfirm(false)
    }
  }

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id)
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : 'N/A'

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((promo) => (
          <Box
            key={promo._id}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            {/* Promotion Header */}
            <Box sx={{ p: 2.5, cursor: 'pointer' }} onClick={() => toggleExpand(promo._id)}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#ff4081', color: 'white' }}><PercentIcon /></Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="white">{promo.title}</Typography>
                    <Chip 
                      label={promo.computedStatus.toUpperCase()} 
                      size="small" 
                      color={
                        promo.computedStatus === 'active' ? 'success' : 
                        promo.computedStatus === 'scheduled' ? 'info' : 
                        promo.computedStatus === 'ended' ? 'error' : 'default'
                      }
                      sx={{ height: 20, fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Chip 
                      label={promo.type === 'product' ? 'SẢN PHẨM' : 'ĐƠN HÀNG'} 
                      size="small" 
                      variant="outlined"
                      sx={{ height: 20, fontSize: '10px', color: '#888', borderColor: '#444' }}
                    />
                  </Stack>
                  <Typography variant="body2" color="#888">
                    Giảm {promo.discountValue}{promo.discountType === 'percent' ? '%' : 'đ'} • {promo.type === 'product' ? `${promo.productIds?.length || 0} sản phẩm` : `Min: ${promo.minOrderValue.toLocaleString()}đ`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={(e) => handleOpenMenu(e, promo._id)} sx={{ color: '#888' }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  {expandedId === promo._id ? <ExpandLessIcon sx={{ color: '#555' }} /> : <ExpandMoreIcon sx={{ color: '#555' }} />}
                </Box>
              </Stack>
            </Box>

            {/* Expandable Details */}
            <Collapse in={expandedId === promo._id}>
              <Box sx={{ p: 3, pt: 0, backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                  <Box sx={{ flex: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <DescriptionIcon sx={{ color: '#555', fontSize: 18 }} />
                      <Typography variant="overline" color="#555" fontWeight="bold">Mô tả chương trình</Typography>
                    </Stack>
                    <Typography variant="body2" color="#aaa" sx={{ lineHeight: 1.6 }}>{promo.description}</Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <CalendarTodayIcon sx={{ color: '#555', fontSize: 18 }} />
                      <Typography variant="overline" color="#555" fontWeight="bold">Thời gian áp dụng</Typography>
                    </Stack>
                    <Typography variant="body2" color="#aaa">Bắt đầu: {formatDate(promo.startDate)}</Typography>
                    <Typography variant="body2" color="#aaa">Kết thúc: {formatDate(promo.endDate)}</Typography>
                  </Box>

                  <Box sx={{ flex: 0.8, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', textAlign: 'center', width: '100%' }}>
                      <ShoppingCartIcon sx={{ color: '#888', mb: 0.5 }} />
                      <Typography variant="h6" color="white" fontWeight="bold">{promo.productIds?.length || 0}</Typography>
                      <Typography variant="caption" color="#555">Sản phẩm</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Collapse>
          </Box>
        ))}

        {rows.length === 0 && !loading && (
          <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
            Không tìm thấy chương trình khuyến mãi nào.
          </Typography>
        )}
      </Stack>

      <TablePageControls page={page} rowsPerPage={rowsPerPage} count={rows.length} onChangePage={(_, p) => setPage(p)} />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { backgroundColor: '#252525', border: '1px solid #333', color: 'white', minWidth: 160 } }}
      >
        <MenuItem onClick={() => handleAction('edit')} sx={{ gap: 1.5 }}><EditIcon fontSize="small" /> Chỉnh sửa</MenuItem>
        <MenuItem onClick={() => handleAction('clone')} sx={{ gap: 1.5 }}><ContentCopyIcon fontSize="small" /> Nhân bản</MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ gap: 1.5, color: '#f44336' }}><DeleteIcon fontSize="small" /> Xóa khuyến mãi</MenuItem>
      </Menu>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => {
          setOpenDeleteConfirm(false)
          setSelectedId(null)
        }}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent sx={{ color: '#aaa' }}>Hành động này không thể hoàn tác. Bạn có chắc muốn xóa?</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setOpenDeleteConfirm(false)
            setSelectedId(null)
          }} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ textTransform: 'none' }}>Xóa vĩnh viễn</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default TablePromotion
