import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Stack,
  Menu,
  MenuItem
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CategoryIcon from '@mui/icons-material/Category'

import { fetchAllCategoriesAPI, deleteCategoryAPI, searchCategoriesAPI } from '~/apis/categoryAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const TableCategory = ({ onEditCategory, searchQuery, refreshTrigger }) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchCategorys = async () => {
      try {
        const data = !searchQuery
          ? await fetchAllCategoriesAPI()
          : await searchCategoriesAPI(searchQuery)
        setRows(data)
      } catch {
        setRows([])
        setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu!', severity: 'error' })
      }
    }
    fetchCategorys()
  }, [searchQuery, refreshTrigger])

  const handleOpenMenu = (event, id) => {
    setAnchorEl(event.currentTarget)
    setSelectedId(id)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedId(null)
  }

  const handleAction = (type) => {
    if (type === 'edit') onEditCategory(selectedId)
    else if (type === 'delete') {
      setDeletingCategoryId(selectedId)
      setOpenDeleteConfirm(true)
    }
    handleCloseMenu()
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCategoryAPI(deletingCategoryId)
      setRows(rows.filter(cat => cat._id !== deletingCategoryId))
      setSnackbar({ open: true, message: 'Đã xóa danh mục!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi xóa!', severity: 'error' })
    } finally {
      setOpenDeleteConfirm(false)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
          <Box
            key={row._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.06)',
                transform: 'translateY(-2px)',
                borderColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#888'
                }}
              >
                <CategoryIcon />
              </Box>
              <Typography variant="body1" fontWeight="600" color="white">
                {row.name}
              </Typography>
            </Stack>

            <IconButton onClick={(e) => handleOpenMenu(e, row._id)} sx={{ color: '#888' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        ))}

        {rows.length === 0 && (
          <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
            Không tìm thấy danh mục nào.
          </Typography>
        )}
      </Stack>

      <TablePageControls
        page={page}
        rowsPerPage={rowsPerPage}
        count={rows.length}
        onChangePage={(_, p) => setPage(p)}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { backgroundColor: '#252525', border: '1px solid #333', color: 'white', minWidth: 160 }
        }}
      >
        <MenuItem onClick={() => handleAction('edit')} sx={{ gap: 1.5 }}>
          <EditIcon fontSize="small" /> Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ gap: 1.5, color: '#f44336' }}>
          <DeleteIcon fontSize="small" /> Xóa danh mục
        </MenuItem>
      </Menu>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent sx={{ color: '#aaa' }}>
          Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TableCategory
