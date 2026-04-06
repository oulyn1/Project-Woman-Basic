import React, { useState } from 'react'
import {
  Box, Typography, Button,
  Snackbar, Alert, CircularProgress,
  IconButton, InputAdornment
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { registerUserAPI } from '~/apis/userAPIs'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbar(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return showError('Vui lòng nhập đầy đủ thông tin!')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) return showError('Email không hợp lệ!')
    if (form.password.length < 6) return showError('Mật khẩu phải ít nhất 6 ký tự!')
    if (form.password !== form.confirmPassword) return showError('Mật khẩu xác nhận không khớp!')

    setLoading(true)
    try {
      const res = await registerUserAPI({
        name: form.name,
        email: form.email,
        password: form.password
      })
      showSuccess(res.message || 'Đăng ký thành công!')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      showError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  const showError = (msg) => {
    setSnackbarMessage(msg)
    setSnackbarSeverity('error')
    setOpenSnackbar(true)
  }

  const showSuccess = (msg) => {
    setSnackbarMessage(msg)
    setSnackbarSeverity('success')
    setOpenSnackbar(true)
  }

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#f8f9fa',
        backgroundImage: 'url("background.jpg")',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Box
        sx={{
          width: 500,
          backgroundColor: '#343a40',
          px: 4,
          py: 3,
          borderRadius: '16px',
          boxShadow: 3
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="white"
          sx={{ textAlign: 'center', mb: 2 }}
        >
          Đăng ký
        </Typography>

        <form onSubmit={handleSubmit}>
          <FieldCustom
            label="Họ và tên"
            required
            placeholder="Nhập tên..."
            name="name"
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <FieldCustom
            label="Email"
            required
            placeholder="Nhập email..."
            name="email"
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <FieldCustom
            label="Mật khẩu"
            required
            placeholder="Nhập mật khẩu..."
            name="password"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <FieldCustom
            label="Xác nhận mật khẩu"
            required
            placeholder="Nhập lại mật khẩu..."
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type={showConfirmPassword ? 'text' : 'password'}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1,
              backgroundColor: '#0d6efd',
              '&:hover': { backgroundColor: '#0b5ed7' },
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Đăng ký'}
          </Button>
        </form>

        <Typography
          variant="body2"
          color="white"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          Đã có tài khoản?{' '}
          <a href="/login" style={{ color: '#0d6efd' }}>
            Đăng nhập
          </a>
        </Typography>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '46px' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Register
