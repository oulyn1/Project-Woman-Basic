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
  Rating
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import StarIcon from '@mui/icons-material/Star'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import RateReviewIcon from '@mui/icons-material/RateReview'

import { getAllRatingsAPI, searchRatingsAPI, deleteRatingAPI } from '~/apis/ratingAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const TableRatings = ({ searchQuery }) => {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true)
      try {
        const data = searchQuery
          ? await searchRatingsAPI(searchQuery)
          : await getAllRatingsAPI()
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRows(sortedData)
      } catch {
        setRows([])
        setSnackbar({ open: true, message: 'Lỗi khi tải đánh giá!', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchRatings()
  }, [searchQuery])

  const handleDelete = (event, id) => {
    event.stopPropagation()
    setDeletingId(id)
    setOpenDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteRatingAPI(deletingId)
      setRows(rows.filter(r => r._id !== deletingId))
      setSnackbar({ open: true, message: 'Đã xóa đánh giá!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Lỗi!', severity: 'error' })
    } finally {
      setOpenDeleteConfirm(false)
      setDeletingId(null)
    }
  }

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id)

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
          <Box
            key={row._id}
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
            {/* Rating Header */}
            <Box sx={{ p: 2.5, cursor: 'pointer' }} onClick={() => toggleExpand(row._id)}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={row.image}
                  variant="rounded"
                  sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.05)' }}
                >
                  <RateReviewIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="white">{row.productName}</Typography>
                  <Rating
                    value={row.star}
                    readOnly
                    size="small"
                    icon={<StarIcon sx={{ color: '#FFD700' }} fontSize="inherit" />}
                    emptyIcon={<StarIcon sx={{ color: '#333' }} fontSize="inherit" />}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={(e) => handleDelete(e, row._id)} sx={{ color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.05)', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  {expandedId === row._id ? <ExpandLessIcon sx={{ color: '#555' }} /> : <ExpandMoreIcon sx={{ color: '#555' }} />}
                </Box>
              </Stack>
            </Box>

            {/* Expandable Content */}
            <Collapse in={expandedId === row._id}>
              <Box sx={{ p: 3, pt: 0, backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Stack direction="column" spacing={2}>
                  <Box>
                    <Typography variant="overline" color="#555" fontWeight="bold">Nội dung đánh giá</Typography>
                    <Typography variant="body1" color="#ccc" sx={{ mt: 0.5, fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{row.description}"
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarTodayIcon sx={{ color: '#555', fontSize: 16 }} />
                    <Typography variant="caption" color="#555">
                      Ngày đánh giá: {new Date(row.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Collapse>
          </Box>
        ))}

        {rows.length === 0 && !loading && (
          <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
            Chưa có đánh giá nào cho tiêu chí này.
          </Typography>
        )}
      </Stack>

      <TablePageControls page={page} rowsPerPage={rowsPerPage} count={rows.length} onChangePage={(_, p) => setPage(p)} />

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa đánh giá</DialogTitle>
        <DialogContent sx={{ color: '#aaa' }}>Bạn có chắc muốn xóa vĩnh viễn đánh giá này?</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ textTransform: 'none' }}>Xóa ngay</Button>
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

export default TableRatings
