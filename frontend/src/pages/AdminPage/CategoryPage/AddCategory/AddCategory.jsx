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
import { createCategoryAPI } from '~/apis/categoryAPIs'

function AddCategory({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      name: formData.name ? '' : 'Vui lòng nhập tên danh mục.',
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every((x) => x === '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      await createCategoryAPI({ name: formData.name })
      setSnackbar({ open: true, message: 'Danh mục đã được thêm thành công!', severity: 'success' })
      setFormData({ name: '' })
      setTimeout(() => onSuccess(), 500)
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi thêm danh mục!', severity: 'error' })
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
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderRadius: '12px',
            border: '1px solid #333'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Thêm danh mục mới</Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          <FieldCustom
            label="Tên danh mục"
            required
            placeholder="Ví dụ: Áo khoác"
            value={formData.name}
            onChange={handleChange}
            name="name"
            error={!!errors.name}
            helperText={errors.name}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={<AddOutlinedIcon />}
            sx={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              '&:hover': { backgroundColor: '#c8e6c9' }
            }}
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

export default AddCategory
