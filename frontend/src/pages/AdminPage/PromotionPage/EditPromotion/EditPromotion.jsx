import React, { useEffect, useState } from 'react'
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
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton,
  CircularProgress
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import InventoryIcon from '@mui/icons-material/Inventory'

import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { getPromotionDetailAPI, updatePromotionAPI } from '~/apis/promotionAPIs'
import { fetchAllProductsAPI } from '~/apis/productAPIs'

function EditPromotion({ open, onClose, onSuccess, promotionId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
    productIds: []
  })

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [errors, setErrors] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [openProductModal, setOpenProductModal] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAllProductsAPI()
        const prodList = res.data || []
        setProducts(prodList.map(p => ({ value: p._id, label: p.name })))
      } catch { /* handle error */ }
    }
    if (open) fetchData()
  }, [open])

  useEffect(() => {
    const fetchPromotion = async () => {
      setFetching(true)
      try {
        const promo = await getPromotionDetailAPI(promotionId)
        setFormData({
          title: promo.title || '',
          description: promo.description || '',
          discountPercent: promo.discountPercent?.toString() || '',
          startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
          endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
          productIds: promo.productIds || []
        })
      } catch {
        setSnackbar({ open: true, message: 'Lỗi khi lấy dữ liệu!', severity: 'error' })
      } finally {
        setFetching(false)
      }
    }
    if (open && promotionId) fetchPromotion()
  }, [open, promotionId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      title: formData.title ? '' : 'Vui lòng nhập tên khuyến mãi.',
      discountPercent: /^[0-9]+$/.test(formData.discountPercent) && formData.discountPercent ? '' : 'Giảm giá phải là số.',
      startDate: formData.startDate ? '' : 'Chọn ngày bắt đầu.',
      endDate: formData.endDate ? '' : 'Chọn ngày kết thúc.',
      description: formData.description ? '' : 'Nhập mô tả.'
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const promotionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        discountPercent: parseInt(formData.discountPercent, 10),
        startDate: formData.startDate,
        endDate: formData.endDate,
        productIds: formData.productIds
      }
      await updatePromotionAPI(promotionId, promotionData)
      setSnackbar({ open: true, message: 'Đã cập nhật!', severity: 'success' })
      setTimeout(() => onSuccess(), 500)
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật!', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => p.label.toLowerCase().includes(productSearch.toLowerCase()))

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px', border: '1px solid #333' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Chỉnh sửa khuyến mãi</Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="inherit" /></Box>
          ) : (
            <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 45%' }}>
                <FieldCustom label="Tên khuyến mãi" required name="title" value={formData.title} onChange={handleChange} error={!!errors.title} helperText={errors.title} />
                <FieldCustom label="Giảm giá (%)" required name="discountPercent" value={formData.discountPercent} onChange={handleChange} error={!!errors.discountPercent} helperText={errors.discountPercent} />
                <FieldCustom label="Mô tả" multiline rows={4} name="description" value={formData.description} onChange={handleChange} error={!!errors.description} helperText={errors.description} />
              </Box>
              <Box sx={{ flex: '1 1 45%' }}>
                <FieldCustom label="Ngày bắt đầu" type="date" required name="startDate" value={formData.startDate} onChange={handleChange} error={!!errors.startDate} helperText={errors.startDate} />
                <FieldCustom label="Ngày kết thúc" type="date" required name="endDate" value={formData.endDate} onChange={handleChange} error={!!errors.endDate} helperText={errors.endDate} />
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<InventoryIcon />}
                  onClick={() => setOpenProductModal(true)}
                  sx={{
                    mt: 3, py: 1.5, borderColor: '#555', color: '#aaa', textTransform: 'none',
                    '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  Chọn sản phẩm áp dụng ({formData.productIds.length})
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || fetching}
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { backgroundColor: '#bbdefb' } }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={openProductModal} onClose={() => setOpenProductModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Chọn sản phẩm</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm sản phẩm..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#444' } } }}
          />
          <Stack spacing={1} maxHeight={300} sx={{ overflowY: 'auto' }}>
            {filteredProducts.map((p) => (
              <FormControlLabel
                key={p.value}
                control={
                  <Checkbox
                    checked={formData.productIds.includes(p.value)}
                    onChange={(e) => {
                      const newSelected = e.target.checked ? [...formData.productIds, p.value] : formData.productIds.filter(id => id !== p.value)
                      setFormData(prev => ({ ...prev, productIds: newSelected }))
                    }}
                    sx={{ color: '#555', '&.Mui-checked': { color: '#66FF99' } }}
                  />
                }
                label={p.label}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button variant="contained" onClick={() => setOpenProductModal(false)} sx={{ backgroundColor: '#66FF99', color: 'black', fontWeight: 'bold' }}>Xong</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  )
}

export default EditPromotion
