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
import { useNavigate, useParams } from 'react-router-dom'

import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { getPromotionDetailAPI, updatePromotionAPI } from '~/apis/promotionAPIs'
import { fetchAllProductsAPI } from '~/apis/productAPIs'

function EditPromotion() {
  const navigate = useNavigate()
  const { promotionId } = useParams()

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
  const [errors, setErrors] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [openProductModal, setOpenProductModal] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodData = await fetchAllProductsAPI()
        setProducts(prodData.map(p => ({ value: p._id, label: p.name })))
      } catch {
        //
      }
    }
    fetchData()
  }, [])

  // Fetch promotion detail
  useEffect(() => {
    const fetchPromotion = async () => {
      setLoading(true)
      try {
        const promo = await getPromotionDetailAPI(promotionId)
        setFormData({
          title: promo.title || '',
          description: promo.description || '',
          discountPercent: promo.discountPercent?.toString() || '',
          startDate: promo.startDate || '',
          endDate: promo.endDate || '',
          productIds: promo.productIds || []
        })
      } catch {
        setSnackbar({ open: true, message: 'Không thể lấy thông tin khuyến mãi!', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }
    if (promotionId) fetchPromotion()
  }, [promotionId])

  // Handlers
  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      title: formData.title ? '' : 'Vui lòng nhập tên khuyến mãi.',
      discountPercent: /^[0-9]+$/.test(formData.discountPercent) && formData.discountPercent
        ? '' : 'Giảm giá phải là số và không được để trống.',
      startDate: formData.startDate ? '' : 'Vui lòng chọn ngày bắt đầu.',
      endDate: formData.endDate ? '' : 'Vui lòng chọn ngày kết thúc.',
      description: formData.description ? '' : 'Vui lòng nhập mô tả.'
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }

  const handleSubmit = async e => {
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
        productIds: Array.isArray(formData.productIds) ? formData.productIds : [formData.productIds]
      }
      await updatePromotionAPI(promotionId, promotionData)
      setSnackbar({ open: true, message: 'Khuyến mãi đã được cập nhật!', severity: 'success' })
      setTimeout(() => navigate('/admin/promotion'), 800)
      setErrors({})
    } catch {
      setSnackbar({ open: true, message: 'Có lỗi xảy ra khi cập nhật khuyến mãi!', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.label.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <Box sx={{ backgroundColor: '#343a40', mx: 5, my: 1, borderRadius: 2, overflow: 'auto' }}>
      <Box sx={{ color: 'white', m: '16px 48px 16px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Chỉnh sửa khuyến mãi</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ px: 6 }}>
        <FieldCustom
          label="Tên khuyến mãi" required name="title" value={formData.title}
          onChange={handleChange} error={!!errors.title} helperText={errors.title}
          placeholder="Nhập tên chương trình..."
        />

        <FieldCustom
          label="Phần trăm giảm giá (%)" required name="discountPercent" value={formData.discountPercent}
          onChange={handleChange} error={!!errors.discountPercent} helperText={errors.discountPercent}
          placeholder="VD: 10, 20, 50..."
        />

        <FieldCustom
          label="Ngày bắt đầu" type="date" required name="startDate" value={formData.startDate}
          onChange={handleChange} error={!!errors.startDate} helperText={errors.startDate}
        />

        <FieldCustom
          label="Ngày kết thúc" type="date" required name="endDate" value={formData.endDate}
          onChange={handleChange} error={!!errors.endDate} helperText={errors.endDate}
        />

        <FieldCustom
          label="Mô tả" required multiline rows={3} name="description" value={formData.description}
          onChange={handleChange} error={!!errors.description} helperText={errors.description}
          placeholder="Nhập mô tả chương trình..."
        />

        <Box sx={{ my: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenProductModal(true)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            Chọn sản phẩm áp dụng ({formData.productIds.length})
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="submit" variant="contained" startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <SaveIcon />}
            sx={{ my: 2, gap: 1, textTransform: 'none', fontSize: '18px' }} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Box>
      </Box>

      {/* Modal chọn sản phẩm */}
      <Dialog open={openProductModal} onClose={() => setOpenProductModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Chọn sản phẩm
          <IconButton
            aria-label="close"
            onClick={() => setOpenProductModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            placeholder="Tìm sản phẩm..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack spacing={1} maxHeight={300} sx={{ overflowY: 'auto' }}>
            {filteredProducts.map((product) => (
              <FormControlLabel
                key={product.value}
                control={
                  <Checkbox
                    checked={formData.productIds.includes(product.value)}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...formData.productIds, product.value]
                        : formData.productIds.filter(id => id !== product.value)
                      setFormData(prev => ({ ...prev, productIds: newSelected }))
                    }}
                  />
                }
                label={product.label}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpenProductModal(false)}>Xong</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ mt: '46px' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EditPromotion
