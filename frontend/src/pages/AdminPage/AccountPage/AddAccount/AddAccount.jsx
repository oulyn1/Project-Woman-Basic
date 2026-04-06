import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useNavigate } from 'react-router-dom'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { createUserAPI } from '~/apis/userAPIs'

function AddAccount() {
  const navigate = useNavigate()

  // State dữ liệu form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    address: ''
  })

  const [errors, setErrors] = useState({})

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') {
      setSnackbar((prev) => ({ ...prev, open: false }))
    }
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
        : '' // nếu hong nhập thì cho pass
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
  
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      }
  
      await createUserAPI(userData)
  
      setSnackbar({
        open: true,
        message: 'Người dùng đã được thêm thành công!',
        severity: 'success'
      })
  
      setTimeout(() => navigate('/admin/account'), 800)
      setErrors({})
    } catch (error) {
      const backendMsg = error.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng. Vui lòng thử lại!'
      setSnackbar({
        open: true,
        message: backendMsg,
        severity: 'error'
      })
    }
  }
  

  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        mx: 5,
        my: 1,
        borderRadius: '8px',
        overflow: 'auto'
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
        <Typography variant="h5">Thêm tài khoản</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ px: 6 }}>
        <FieldCustom
          label="Họ tên"
          required
          value={formData.name}
          onChange={handleChange}
          name="name"
          error={!!errors.name}
          helperText={errors.name}
        />
        <FieldCustom
          label="Email"
          required
          value={formData.email}
          onChange={handleChange}
          name="email"
          error={!!errors.email}
          helperText={errors.email}
        />
        <FieldCustom
          label="Mật khẩu"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          name="password"
          error={!!errors.password}
          helperText={errors.password}
        />
        <FieldCustom
          label="Vai trò"
          required
          select
          options={[
            { value: 'customer', label: 'Khách hàng' },
            { value: 'admin', label: 'Quản trị viên' },
            { value: 'employee', label: 'Nhân viên' }
          ]}
          value={formData.role}
          onChange={handleChange}
          name="role"
          error={!!errors.role}
          helperText={errors.role}
        />
        <FieldCustom
          label="Số điện thoại"

          value={formData.phone}
          onChange={handleChange}
          name="phone"
          error={!!errors.phone}
          helperText={errors.phone}
        />
        <FieldCustom
          label="Địa chỉ"

          multiline
          rows={2}
          value={formData.address}
          onChange={handleChange}
          name="address"
          error={!!errors.address}
          helperText={errors.address}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            sx={{ my: 2, gap: 1, textTransform: 'none', fontSize: '18px' }}
          >
            Thêm tài khoản
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '46px' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AddAccount
