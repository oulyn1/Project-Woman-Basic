import React, { useState } from 'react'
import { useEffect } from 'react'
import {
  Box, Typography, Button,
  Snackbar, Alert, CircularProgress,
  IconButton, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { loginUserAPI, checkEmailAPI, sendOtpAPI, verifyOtpAPI, resetPasswordAPI } from '~/apis/userAPIs'
import { useNavigate } from 'react-router-dom'
import OtpInput from '~/components/customer/OtpInput/OtpInput'

function Login() {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const userStr = localStorage.getItem('user')
      const user = JSON.parse(userStr)
      const role = user.role
      if (role === 'admin' || role === 'employee') navigate('/admin')
      else if (role === 'customer') navigate('/')
    }
  }, [navigate])
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const [showPassword, setShowPassword] = useState(false)

  // Forgot password states
  const [openForgot, setOpenForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbar(false)
  }

  // Login submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setSnackbarMessage('Vui lòng nhập email và mật khẩu!')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setSnackbarMessage('Email không hợp lệ!')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    setLoading(true)
    try {
      const res = await loginUserAPI(form)

      if (res.token) {
        localStorage.setItem('accessToken', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
      }

      const role = res.user?.role
      setSnackbarMessage('Đăng nhập thành công!')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      setTimeout(() => {
        if (role === 'admin'|| role === 'employee') navigate('/admin')
        else if (role === 'customer') navigate('/')
        else navigate('/login')
      }, 800)
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại!'
      setSnackbarMessage(msg)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  // Handle forgot password next step
  const handleForgotNext = async () => {
    try {
      if (forgotStep === 1) {
        if (!email) {
          setSnackbarMessage('Vui lòng nhập email!')
          setSnackbarSeverity('error')
          setOpenSnackbar(true)
          return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          setSnackbarMessage('Email không hợp lệ!')
          setSnackbarSeverity('error')
          setOpenSnackbar(true)
          return
        }
      }

      setForgotLoading(true)

      if (forgotStep === 1) {
        await checkEmailAPI(email)
        await sendOtpAPI(email)
        setSnackbarMessage('Mã OTP đã được gửi đến email!')
        setSnackbarSeverity('success')
        setOpenSnackbar(true)
        setForgotStep(2)
      } else if (forgotStep === 2) {
        if (otp.length !== 6) {
          setSnackbarMessage('Vui lòng nhập đủ 6 số OTP!')
          setSnackbarSeverity('error')
          setOpenSnackbar(true)
          return
        }
        await verifyOtpAPI(email, otp)
        setSnackbarMessage('Xác thực OTP thành công!')
        setSnackbarSeverity('success')
        setOpenSnackbar(true)
        setForgotStep(3)
      } else if (forgotStep === 3) {
        if (!newPassword || !confirmPassword) {
          setSnackbarMessage('Vui lòng nhập mật khẩu mới và xác nhận!')
          setSnackbarSeverity('error')
          setOpenSnackbar(true)
          return
        }
        if (newPassword !== confirmPassword) {
          setSnackbarMessage('Mật khẩu và xác nhận mật khẩu không khớp!')
          setSnackbarSeverity('error')
          setOpenSnackbar(true)
          return
        }

        await resetPasswordAPI(email, newPassword)
        setSnackbarMessage('Đổi mật khẩu thành công!')
        setSnackbarSeverity('success')
        setOpenSnackbar(true)
        setOpenForgot(false)
        setForgotStep(1)
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setSnackbarMessage(err.response?.data?.message || 'Có lỗi xảy ra!')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#f8f9fa',
        backgroundImage: 'url("/background.jpg")',
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
          Đăng nhập
        </Typography>

        <form onSubmit={handleSubmit}>
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
                    onClick={() => setShowPassword(prev => !prev)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
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
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Đăng nhập'}
          </Button>
        </form>

        {/* Forgot password link */}
        <Button
          onClick={() => { setOpenForgot(true); setForgotStep(1) }}
          sx={{ mt: 1, color: '#0d6efd', fontWeight: 'bold', textTransform: 'none' }}
          fullWidth
        >
          Quên mật khẩu?
        </Button>

        <Typography
          variant="body2"
          color="white"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          Chưa có tài khoản?{' '}
          <a href="/register" style={{ color: '#0d6efd' }}>
            Đăng ký
          </a>
        </Typography>
      </Box>

      {/* Snackbar */}
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

      {/* Forgot password dialog */}
      <Dialog open={openForgot} onClose={() => setOpenForgot(false)}>
        <DialogTitle>Quên mật khẩu</DialogTitle>
        <DialogContent>
          {forgotStep === 1 && (
            <TextField
              label="Nhập email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {forgotStep === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography>Nhập mã OTP đã gửi về email</Typography>
              <OtpInput otp={otp} setOtp={setOtp} length={6} />
            </Box>
          )}
          {forgotStep === 3 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Mật khẩu mới"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Xác nhận mật khẩu"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {forgotStep > 1 && (
            <Button onClick={() => setForgotStep(forgotStep - 1)}>Quay lại</Button>
          )}
          <Button
            onClick={handleForgotNext}
            disabled={forgotLoading}
          >
            {forgotLoading
              ? <CircularProgress size={22} />
              : forgotStep === 3 ? 'Xác nhận' : 'Tiếp tục'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Login
