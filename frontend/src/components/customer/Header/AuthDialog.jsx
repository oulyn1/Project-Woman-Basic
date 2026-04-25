import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  DialogTitle,
  DialogActions
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  loginUserAPI,
  registerUserAPI,
  checkEmailAPI,
  sendOtpAPI,
  verifyOtpAPI,
  resetPasswordAPI
} from '~/apis/userAPIs'
import { useNavigate } from 'react-router-dom'
import OtpInput from '~/components/customer/OtpInput/OtpInput'

function AuthDialog({ open, onClose, tabValue = 0 }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tabValue)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login/Register Mode
  const [showForgot, setShowForgot] = useState(false)

  // Login Form State
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // Register Form State
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Forgot Password Flow
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const showMsg = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  // Handlers
  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) return showMsg('Vui lòng nhập đầy đủ thông tin!', 'error')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginForm.email)) return showMsg('Email không hợp lệ!', 'error')

    setLoading(true)
    try {
      const res = await loginUserAPI(loginForm)
      if (res.token) {
        localStorage.setItem('accessToken', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        showMsg('Đăng nhập thành công!', 'success')
        setTimeout(() => {
          onClose()
          if (res.user?.role === 'admin' || res.user?.role === 'employee') {
            navigate('/admin')
          } else {
            window.location.reload()
          }
        }, 800)
      }
    } catch (err) {
      showMsg(err.response?.data?.message || 'Đăng nhập thất bại!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      return showMsg('Vui lòng nhập đầy đủ thông tin!', 'error')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.email)) return showMsg('Email không hợp lệ!', 'error')
    if (registerForm.password.length < 6) return showMsg('Mật khẩu phải ít nhất 6 ký tự!', 'error')
    if (registerForm.password !== registerForm.confirmPassword) {
      return showMsg('Mật khẩu xác nhận không khớp!', 'error')
    }

    setLoading(true)
    try {
      const res = await registerUserAPI({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password
      })
      showMsg(res.message || 'Đăng ký thành công!', 'success')
      setTimeout(() => setActiveTab(0), 1000)
    } catch (err) {
      showMsg(err.response?.data?.message || 'Đăng ký thất bại!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotNext = async () => {
    try {
      setForgotLoading(true)
      if (forgotStep === 1) {
        if (!forgotEmail) return showMsg('Vui lòng nhập email!', 'error')
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(forgotEmail)) return showMsg('Email không hợp lệ!', 'error')

        await checkEmailAPI(forgotEmail)
        await sendOtpAPI(forgotEmail)
        showMsg('Mã OTP đã được gửi đến email!', 'success')
        setForgotStep(2)
      } else if (forgotStep === 2) {
        if (otp.length !== 6) return showMsg('Vui lòng nhập đủ 6 số OTP!', 'error')
        await verifyOtpAPI(forgotEmail, otp)
        showMsg('Xác thực OTP thành công!', 'success')
        setForgotStep(3)
      } else if (forgotStep === 3) {
        if (!newPassword || !confirmNewPassword) return showMsg('Vui lòng nhập mật khẩu mới!', 'error')
        if (newPassword !== confirmNewPassword) return showMsg('Mật khẩu không khớp!', 'error')

        await resetPasswordAPI(forgotEmail, newPassword)
        showMsg('Đổi mật khẩu thành công!', 'success')
        setShowForgot(false)
        setForgotStep(1)
        setOtp('')
      }
    } catch (err) {
      showMsg(err.response?.data?.message || 'Có lỗi xảy ra!', 'error')
    } finally {
      setForgotLoading(false)
    }
  }

  const resetDialog = () => {
    setShowForgot(false)
    setForgotStep(1)
    setActiveTab(0)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => { onClose(); resetDialog() }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: 8, top: 8 }}>
          <IconButton onClick={() => { onClose(); resetDialog() }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', mt: 2 }}>
          {showForgot ? 'Quên Mật Khẩu' : (activeTab === 0 ? 'Đăng Nhập' : 'Đăng Ký')}
        </DialogTitle>

        <DialogContent>
          {!showForgot ? (
            <>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Đăng nhập" />
                <Tab label="Đăng ký" />
              </Tabs>

              {activeTab === 0 ? (
                <Box component="form" onSubmit={handleLoginSubmit}>
                  <TextField
                    fullWidth label="Email" name="email" type="email" margin="normal"
                    value={loginForm.email} onChange={handleLoginChange} required
                  />
                  <TextField
                    fullWidth label="Mật khẩu" name="password" margin="normal" required
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password} onChange={handleLoginChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    fullWidth size="large" type="submit" variant="contained" disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
                  </Button>
                  <Typography variant="body2" textAlign="center">
                    <Button onClick={() => setShowForgot(true)} sx={{ textTransform: 'none' }}>
                      Quên mật khẩu?
                    </Button>
                  </Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleRegisterSubmit}>
                  <TextField
                    fullWidth label="Họ và tên" name="name" margin="normal"
                    value={registerForm.name} onChange={handleRegisterChange} required
                  />
                  <TextField
                    fullWidth label="Email" name="email" type="email" margin="normal"
                    value={registerForm.email} onChange={handleRegisterChange} required
                  />
                  <TextField
                    fullWidth label="Mật khẩu" name="password" margin="normal" required
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password} onChange={handleRegisterChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth label="Xác nhận mật khẩu" name="confirmPassword" margin="normal" required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword} onChange={handleRegisterChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    fullWidth size="large" type="submit" variant="contained" disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ mt: 1 }}>
              {forgotStep === 1 && (
                <TextField
                  fullWidth label="Nhập email của bạn" type="email"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                />
              )}
              {forgotStep === 2 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ mb: 2 }}>Mã OTP đã gửi về email {forgotEmail}</Typography>
                  <OtpInput otp={otp} setOtp={setOtp} length={6} />
                </Box>
              )}
              {forgotStep === 3 && (
                <Box>
                  <TextField
                    fullWidth label="Mật khẩu mới" type="password" margin="normal"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <TextField
                    fullWidth label="Xác nhận mật khẩu mới" type="password" margin="normal"
                    value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button fullWidth variant="outlined" onClick={() => setShowForgot(false)}>Hủy</Button>
                <Button
                  fullWidth variant="contained" onClick={handleForgotNext} disabled={forgotLoading}
                >
                  {forgotLoading ? <CircularProgress size={24} /> : (forgotStep === 3 ? 'Xác nhận' : 'Tiếp theo')}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AuthDialog
