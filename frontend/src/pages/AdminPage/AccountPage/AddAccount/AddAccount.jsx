import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { createUserAPI } from '~/apis/userAPIs'

function AddAccount({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    address: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

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
      name: formData.name ? '' : 'Vui lòng nhập họ tên.',
      email: /\S+@\S+\.\S+/.test(formData.email) ? '' : 'Email không hợp lệ.',
      password: formData.password ? '' : 'Vui lòng nhập mật khẩu.',
      role: formData.role ? '' : 'Vui lòng chọn vai trò.',
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
      await createUserAPI(formData)
      setSnackbar({ open: true, message: 'Người dùng đã được thêm thành công!', severity: 'success' })
      setFormData({ name: '', email: '', password: '', role: '', phone: '', address: '' })
      setTimeout(() => onSuccess(), 500)
    } catch (error) {
      const backendMsg = error.response?.data?.message || 'Có lỗi xảy ra!'
      setSnackbar({ open: true, message: backendMsg, severity: 'error' })
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
          <Typography variant="h6" fontWeight="bold">Thêm tài khoản mới</Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Box component="form" spacing={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FieldCustom label="Họ tên" required value={formData.name} onChange={handleChange} name="name" error={!!errors.name} helperText={errors.name} />
            <FieldCustom label="Email" required value={formData.email} onChange={handleChange} name="email" error={!!errors.email} helperText={errors.email} />
            <FieldCustom label="Mật khẩu" type="password" required value={formData.password} onChange={handleChange} name="password" error={!!errors.password} helperText={errors.password} />
            <FieldCustom
              label="Vai trò" required select
              options={[
                { value: 'customer', label: 'Khách hàng' },
                { value: 'admin', label: 'Quản trị viên' },
                { value: 'employee', label: 'Nhân viên' }
              ]}
              value={formData.role} onChange={handleChange} name="role" error={!!errors.role} helperText={errors.role}
            />
            <FieldCustom label="Số điện thoại" value={formData.phone} onChange={handleChange} name="phone" error={!!errors.phone} helperText={errors.phone} />
            <FieldCustom label="Địa chỉ" multiline rows={2} value={formData.address} onChange={handleChange} name="address" error={!!errors.address} helperText={errors.address} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={<AddOutlinedIcon />}
            sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { backgroundColor: '#c8e6c9' } }}
          >
            {loading ? 'Đang thêm...' : 'Thêm ngay'}
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

export default AddAccount
