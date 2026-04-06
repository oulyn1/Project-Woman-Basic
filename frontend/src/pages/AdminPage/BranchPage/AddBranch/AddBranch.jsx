// frontend/src/pages/branch/components/AddBranch.jsx
import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Switch, FormControlLabel
} from '@mui/material'
import { createBranch } from '~/apis/branchAPIs'

const empty = {
  name: '',
  address: '',
  provinceCode: '',
  districtCode: '',
  phone: '',
  // ❌ bỏ lat/lng
  services: '',
  openingHours: '',
  isActive: true
}

function AddBranch({ open, onClose, onSuccess, onError }) {
  const [form, setForm] = useState(empty)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    const name = (form.name || '').trim()
    if (!name || name.length < 2) return onError?.('Tên chi nhánh phải có ít nhất 2 ký tự')

    // ✅ chuẩn hóa dữ liệu theo schema backend (không có lat/lng)
    const payload = {
      name,
      phone: (form.phone || '').trim(),
      address: (form.address || '').trim(),
      provinceCode: (form.provinceCode || '').trim(),
      districtCode: (form.districtCode || '').trim(),
      services: form.services
        ? form.services.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      openingHours: (form.openingHours || '').trim(),
      isActive: !!form.isActive
    }

    try {
      setSubmitting(true)
      await createBranch(payload)
      onSuccess?.()
      setForm(empty)
      onClose?.()
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'Tạo chi nhánh thất bại'
      onError?.(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Thêm chi nhánh</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} md={6}>
            <TextField label='Tên chi nhánh' fullWidth size='small'
              value={form.name} onChange={onChange('name')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label='Số điện thoại' fullWidth size='small'
              value={form.phone} onChange={onChange('phone')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Địa chỉ' fullWidth size='small'
              value={form.address} onChange={onChange('address')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label='Tỉnh/TP' fullWidth size='small'
              value={form.provinceCode} onChange={onChange('provinceCode')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label='Quận/Huyện' fullWidth size='small'
              value={form.districtCode} onChange={onChange('districtCode')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Dịch vụ (phân tách dấu phẩy)' fullWidth size='small'
              value={form.services} onChange={onChange('services')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Giờ mở cửa (ví dụ 09:00-21:00)' fullWidth size='small'
              value={form.openingHours} onChange={onChange('openingHours')} />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(_, v) => setForm((f) => ({ ...f, isActive: v }))} />}
              label='Hoạt động'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={submitting}>Lưu</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddBranch
