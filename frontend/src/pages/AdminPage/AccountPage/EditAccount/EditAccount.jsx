import React, { useState, useEffect } from 'react'
import { Box, Button, Typography, Snackbar, Alert, CircularProgress } from '@mui/material'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import {updateAccountAPI, getUserDetailAPI } from '~/apis/userAPIs'
import { useNavigate, useParams } from 'react-router-dom'
import SaveIcon from '@mui/icons-material/Save'

function EditAccount() {
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('accessToken')
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    status: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const user = await getUserDetailAPI(id)
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          role: user.role || 'customer',
        })
      } catch {
        setSnackbarMessage('Không thể lấy thông tin người dùng. Vui lòng thử lại!')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchUserData()
  }, [id])

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbar(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      email: /\S+@\S+\.\S+/.test(formData.email) ? '' : 'Email không hợp lệ.',
      phone: formData.phone 
        ? (/^[0-9]{9,11}$/.test(formData.phone) ? '' : 'SĐT không hợp lệ.')
        : '' // nếu hong nhập thì cho pass
    }

    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const userDataToUpdate = {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      }

      await updateAccountAPI(id, userDataToUpdate, token)

      setSnackbarMessage('Người dùng đã được cập nhật thành công!')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      setTimeout(() => {
        navigate('/admin/account')
      }, 800)

      setErrors({})
    } catch {
      setSnackbarMessage('Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại!')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ backgroundColor: '#343a40', height: 'auto', overflow: 'auto', mx: 5, my: 1, borderRadius: '8px' }}>
      <Box sx={{ color: 'white', m: '16px 48px 16px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Chỉnh sửa người dùng</Typography>
      </Box>

      <Box sx={{ px: 6 }} component="form" onSubmit={handleSubmit}>
        <FieldCustom
          label="Họ và tên"
          InputProps={{
            readOnly: true, 
          }}
          value={formData.name}
          onChange={handleChange}
          name="name"
          error={!!errors.name}
          helperText={errors.name}
        />
        <FieldCustom
          label="Email"
          required
          placeholder="Nhập email..."
          value={formData.email}
          onChange={handleChange}
          name="email"
          error={!!errors.email}
          helperText={errors.email}
        />
        <FieldCustom
          label="Số điện thoại"
          placeholder="Nhập số điện thoại..."
          value={formData.phone}
          onChange={handleChange}
          name="phone"
          error={!!errors.phone}
          helperText={errors.phone}
        />
        <FieldCustom
          label="Địa chỉ"
          placeholder="Nhập địa chỉ..."
          value={formData.address}
          onChange={handleChange}
          name="address"
          error={!!errors.address}
          helperText={errors.address}
        />
        <FieldCustom
          label="Vai trò"
          InputProps={{
            readOnly: true,
          }}
          value={formData.role}
          onChange={handleChange}
          name="role"
          error={!!errors.role}
          helperText={errors.role}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none', fontSize: '18px' }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : <SaveIcon />}
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '46px' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EditAccount
