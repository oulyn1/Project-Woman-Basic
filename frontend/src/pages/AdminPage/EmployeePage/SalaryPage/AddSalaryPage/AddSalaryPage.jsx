import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useNavigate, useParams } from 'react-router-dom'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { createSalaryAPI } from '~/apis/salaryAPIs'
import { getShiftsByEmployeeAndMonthAPI } from '~/apis/workshiftAPIs'
import { getSalaryByEmployeeAndMonthAPI } from '~/apis/salaryAPIs'

function AddSalaryPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // State dữ liệu form
  const [formData, setFormData] = useState({
    workDate: null, // month/year
    totalHours: 0, // tổng số giờ làm việc (read only)
    hourlyRate: '', // lương cơ bản (nhập số)
    bonus: 0, // thưởng (nhập số)
    deduction: 0, // phạt/khấu trừ (nhập số)
    netSalary: 0 // lương thực tế = totalHours*hourlyRate + bonus - deduction (read only)
  })

  const [errors, setErrors] = useState({})

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleFetchShifts = async () => {
    if (!formData.workDate) return

    const month = formData.workDate.getMonth() + 1
    const year = formData.workDate.getFullYear()
    const workDateStr = `${year}-${month.toString().padStart(2, '0')}`

    let existingSalary

    try {
      existingSalary = await getSalaryByEmployeeAndMonthAPI(id, workDateStr)

      // ✅ Nếu bảng lương đã tồn tại, show snackbar và dừng
      if (existingSalary?.data) {
        setSnackbar({
          open: true,
          message: 'Bạn đã thêm bảng lương cho tháng này rồi!',
          severity: 'warning'
        })
        setFormData(prev => ({
          ...prev,
          totalHours: 0,
          netSalary: 0
        }))
        setTimeout(() => navigate(`/admin/employee/salary/${id}`), 1000)
        return
      }

    } catch (error) {
      // Nếu lỗi 500 → coi như chưa có bảng lương, tiếp tục lấy ca làm
      if (error.response?.status !== 500) {
        setSnackbar({
          open: true,
          message: 'Lỗi khi kiểm tra bảng lương.',
          severity: 'error'
        })
        return
      }
    }

    // ✅ Lấy ca làm trong tháng
    try {
      const shifts = await getShiftsByEmployeeAndMonthAPI(id, year, month)
      const totalHours = shifts?.reduce((sum, shift) => sum + (shift.totalHours || 0), 0) || 0

      setFormData(prev => ({
        ...prev,
        totalHours: Number(totalHours.toFixed(2)),
        netSalary: Number(
          (totalHours * (prev.hourlyRate || 0) + (prev.bonus || 0) - (prev.deduction || 0)).toFixed(2)
        )
      }))
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không có ca làm trong tháng này hoặc lỗi API.',
        severity: 'warning'
      })
      setFormData(prev => ({
        ...prev,
        totalHours: 0,
        netSalary: 0
      }))
    }
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setSnackbar(prev => ({ ...prev, open: false }))
  }
  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target
    let numericValue = value
    if (['hourlyRate', 'bonus', 'deduction'].includes(name)) {
      numericValue = value === '' ? '' : Number(value)
    }
    setFormData(prev => {
      const updated = { ...prev, [name]: numericValue }
      // Tính lại netSalary
      if (['hourlyRate', 'bonus', 'deduction'].includes(name)) {
        updated.netSalary = (prev.totalHours || 0) * (updated.hourlyRate || 0) + (updated.bonus || 0) - (updated.deduction || 0)
      }
      return updated
    })
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      workDate: formData.workDate ? '' : 'Vui lòng chọn tháng/năm.',
      hourlyRate: formData.hourlyRate !== '' && !isNaN(formData.hourlyRate) ? '' : 'Lương cơ bản phải là số.',
      bonus: formData.bonus !== '' && !isNaN(formData.bonus) ? '' : 'Thưởng phải là số.',
      deduction: formData.deduction !== '' && !isNaN(formData.deduction) ? '' : 'Phạt phải là số.'
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const payload = {
        employeeId: id,
        workDate: `${formData.workDate.getFullYear()}-${(formData.workDate.getMonth() + 1).toString().padStart(2, '0')}`,
        totalHours: formData.totalHours,
        hourlyRate: formData.hourlyRate,
        bonus: formData.bonus,
        deduction: formData.deduction,
        netSalary: formData.netSalary
      }
      await createSalaryAPI(payload)
      setSnackbar({ open: true, message: 'Tạo bảng lương thành công!', severity: 'success' })
      setTimeout(() => navigate('/admin/employee'), 800)
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
      setSnackbar({ open: true, message: msg, severity: 'error' })
    }
  }

  return (
    <Box sx={{ backgroundColor: '#343a40', mx: 5, my: 1, borderRadius: '8px', overflow: 'auto', padding:2 }}>
      <Box sx={{ color: 'white', m: '16px 48px 16px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Thêm Bảng Lương</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ px: 6 }}>
        <Box sx={{ mb: 2, backgroundColor: 'white', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: 'Black', paddingBottom: 2 }}>Chọn tháng/năm:</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              value={formData.workDate}
              onChange={(newDate) => setFormData(prev => ({ ...prev, workDate: newDate }))}
              renderInput={(params) => <TextField {...params} size="small" sx={{ backgroundColor: 'white', borderRadius: 1 }} />}
            />
          </LocalizationProvider>
          <Button onClick={handleFetchShifts} sx={{ ml: 2, mt: 1 }} variant="contained">Xác nhận</Button>
        </Box>

        <FieldCustom
          label="Tổng số giờ làm việc"
          value={formData.totalHours}
          name="totalHours"
          InputProps={{ readOnly: true }}
          error={!!errors.totalHours}
          helperText={errors.totalHours}
        />
        <FieldCustom
          label="Lương cơ bản"
          type="number"
          value={formData.hourlyRate}
          onChange={handleChange}
          name="hourlyRate"
          error={!!errors.hourlyRate}
          helperText={errors.hourlyRate}
          required={true}
          InputProps={{
            sx: {
              '& input[type=number]': {
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                MozAppearance: 'textfield',
              },
            },
          }}
        />

        <FieldCustom
          label="Khen Thưởng"
          type="number"
          value={formData.bonus}
          onChange={handleChange}
          name="bonus"
          error={!!errors.bonus}
          helperText={errors.bonus}
          InputProps={{
            sx: {
              '& input[type=number]': {
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                MozAppearance: 'textfield',
              },
            },
          }}
        />

        <FieldCustom
          label="Vi Phạm/Phạt:"
          type="number"
          value={formData.deduction}
          onChange={handleChange}
          name="deduction"
          error={!!errors.deduction}
          helperText={errors.deduction}
          InputProps={{
            sx: {
              '& input[type=number]': {
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                MozAppearance: 'textfield',
              },
            },
          }}
        />

        <FieldCustom
          label="Lương thực tế"
          value={formData.netSalary}
          name="netSalary"
          InputProps={{ readOnly: true }}
          error={!!errors.netSalary}
          helperText={errors.netSalary}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<AddOutlinedIcon />} sx={{ gap: 1, textTransform: 'none', fontSize: '18px' }}>
            Thêm Bảng Lương
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AddSalaryPage
