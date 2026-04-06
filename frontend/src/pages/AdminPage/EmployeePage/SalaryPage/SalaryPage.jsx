import {
  Box, Button, Tooltip, Typography, Snackbar, Alert, TextField, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material'
import { React, useState, useEffect } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import { useNavigate, useParams } from 'react-router-dom'
import { getUserDetailAPI } from '~/apis/userAPIs'
import { getSalaryByEmployeeAndMonthAPI, deleteSalaryAPI } from '~/apis/salaryAPIs'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

function SalaryPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  // Loading
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [salaryLoading, setSalaryLoading] = useState(false)

  // Dialog xóa bảng lương
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  // Form data và salary data
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })
  const [salaryData, setSalaryData] = useState(null)

  // Tháng/năm chọn
  const [value, setValue] = useState(null)

  // Lấy thông tin nhân viên
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

  // Lấy bảng lương theo tháng
  const handleFetchSalary = async () => {
    if (!value) return
    setSalaryLoading(true)
    const month = value.getMonth() + 1
    const year = value.getFullYear()
    const workDateStr = `${year}-${month.toString().padStart(2, '0')}`

    try {
      const res = await getSalaryByEmployeeAndMonthAPI(id, workDateStr)
      if (res?.data) {
        setSalaryData(res.data)
      } else {
        setSalaryData(null)
        setSnackbarMessage('Không có bảng lương trong tháng này!')
        setSnackbarSeverity('warning')
        setOpenSnackbar(true)
      }
    } catch {
      setSalaryData(null)
      setSnackbarMessage('Không có bảng lương trong tháng này!')
      setSnackbarSeverity('warning')
      setOpenSnackbar(true)
    } finally {
      setSalaryLoading(false)
    }
  }

  // Xóa bảng lương
  const handleDeleteSalary = async () => {
    if (!salaryData?._id) return
    setSalaryLoading(true)
    try {
      await deleteSalaryAPI(salaryData._id)
      setSalaryData(null)
      setSnackbarMessage('Xóa bảng lương thành công!')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch {
      setSnackbarMessage('Xóa bảng lương thất bại!')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setSalaryLoading(false)
      setOpenDeleteDialog(false)
    }
  }

  return (
    <Box sx={{ backgroundColor: '#343a40', height: 'auto', overflow: 'auto', mx: 5, my: 1, borderRadius: '8px', p: 2 }}>
      {/* Header */}
      <Box sx={{ color: 'white', m: '16px 48px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h4'>Chi Tiết Nhân viên</Typography>
        <Box>
          <Tooltip title='Thêm Bảng Lương'>
            <Button
              onClick={() => navigate('/admin/employee/addsalary/' + id)}
              sx={{ backgroundColor: '#66FF99', height: '40px', minWidth: '46px', marginRight: '8px' }}
            >
              <AddOutlinedIcon sx={{ color: 'white' }} />
            </Button>
          </Tooltip>
          <Tooltip title='Xem ca làm'>
            <Button
              onClick={() => navigate('/admin/employee/workshift/' + id)}
              sx={{ backgroundColor: '#0096c7', height: '40px', minWidth: '46px' }}
            >
              <ManageAccountsOutlinedIcon sx={{ color: 'white' }} />
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Thông tin nhân viên */}
      <Box sx={{ mt: 3, color: 'white', display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: '#495057', borderRadius: '8px', p: 2, minHeight: '120px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '20px' }}><strong>Họ và tên:</strong> {formData.name}</Typography>
          <Typography sx={{ fontSize: '20px' }}><strong>Email:</strong> {formData.email}</Typography>
          <Typography sx={{ fontSize: '20px' }}><strong>Số điện thoại:</strong> {formData.phone}</Typography>
          <Typography sx={{ fontSize: '20px' }}><strong>Địa chỉ:</strong> {formData.address}</Typography>
        </Box>

        {/* Bảng lương */}
        <Box sx={{ backgroundColor: '#ffff', borderRadius: '8px', p: 2, minHeight: '120px', color: 'black', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Bảng lương</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <DatePicker
                views={['year', 'month']}
                label="Chọn tháng và năm"
                minDate={new Date('2020-01-01')}
                maxDate={new Date('2099-12-31')}
                value={value}
                onChange={(newValue) => setValue(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
              <Button variant="contained" onClick={handleFetchSalary} disabled={salaryLoading}>
                {salaryLoading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận'}
              </Button>
            </Box>
          </LocalizationProvider>

          {/* Hiển thị dữ liệu bảng lương */}
          {salaryData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '20px' }}><strong>Kỳ Lương:</strong> {salaryData.workDate}</Typography>
              <Typography sx={{ fontSize: '20px' }}><strong>Tổng thời gian làm việc (giờ):</strong> {salaryData.totalHours}</Typography>
              <Typography sx={{ fontSize: '20px' }}><strong>Lương cơ bản:</strong> {salaryData.hourlyRate}đ</Typography>
              <Typography sx={{ fontSize: '20px' }}><strong>Tiền Khen thưởng:</strong> {salaryData.bonus}đ</Typography>
              <Typography sx={{ fontSize: '20px' }}><strong>Tiền Vi Phạm/Phạt:</strong> {salaryData.deduction}đ</Typography>
              <Typography sx={{ fontSize: '20px' }}><strong>Lương Thực Lĩnh:</strong> {salaryData.netSalary}đ</Typography>

              {/* Nút xóa bảng lương */}
              <Button variant="outlined" color="error" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={() => setOpenDeleteDialog(true)} disabled={salaryLoading}>
                  Xóa bảng lương
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
              Bạn có chắc muốn xóa bảng lương này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button color="error" onClick={handleDeleteSalary} disabled={salaryLoading}>
            {salaryLoading ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SalaryPage
