import React, { useEffect, useState } from 'react'
import {
  Box, Button, Typography, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel,
  Checkbox, Stack, IconButton, CircularProgress, MenuItem,
  Select, FormControl, InputLabel, Chip, Autocomplete
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CloseIcon from '@mui/icons-material/Close'
import InventoryIcon from '@mui/icons-material/Inventory'
import GroupIcon from '@mui/icons-material/Group'

import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { createPromotionAPI } from '~/apis/promotionAPIs'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { searchCustomersAPI } from '~/apis/customerAPIs'

function AddPromotion({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product',
    status: 'active',
    discountType: 'percent',
    discountValue: '',
    startDate: '',
    endDate: '',
    isForever: false,
    productIds: [],
    minOrderValue: 0,
    maxUsageTotal: 0,
    maxUsagePerCustomer: 0,
    condition: {
      type: 'all',
      newCustomerMaxOrders: 1,
      loyalTiers: [],
      specificCustomerIds: []
    }
  })

  const [products, setProducts] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
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
    const search = async () => {
      if (!customerSearch) return
      setCustomerLoading(true)
      try {
        const res = await searchCustomersAPI(customerSearch)
        setCustomerOptions(res || [])
      } catch { /* handle error */ }
      finally { setCustomerLoading(false) }
    }
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [customerSearch])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('condition.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        condition: { ...prev.condition, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const validate = () => {
    const tempErrors = {
      title: formData.title ? '' : 'Vui lòng nhập tên khuyến mãi.',
      discountValue: formData.discountValue > 0 ? '' : 'Giá trị giảm phải lớn hơn 0.',
      startDate: formData.startDate ? '' : 'Chọn ngày bắt đầu.'
    }
    if (!formData.isForever && !formData.endDate) {
      tempErrors.endDate = 'Chọn ngày kết thúc hoặc tích Vĩnh viễn.'
    }
    setErrors(tempErrors)
    return Object.values(tempErrors).every(x => x === '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: parseFloat(formData.minOrderValue || 0),
        maxUsageTotal: parseInt(formData.maxUsageTotal || 0),
        maxUsagePerCustomer: parseInt(formData.maxUsagePerCustomer || 0),
        endDate: formData.isForever ? null : formData.endDate
      }
      await createPromotionAPI(payload)
      setSnackbar({ open: true, message: 'Thêm thành công!', severity: 'success' })
      setTimeout(() => onSuccess(), 500)
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi khi thêm!', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => p.label.toLowerCase().includes(productSearch.toLowerCase()))

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px', border: '1px solid #333' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Thêm khuyến mãi mới</Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Row 1: Basic Info */}
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 2 }}>
                <FieldCustom label="Tên khuyến mãi" required name="title" value={formData.title} onChange={handleChange} error={!!errors.title} helperText={errors.title} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#888' }}>Loại khuyến mãi</InputLabel>
                  <Select name="type" value={formData.type} label="Loại khuyến mãi" onChange={handleChange} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}>
                    <MenuItem value="product">Giảm sản phẩm</MenuItem>
                    <MenuItem value="order">Giảm đơn hàng</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            {/* Row 2: Discount Logic */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#888' }}>Loại giảm</InputLabel>
                  <Select name="discountType" value={formData.discountType} label="Loại giảm" onChange={handleChange} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}>
                    <MenuItem value="percent">Phần trăm (%)</MenuItem>
                    <MenuItem value="fixed">Số tiền cố định (đ)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FieldCustom label="Giá trị giảm" type="number" required name="discountValue" value={formData.discountValue} onChange={handleChange} error={!!errors.discountValue} helperText={errors.discountValue} />
              </Box>
              <Box sx={{ flex: 1.5 }}>
                <FieldCustom label="Mô tả" name="description" value={formData.description} onChange={handleChange} />
              </Box>
            </Stack>

            {/* Row 3: Dates */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <FieldCustom label="Ngày bắt đầu" type="date" required name="startDate" value={formData.startDate} onChange={handleChange} error={!!errors.startDate} helperText={errors.startDate} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FieldCustom label="Ngày kết thúc" type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.isForever} error={!!errors.endDate} helperText={errors.endDate} />
              </Box>
              <Box sx={{ flex: 1, pt: 1 }}>
                <FormControlLabel control={<Checkbox name="isForever" checked={formData.isForever} onChange={handleCheckboxChange} sx={{ color: '#555', '&.Mui-checked': { color: '#66FF99' } }} />} label="Áp dụng vĩnh viễn" />
              </Box>
            </Stack>

            {/* Row 4: Targeting (Products or Order rules) */}
            <Box sx={{ p: 2, borderRadius: '8px', border: '1px dashed #444' }}>
              <Typography variant="overline" color="#888" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>Đối tượng áp dụng</Typography>
              {formData.type === 'product' ? (
                <Button variant="outlined" fullWidth startIcon={<InventoryIcon />} onClick={() => setOpenProductModal(true)} sx={{ py: 1.5, borderColor: '#555', color: '#aaa', textTransform: 'none', '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                  {formData.productIds.includes('ALL') ? 'Tất cả sản phẩm' : `Chọn sản phẩm (${formData.productIds.length})`}
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <FieldCustom label="Giá trị đơn tối thiểu" type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} />
                  <FieldCustom label="Lượt dùng tối đa" type="number" name="maxUsageTotal" value={formData.maxUsageTotal} onChange={handleChange} />
                  <FieldCustom label="Lượt/Khách tối đa" type="number" name="maxUsagePerCustomer" value={formData.maxUsagePerCustomer} onChange={handleChange} />
                </Stack>
              )}
            </Box>

            {/* Row 5: Customer Conditions */}
            <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid #333' }}>
              <Typography variant="overline" color="#888" sx={{ display: 'block', mb: 2, fontWeight: 'bold' }}>Điều kiện khách hàng</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: '#888' }}>Nhóm khách hàng</InputLabel>
                  <Select name="condition.type" value={formData.condition.type} label="Nhóm khách hàng" onChange={handleChange} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}>
                    <MenuItem value="all">Tất cả khách hàng</MenuItem>
                    <MenuItem value="new">Khách hàng mới</MenuItem>
                    <MenuItem value="loyal">Khách hàng thân thiết (Tier)</MenuItem>
                    <MenuItem value="specific">Chỉ định cụ thể</MenuItem>
                  </Select>
                </FormControl>
                
                {formData.condition.type === 'new' && (
                  <Box sx={{ flex: 1 }}>
                    <FieldCustom label="Số đơn tối đa được coi là mới" type="number" name="condition.newCustomerMaxOrders" value={formData.condition.newCustomerMaxOrders} onChange={handleChange} />
                  </Box>
                )}
                
                {formData.condition.type === 'loyal' && (
                  <FormControl sx={{ flex: 2 }}>
                    <InputLabel sx={{ color: '#888' }}>Chọn hạng (Tier)</InputLabel>
                    <Select multiple name="condition.loyalTiers" value={formData.condition.loyalTiers} label="Chọn hạng (Tier)" onChange={handleChange} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }} renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => <Chip key={value} label={value} size="small" sx={{ color: 'white', bgcolor: '#333' }} />)}
                      </Box>
                    )}>
                      <MenuItem value="Silver">Silver</MenuItem>
                      <MenuItem value="Gold">Gold</MenuItem>
                      <MenuItem value="Platinum">Platinum</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Stack>

              {formData.condition.type === 'specific' && (
                <Autocomplete
                  multiple
                  loading={customerLoading}
                  options={customerOptions}
                  getOptionLabel={(option) => `${option.fullName} (${option.email})`}
                  value={formData.condition.specificCustomerIds.map(id => customerOptions.find(o => o._id === id) || { _id: id, fullName: 'Loading...', email: '' })}
                  onChange={(_, newValue) => setFormData(prev => ({ ...prev, condition: { ...prev.condition, specificCustomerIds: newValue.map(v => v._id) } }))}
                  onInputChange={(_, value) => setCustomerSearch(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Tìm & chọn khách hàng..." sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#444' } }, '& .MuiInputLabel-root': { color: '#888' } }} />
                  )}
                  renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => (
                    <Chip label={option.fullName} {...getTagProps({ index })} size="small" sx={{ bgcolor: '#333', color: 'white' }} />
                  ))}
                />
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={<AddOutlinedIcon />} sx={{ backgroundColor: '#66FF99', color: 'black', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { backgroundColor: '#52d17c' } }}>
            {loading ? 'Đang thêm...' : 'Thêm khuyến mãi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={openProductModal} onClose={() => setOpenProductModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
          <Typography fontWeight="bold">Chọn sản phẩm</Typography>
          <FormControlLabel control={<Checkbox checked={formData.productIds.includes('ALL')} onChange={(e) => setFormData(prev => ({ ...prev, productIds: e.target.checked ? ['ALL'] : [] }))} />} label="Tất cả sản phẩm" />
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth placeholder="Tìm sản phẩm..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} disabled={formData.productIds.includes('ALL')} sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#444' } } }} />
          <Stack spacing={1} maxHeight={300} sx={{ overflowY: 'auto' }}>
            {!formData.productIds.includes('ALL') && filteredProducts.map((p) => (
              <FormControlLabel key={p.value} control={<Checkbox checked={formData.productIds.includes(p.value)} onChange={(e) => {
                const newSelected = e.target.checked ? [...formData.productIds, p.value] : formData.productIds.filter(id => id !== p.value)
                setFormData(prev => ({ ...prev, productIds: newSelected }))
              }} sx={{ color: '#555', '&.Mui-checked': { color: '#66FF99' } }} />} label={p.label} />
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

export default AddPromotion
