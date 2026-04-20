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
  Menu,
  MenuItem,
  Collapse,
  Avatar
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ShieldIcon from '@mui/icons-material/Shield'

import { AllUsersAPI, searchUserAPI, deleteUserAPI } from '~/apis/userAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const TableAccount = ({ onEditAccount, searchQuery }) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = !searchQuery
          ? await AllUsersAPI(token)
          : await searchUserAPI(searchQuery, token)
        setRows(data)
      } catch {
        setRows([])
        setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu!', severity: 'error' })
      }
    }
    fetchUsers()
  }, [searchQuery, token])

  const handleOpenMenu = (event, id) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedId(id)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedId(null)
  }

  const handleAction = (type) => {
    if (type === 'edit') onEditAccount(selectedId)
    else if (type === 'delete') {
      setDeletingId(selectedId)
      setOpenDeleteConfirm(true)
    }
    handleCloseMenu()
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUserAPI(deletingId)
      setRows(rows.filter(u => u._id !== deletingId))
      setSnackbar({ open: true, message: 'Đã xóa tài khoản!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi xóa!', severity: 'error' })
    } finally {
      setOpenDeleteConfirm(false)
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
            {/* Main Header */}
            <Box
              sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleExpand(row._id)}
            >
              <Avatar
                sx={{
                  bgcolor: row.role === 'admin' ? '#f44336' : row.role === 'employee' ? '#2196f3' : '#4caf50',
                  width: 44,
                  height: 44,
                  mr: 2,
                  fontWeight: 'bold'
                }}
              >
                {row.name.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="white">
                  {row.name}
                </Typography>
                <Typography variant="body2" color="#888">
                  {row.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '20px',
                    backgroundColor: row.status === 'online' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    color: row.status === 'online' ? '#4caf50' : '#ff5252',
                    border: `1px solid ${row.status === 'online' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.5)'}`,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {row.status || 'Offline'}
                </Box>
                <IconButton onClick={(e) => handleOpenMenu(e, row._id)} sx={{ color: '#888' }}>
                  <MoreVertIcon />
                </IconButton>
                {expandedId === row._id ? <ExpandLessIcon sx={{ color: '#555' }} /> : <ExpandMoreIcon sx={{ color: '#555' }} />}
              </Box>
            </Box>

            {/* Expandable Content */}
            <Collapse in={expandedId === row._id}>
              <Box sx={{ p: 3, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ShieldIcon sx={{ color: '#888', fontSize: 20 }} />
                      <Typography variant="body2" color="#aaa"><Box component="span" sx={{ color: '#555' }}>Vai trò:</Box> {row.role}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PhoneIcon sx={{ color: '#888', fontSize: 20 }} />
                      <Typography variant="body2" color="#aaa"><Box component="span" sx={{ color: '#555' }}>Liên hệ:</Box> {row.phone || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocationOnIcon sx={{ color: '#888', fontSize: 20 }} />
                      <Typography variant="body2" color="#aaa"><Box component="span" sx={{ color: '#555' }}>Địa chỉ:</Box> {row.address || 'Chưa cập nhật'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <EmailIcon sx={{ color: '#888', fontSize: 20 }} />
                      <Typography variant="body2" color="#aaa">
                        <Box component="span" sx={{ color: '#555' }}>Ngày tham gia:</Box> {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            </Collapse>
          </Box>
        ))}

        {rows.length === 0 && (
          <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
            Không tìm thấy tài khoản nào.
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
          <DeleteIcon fontSize="small" /> Xóa tài khoản
        </MenuItem>
      </Menu>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent sx={{ color: '#aaa' }}>
          Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.
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

export default TableAccount
