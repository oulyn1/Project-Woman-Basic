import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { getCategoryDetailAPI, updateCategoryAPI } from '~/apis/categoryAPIs'

function EditCategory({ open, onClose, onSuccess, categoryId }) {
  const [formData, setFormData] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchCategoryData = async () => {
      setFetching(true)
      try {
        const category = await getCategoryDetailAPI(categoryId)
        setFormData({ name: category.name || '' })
      } catch {
        setSnackbar({ open: true, message: 'Lỗi khi lấy dữ liệu danh mục!', severity: 'error' })
      } finally {
        setFetching(false)
      }
    }
    if (open && categoryId) fetchCategoryData()
  }, [open, categoryId])

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = { name: formData.name ? '' : 'Vui lòng nhập tên danh mục.' }
    setErrors(tempErrors)
    return Object.values(tempErrors).every((x) => x === '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      await updateCategoryAPI(categoryId, { name: formData.name.trim() })
      setSnackbar({ open: true, message: 'Danh mục đã cập nhật thành công!', severity: 'success' })
      setTimeout(() => onSuccess(), 500)
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật danh mục!', severity: 'error' })
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
          <Typography variant="h6" fontWeight="bold">Chỉnh sửa danh mục</Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="inherit" /></Box>
          ) : (
            <FieldCustom
              label="Tên danh mục"
              required
              placeholder="Nhập tên danh mục..."
              value={formData.name}
              onChange={handleChange}
              name="name"
              error={!!errors.name}
              helperText={errors.name}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || fetching}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              '&:hover': { backgroundColor: '#bbdefb' }
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu cập nhật'}
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

export default EditCategory
