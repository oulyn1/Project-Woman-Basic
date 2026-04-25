import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { updateAccountAPI, getUserDetailAPI } from '~/apis/userAPIs'

function EditAccount({ open, onClose, onSuccess, accountId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const token = localStorage.getItem('accessToken')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchUserData = async () => {
      setFetching(true)
      try {
        const user = await getUserDetailAPI(accountId)
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          role: user.role || 'customer',
        })
      } catch {
        setSnackbar({ open: true, message: 'Lỗi khi lấy dữ liệu người dùng!', severity: 'error' })
      } finally {
        setFetching(false)
      }
    }
    if (open && accountId) fetchUserData()
  }, [open, accountId])

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      email: /\S+@\S+\.\S+/.test(formData.email) ? '' : 'Email không hợp lệ.',
      phone: formData.phone
        ? (/^[0-9]{9,11}$/.test(formData.phone) ? '' : 'SĐT không hợp lệ.')
        : ''
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const userDataToUpdate = {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      }
      await updateAccountAPI(accountId, userDataToUpdate, token)
      setSnackbar({ open: true, message: 'Đã cập nhật thành công!', severity: 'success' })
      setTimeout(() => onSuccess(), 500)
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật!', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px', border: '1px solid #333' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="div" variant="h6" fontWeight="bold">Chỉnh sửa tài khoản</Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="inherit" /></Box>
          ) : (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FieldCustom label="Họ và tên" InputProps={{ readOnly: true }} value={formData.name} name="name" />
              <FieldCustom label="Email" required placeholder="Nhập email..." value={formData.email} onChange={handleChange} name="email" error={!!errors.email} helperText={errors.email} />
              <FieldCustom label="Số điện thoại" placeholder="Nhập số điện thoại..." value={formData.phone} onChange={handleChange} name="phone" error={!!errors.phone} helperText={errors.phone} />
              <FieldCustom label="Địa chỉ" placeholder="Nhập địa chỉ..." value={formData.address} onChange={handleChange} name="address" error={!!errors.address} helperText={errors.address} />
              <FieldCustom label="Vai trò" InputProps={{ readOnly: true }} value={formData.role} name="role" />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || fetching}
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { backgroundColor: '#bbdefb' } }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default EditAccount
