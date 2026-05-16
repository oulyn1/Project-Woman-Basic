import { Box, TextField, Button, Typography, Stack, Divider, LinearProgress, Paper, Avatar, Snackbar, Alert } from '@mui/material'
import { useState, useEffect } from 'react'
import { updateUserAPI } from '~/apis/userAPIs'
import { fetchMyOrdersAPI } from '~/apis/orderAPIs'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import EditIcon from '@mui/icons-material/Edit'

function CreateInformation() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('accessToken')

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [totalSpent, setTotalSpent] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const data = await fetchMyOrdersAPI()
        const currentYear = new Date().getFullYear()
        const validOrders = data.filter(o => {
          const isNotCancelled = o.status?.toLowerCase() !== 'cancelled'
          const isThisYear = new Date(o.createdAt).getFullYear() === currentYear
          return isNotCancelled && isThisYear
        })
        const spent = validOrders.reduce((acc, order) => acc + (order.total || 0), 0)
        setTotalSpent(spent)
      } catch {
        // ignore
      }
    }
    if (token) getMyOrders()
  }, [token])

  const getTierInfo = (amount) => {
    if (amount >= 50000000) return { current: 'Platinum', next: null, threshold: 0, color: '#e5e4e2' }
    if (amount >= 20000000) return { current: 'Gold', next: 'Platinum', threshold: 50000000, color: '#ffd700' }
    if (amount >= 5000000) return { current: 'Silver', next: 'Gold', threshold: 20000000, color: '#c0c0c0' }
    return { current: 'Standard', next: 'Silver', threshold: 5000000, color: '#a0522d' }
  }

  const tierInfo = getTierInfo(totalSpent)
  const progressPercent = tierInfo.next ? Math.min((totalSpent / tierInfo.threshold) * 100, 100) : 100
  const amountToNext = tierInfo.next ? (tierInfo.threshold - totalSpent) : 0

  const handleLogout = () => {
    const userStr = localStorage.getItem('user')
    const user = JSON.parse(userStr)
    const id = user._id
    navigator.sendBeacon(`http://localhost:8017/v1/user/logout/${id}`, null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('visitedcustomer')
    window.location.href = '/'
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address
      }

      const updatedUser = await updateUserAPI(updateData, token)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditing(false)
      setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Có lỗi xảy ra khi cập nhật!', severity: 'error' })
    }
  }

  return (
    <Box
      sx={{
        bgcolor: '#f5f5f5',
        minHeight: '100vh',
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 0 }
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" color="#0c3860" mb={4} textAlign="center">
          Hồ Sơ Của Tôi
        </Typography>

        {/* Tier Info Card */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #0c3860 0%, #1a5f9a 100%)', color: 'white' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Avatar sx={{ width: 100, height: 100, bgcolor: tierInfo.color, color: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <EmojiEventsIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h5" fontWeight="bold" mb={1}>
                Hạng thành viên: {tierInfo.current}
              </Typography>
              <Typography variant="body1" mb={2}>
                Tổng chi tiêu: <strong>{totalSpent.toLocaleString('vi-VN')}đ</strong>
              </Typography>
              
              {tierInfo.next ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tiến trình lên hạng {tierInfo.next}</Typography>
                    <Typography variant="body2" fontWeight="bold">{progressPercent.toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressPercent} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5, 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: tierInfo.color,
                        borderRadius: 5
                      }
                    }} 
                  />
                  <Typography variant="body2" mt={1} sx={{ opacity: 0.9 }}>
                    Mua thêm <strong>{amountToNext.toLocaleString('vi-VN')}đ</strong> để thăng hạng.
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                    * Hạng và chi tiêu sẽ được reset vào ngày 31/12/{new Date().getFullYear()}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" fontWeight="bold" color="#ffd700">
                    🎉 Bạn đã đạt hạng cao nhất!
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                    * Hạng và chi tiêu sẽ được reset vào ngày 31/12/{new Date().getFullYear()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Personal Info Card */}
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ color: '#0c3860', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" color="#0c3860">
              Thông tin cá nhân
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />

          <Box>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="#666" mb={0.5}>Họ và tên</Typography>
                {isEditing ? (
                  <TextField fullWidth name="fullName" value={form.fullName} onChange={handleChange} required size="small" />
                ) : (
                  <Typography variant="body1" fontWeight="500">{form.fullName || 'Chưa cập nhật'}</Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="#666" mb={0.5}>Email</Typography>
                {isEditing ? (
                  <TextField fullWidth name="email" type="email" value={form.email} onChange={handleChange} required size="small" />
                ) : (
                  <Typography variant="body1" fontWeight="500">{form.email || 'Chưa cập nhật'}</Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="#666" mb={0.5}>Số điện thoại</Typography>
                {isEditing ? (
                  <TextField fullWidth name="phone" type="tel" value={form.phone} onChange={handleChange} required size="small" />
                ) : (
                  <Typography variant="body1" fontWeight="500">{form.phone || 'Chưa cập nhật'}</Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="#666" mb={0.5}>Địa chỉ</Typography>
                {isEditing ? (
                  <TextField fullWidth name="address" value={form.address} onChange={handleChange} required size="small" />
                ) : (
                  <Typography variant="body1" fontWeight="500">{form.address || 'Chưa cập nhật'}</Typography>
                )}
              </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {!isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
                  >
                    Đăng xuất
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    startIcon={<EditIcon />}
                    sx={{ bgcolor: '#0c3860', borderRadius: 2, fontWeight: 'bold', textTransform: 'none', '&:hover': { bgcolor: '#082947' } }}
                  >
                    Sửa thông tin
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false)
                      // Reset form to original values
                      setForm({
                        fullName: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || ''
                      })
                    }}
                    sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ bgcolor: '#4caf50', borderRadius: 2, fontWeight: 'bold', textTransform: 'none', '&:hover': { bgcolor: '#388e3c' } }}
                  >
                    Lưu thay đổi
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: { xs: 8, md: 10 } }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CreateInformation
