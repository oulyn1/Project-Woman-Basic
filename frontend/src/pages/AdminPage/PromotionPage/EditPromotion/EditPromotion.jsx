import React, { useEffect, useState } from 'react'
import {
  Box, Button, Typography, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel,
  Checkbox, Stack, IconButton, CircularProgress, MenuItem, Chip, Autocomplete
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import InventoryIcon from '@mui/icons-material/Inventory'

import { getPromotionDetailAPI, updatePromotionAPI } from '~/apis/promotionAPIs'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { searchCustomersAPI, fetchCustomersAPI } from '~/apis/customerAPIs'

// ── Unified dark TextField style ──────────────────────────────────────────────
const darkField = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: '#444' },
    '&:hover fieldset': { borderColor: '#666' },
    '&.Mui-focused fieldset': { borderColor: '#66FF99' },
    '&.Mui-disabled': {
      '& fieldset': { borderColor: '#333' },
      '& input': { WebkitTextFillColor: 'rgba(255,255,255,0.5) !important' },
      '& textarea': { WebkitTextFillColor: 'rgba(255,255,255,0.5) !important' }
    },
    '& .MuiSelect-select.Mui-disabled': {
      WebkitTextFillColor: 'rgba(255,255,255,0.5) !important'
    }
  },
  '& .MuiInputLabel-root': { color: '#888' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#66FF99' },
  '& .MuiInputLabel-root.Mui-disabled': { color: '#555' },
  '& .MuiSelect-icon': { color: '#888' },
  '& input[type="date"]::-webkit-calendar-picker-indicator': { filter: 'invert(0.5)' }
}

function F({ sxExtra, ...props }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      InputLabelProps={props.type === 'date' ? { shrink: true } : undefined}
      sx={{ ...darkField, ...sxExtra }}
      {...props}
    />
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
function EditPromotion({ open, onClose, onSuccess, promotionId }) {
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
    minOrderValue: '',
    maxUsageTotal: '',
    maxUsagePerCustomer: '',
    condition: {
      type: 'all',
      newCustomerMaxOrders: 1,
      loyalTiers: [],
      specificCustomerIds: []
    }
  })

  const [computedStatus, setComputedStatus] = useState('inactive')
  const [products, setProducts] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [openProductModal, setOpenProductModal] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    if (!open) return
    fetchAllProductsAPI()
      .then(res => setProducts((res.data || []).map(p => ({ value: p._id, label: p.name }))))
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open || !promotionId) return
    setFetching(true)
    getPromotionDetailAPI(promotionId)
      .then(promo => {
        setComputedStatus(promo.computedStatus)
        setFormData({
          title: promo.title || '',
          description: promo.description || '',
          type: promo.type || 'product',
          status: promo.status || 'active',
          discountType: promo.discountType || 'percent',
          discountValue: promo.discountValue || '',
          startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
          endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
          isForever: promo.isForever || false,
          productIds: promo.productIds || [],
          minOrderValue: promo.minOrderValue || '',
          maxUsageTotal: promo.maxUsageTotal || '',
          maxUsagePerCustomer: promo.maxUsagePerCustomer || '',
          condition: {
            type: promo.condition?.type || 'all',
            newCustomerMaxOrders: promo.condition?.newCustomerMaxOrders || 1,
            loyalTiers: promo.condition?.loyalTiers || [],
            specificCustomerIds: promo.condition?.specificCustomerIds?.map(c => typeof c === 'object' ? c._id : c) || []
          }
        })
        if (promo.condition?.specificCustomerIds) {
          setCustomerOptions(promo.condition.specificCustomerIds.map(c =>
            typeof c === 'object' ? c : { _id: c, fullName: 'Loading...', email: '' }
          ))
        }
      })
      .catch(() => setSnackbar({ open: true, message: 'Lỗi khi lấy dữ liệu!', severity: 'error' }))
      .finally(() => setFetching(false))
  }, [open, promotionId])

  useEffect(() => {
    if (formData.condition.type === 'specific' && customerOptions.length <= 1) { // <=1 because it might have the current loaded ones
      const token = localStorage.getItem('accessToken')
      setCustomerLoading(true)
      fetchCustomersAPI(token)
        .then(res => setCustomerOptions(prev => {
          const combined = [...prev, ...(res || [])]
          return combined.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
        }))
        .catch(() => {})
        .finally(() => setCustomerLoading(false))
    }
  }, [formData.condition.type])

  useEffect(() => {
    const t = setTimeout(() => {
      const token = localStorage.getItem('accessToken')
      setCustomerLoading(true)
      if (!customerSearch.trim()) {
        fetchCustomersAPI(token)
          .then(res => setCustomerOptions(prev => {
            const combined = [...prev, ...(res || [])]
            return combined.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
          }))
          .catch(() => {})
          .finally(() => setCustomerLoading(false))
      } else {
        searchCustomersAPI(customerSearch, token)
          .then(res => setCustomerOptions(prev => {
            const combined = [...prev, ...(res || [])]
            return combined.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
          }))
          .catch(() => {})
          .finally(() => setCustomerLoading(false))
      }
    }, 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  const set = (name, value) => {
    if (name.startsWith('condition.')) {
      const key = name.split('.')[1]
      setFormData(p => ({ ...p, condition: { ...p.condition, [key]: value } }))
    } else {
      setFormData(p => ({ ...p, [name]: value }))
    }
    setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleChange = e => set(e.target.name, e.target.value)
  const handleCheck = e => setFormData(p => ({ ...p, [e.target.name]: e.target.checked }))

  const isFieldDisabled = (fieldName) => {
    if (computedStatus === 'ended') return true
    if (computedStatus === 'active' || computedStatus === 'scheduled') {
      return !['status', 'endDate', 'isForever', 'description'].includes(fieldName)
    }
    return false
  }

  const validate = () => {
    const e = {
      title:         formData.title ? '' : 'Vui lòng nhập tên khuyến mãi.',
      discountValue: formData.discountValue > 0 ? '' : 'Giá trị giảm phải lớn hơn 0.',
      startDate:     formData.startDate ? '' : 'Chọn ngày bắt đầu.',
      ...(!formData.isForever && !formData.endDate
        ? { endDate: 'Chọn ngày kết thúc hoặc tích Vĩnh viễn.' }
        : {})
    }
    setErrors(e)
    return Object.values(e).every(x => !x)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = (computedStatus === 'active' || computedStatus === 'scheduled')
        ? { status: formData.status, endDate: formData.isForever ? null : formData.endDate, isForever: formData.isForever, description: formData.description }
        : { ...formData, discountValue: parseFloat(formData.discountValue), minOrderValue: parseFloat(formData.minOrderValue || 0), maxUsageTotal: parseInt(formData.maxUsageTotal || 0), maxUsagePerCustomer: parseInt(formData.maxUsagePerCustomer || 0), endDate: formData.isForever ? null : formData.endDate }

      await updatePromotionAPI(promotionId, payload)
      setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' })
      setTimeout(() => onSuccess(), 500)
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi khi cập nhật!', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.label.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <>
      <Dialog
        open={open} onClose={onClose} fullWidth maxWidth="md"
        PaperProps={{ sx: { bgcolor: '#1a1a1a', color: 'white', borderRadius: '12px', border: '1px solid #333' } }}
      >
        {/* Header */}
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography component="div" variant="h6" fontWeight="bold">Chỉnh sửa khuyến mãi</Typography>
            <Chip
              label={computedStatus.toUpperCase()} size="small"
              color={computedStatus === 'active' ? 'success' : computedStatus === 'ended' ? 'error' : 'default'}
              sx={{ height: 20, fontSize: '10px' }}
            />
          </Stack>
          <IconButton onClick={onClose} sx={{ color: '#888' }}><CloseIcon /></IconButton>
        </DialogTitle>

        {/* Body */}
        <DialogContent sx={{ p: 3, '&.MuiDialogContent-root': { paddingTop: '32px' } }}>
          {fetching
            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="inherit" /></Box>
            : (
              <Stack spacing={3}>

                {/* Row 1: Tên + Trạng thái */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 2 }}>
                    <F
                      label="Tên khuyến mãi *"
                      name="title" value={formData.title} onChange={handleChange}
                      disabled={isFieldDisabled('title')}
                      error={!!errors.title} helperText={errors.title}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <F
                      select label="Trạng thái"
                      name="status" value={formData.status} onChange={handleChange}
                      disabled={computedStatus === 'ended'}
                    >
                      <MenuItem value="active">Kích hoạt</MenuItem>
                      <MenuItem value="inactive">Tạm ngưng</MenuItem>
                    </F>
                  </Box>
                </Stack>

                {/* Row 2: Loại KM + Loại giảm + Giá trị giảm */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <F
                    select label="Loại khuyến mãi"
                    name="type" value={formData.type} onChange={handleChange}
                    disabled={isFieldDisabled('type')}
                  >
                    <MenuItem value="product">Giảm sản phẩm</MenuItem>
                    <MenuItem value="order">Giảm đơn hàng</MenuItem>
                  </F>
                  <F
                    select label="Loại giảm"
                    name="discountType" value={formData.discountType} onChange={handleChange}
                    disabled={isFieldDisabled('discountType')}
                  >
                    <MenuItem value="percent">Phần trăm (%)</MenuItem>
                    <MenuItem value="fixed">Số tiền cố định (đ)</MenuItem>
                  </F>
                  <F
                    label="Giá trị giảm *" type="number"
                    name="discountValue" value={formData.discountValue} onChange={handleChange}
                    disabled={isFieldDisabled('discountValue')}
                    error={!!errors.discountValue} helperText={errors.discountValue}
                  />
                </Stack>

                {/* Row 3: Mô tả */}
                <F
                  label="Mô tả"
                  name="description" value={formData.description} onChange={handleChange}
                  disabled={computedStatus === 'ended'}
                />

                {/* Row 4: Ngày bắt đầu + Ngày kết thúc + Checkbox */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <F
                      label="Ngày bắt đầu *" type="date"
                      name="startDate" value={formData.startDate} onChange={handleChange}
                      disabled={isFieldDisabled('startDate')}
                      error={!!errors.startDate} helperText={errors.startDate}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <F
                      label="Ngày kết thúc" type="date"
                      name="endDate" value={formData.endDate} onChange={handleChange}
                      disabled={formData.isForever || computedStatus === 'ended'}
                      error={!!errors.endDate} helperText={errors.endDate}
                    />
                  </Box>
                  <Box sx={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isForever" checked={formData.isForever} onChange={handleCheck}
                          disabled={computedStatus === 'ended'}
                          sx={{ color: '#555', '&.Mui-checked': { color: '#66FF99' } }}
                        />
                      }
                      label={<Typography variant="body2" color="#ccc">Áp dụng vĩnh viễn</Typography>}
                    />
                  </Box>
                </Stack>

                {/* Row 5: Đối tượng áp dụng */}
                <Box sx={{ p: 2.5, borderRadius: '8px', border: '1px dashed #444' }}>
                  <Typography variant="overline" color="#888" sx={{ display: 'block', mb: 1.5, fontWeight: 'bold' }}>
                    Đối tượng áp dụng
                  </Typography>
                  {formData.type === 'product' ? (
                    <Button
                      variant="outlined" fullWidth startIcon={<InventoryIcon />}
                      onClick={() => setOpenProductModal(true)}
                      disabled={isFieldDisabled('productIds')}
                      sx={{ height: 40, borderColor: '#555', color: '#aaa', textTransform: 'none', '&:hover': { borderColor: '#888', bgcolor: 'rgba(255,255,255,0.04)' }, '&.Mui-disabled': { borderColor: '#333', color: 'rgba(255,255,255,0.4)' } }}
                    >
                      {formData.productIds.includes('ALL') ? 'Tất cả sản phẩm' : `Chọn sản phẩm (${formData.productIds.length})`}
                    </Button>
                  ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <F label="Giá trị đơn tối thiểu" type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} disabled={isFieldDisabled('minOrderValue')} />
                      <F label="Lượt dùng tối đa" type="number" name="maxUsageTotal" value={formData.maxUsageTotal} onChange={handleChange} disabled={isFieldDisabled('maxUsageTotal')} />
                      <F label="Lượt/Khách tối đa" type="number" name="maxUsagePerCustomer" value={formData.maxUsagePerCustomer} onChange={handleChange} disabled={isFieldDisabled('maxUsagePerCustomer')} />
                    </Stack>
                  )}
                </Box>

                {/* Row 6: Điều kiện khách hàng */}
                <Box sx={{ p: 2.5, borderRadius: '8px', border: '1px solid #333' }}>
                  <Typography variant="overline" color="#888" sx={{ display: 'block', mb: 1.5, fontWeight: 'bold' }}>
                    Điều kiện khách hàng
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <F
                      select label="Nhóm khách hàng"
                      name="condition.type" value={formData.condition.type} onChange={handleChange}
                      disabled={isFieldDisabled('condition.type')}
                    >
                      <MenuItem value="all">Tất cả khách hàng</MenuItem>
                      <MenuItem value="new">Khách hàng mới</MenuItem>
                      <MenuItem value="loyal">Khách hàng thân thiết (Tier)</MenuItem>
                      <MenuItem value="specific">Chỉ định cụ thể</MenuItem>
                    </F>

                    {formData.condition.type === 'new' && (
                      <F
                        label="Số đơn tối đa (coi là khách mới)" type="number"
                        name="condition.newCustomerMaxOrders"
                        value={formData.condition.newCustomerMaxOrders}
                        onChange={handleChange}
                        disabled={isFieldDisabled('condition.newCustomerMaxOrders')}
                      />
                    )}

                    {formData.condition.type === 'loyal' && (
                      <F
                        select label="Chọn hạng (Tier)"
                        name="condition.loyalTiers" value={formData.condition.loyalTiers} onChange={handleChange}
                        disabled={isFieldDisabled('condition.loyalTiers')}
                        SelectProps={{
                          multiple: true,
                          renderValue: selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map(v => <Chip key={v} label={v} size="small" sx={{ color: 'white', bgcolor: '#333' }} />)}
                            </Box>
                          )
                        }}
                      >
                        <MenuItem value="Silver">Silver</MenuItem>
                        <MenuItem value="Gold">Gold</MenuItem>
                        <MenuItem value="Platinum">Platinum</MenuItem>
                      </F>
                    )}
                  </Stack>

                  {formData.condition.type === 'specific' && (
                    <Box sx={{ mt: 2 }}>
                      <Autocomplete
                        multiple
                        key="customer-select-edit-autocomplete"
                        openOnFocus
                        disabled={isFieldDisabled('condition.specificCustomerIds')}
                        loading={customerLoading}
                        options={customerOptions}
                        filterOptions={(x) => x}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        getOptionLabel={o => o.fullName ? `${o.fullName} (${o.email || ''})` : ''}
                        value={formData.condition.specificCustomerIds.map(
                          id => customerOptions.find(o => o._id === id) || { _id: id, fullName: id, email: '' }
                        )}
                        onChange={(_, v) => {
                          set('condition.specificCustomerIds', v.map(x => x._id))
                          setCustomerSearch('')
                        }}
                        inputValue={customerSearch}
                        onInputChange={(event, newInputValue, reason) => {
                          if (reason !== 'reset') {
                            setCustomerSearch(newInputValue)
                          }
                        }}
                        loadingText={<Typography variant="body2" sx={{ color: '#888' }}>Đang tìm...</Typography>}
                        ListboxProps={{
                          sx: {
                            maxHeight: '250px',
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: '10px' }
                          }
                        }}
                        renderOption={(props, option) => {
                          const { key, ...restProps } = props
                          return (
                            <Box
                              component="li"
                              key={option._id}
                              {...restProps}
                              sx={{
                                color: 'black !important',
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              <Stack>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{option.fullName}</Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>{option.email}</Typography>
                              </Stack>
                            </Box>
                          )
                        }}
                        PopperProps={{
                          sx: {
                            '& .MuiPaper-root': {
                              bgcolor: 'white !important',
                              color: 'black !important',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.2) !important'
                            }
                          }
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Tìm & chọn khách hàng..."
                            size="small"
                            sx={{
                              ...darkField,
                              '& input': {
                                color: 'white !important',
                                WebkitTextFillColor: 'white !important'
                              }
                            }}
                          />
                        )}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((o, i) => (
                            <Chip
                              key={o._id}
                              label={o.fullName || o._id}
                              {...getTagProps({ index: i })}
                              size="small"
                              sx={{ bgcolor: '#333', color: 'white', fontWeight: 'bold' }}
                            />
                          ))
                        }
                      />
                    </Box>
                  )}
                </Box>

              </Stack>
            )}
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={handleSubmit} variant="contained"
            disabled={loading || fetching || computedStatus === 'ended'}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            sx={{ bgcolor: '#66FF99', color: 'black', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { bgcolor: '#52d17c' } }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={openProductModal} onClose={() => setOpenProductModal(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#1a1a1a', color: 'white' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight="bold">Chọn sản phẩm</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.productIds.includes('ALL')}
                disabled={computedStatus !== 'inactive'}
                onChange={e => setFormData(p => ({ ...p, productIds: e.target.checked ? ['ALL'] : [] }))}
                sx={{ color: '#555', '&.Mui-checked': { color: '#66FF99' } }}
              />
            }
            label="Tất cả sản phẩm"
          />
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth size="small" placeholder="Tìm sản phẩm..."
            value={productSearch} onChange={e => setProductSearch(e.target.value)}
            disabled={formData.productIds.includes('ALL') || computedStatus !== 'inactive'}
            sx={{ mb: 2, ...darkField }}
          />
          <Stack spacing={0.5} maxHeight={300} sx={{ overflowY: 'auto' }}>
            {!formData.productIds.includes('ALL') && filteredProducts.map(p => (
              <FormControlLabel
                key={p.value}
                control={
                  <Checkbox
                    checked={formData.productIds.includes(p.value)}
                    disabled={computedStatus !== 'inactive'}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      productIds: e.target.checked
                        ? [...prev.productIds, p.value]
                        : prev.productIds.filter(id => id !== p.value)
                    }))}
                    sx={{ color: '#555', '&.Mui-checked': { color: '#66FF99' } }}
                  />
                }
                label={p.label}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button variant="contained" onClick={() => setOpenProductModal(false)}
            sx={{ bgcolor: '#66FF99', color: 'black', fontWeight: 'bold' }}>Xong</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default EditPromotion