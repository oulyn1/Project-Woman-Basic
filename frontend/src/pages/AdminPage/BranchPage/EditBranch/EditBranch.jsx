import React, { useEffect, useState, useCallback } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, Switch, FormControlLabel
} from '@mui/material'
import { getBranchById, updateBranch } from '~/apis/branchAPIs.js'

function EditBranch({ id, open, onClose, onSuccess, onError }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    try {
      // getBranchById nên trả thẳng data; nếu không, vẫn fallback .data
      const res = await getBranchById(id)
      const d = (res && res.data) ? res.data : (res || {})
      setForm({
        name: d.name || '',
        phone: d.phone || '',
        address: d.address || '',
        provinceCode: d.provinceCode || '',
        districtCode: d.districtCode || '',
        // ❌ bỏ lat/lng
        services: (d.services || []).join(', '),
        openingHours: d.openingHours || '',
        isActive: d.isActive ?? true
      })
    } catch (e) {
      onError?.(e?.data?.message || e?.message || 'Không tải được chi tiết')
      onClose?.()
    }
  }, [id, onClose, onError])

  useEffect(() => {
    if (open && id) fetchDetail()
  }, [open, id, fetchDetail])

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    const name = (form.name || '').trim()
    if (!name || name.length < 2) return onError?.('Tên chi nhánh phải có ít nhất 2 ký tự')
    try {
      setSaving(true)
      const payload = {
        name,
        phone: (form.phone || '').trim(),
        address: (form.address || '').trim(),
        provinceCode: (form.provinceCode || '').trim(),
        districtCode: (form.districtCode || '').trim(),
        services: form.services
          ? form.services.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        openingHours: (form.openingHours || '').trim(),
        isActive: !!form.isActive
      }
      await updateBranch(id, payload)
      onSuccess?.()
      onClose?.()
    } catch (e) {
      onError?.(e?.data?.message || e?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (!form) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Sửa chi nhánh</DialogTitle>
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
            <TextField label='Tỉnh/TP (code)' fullWidth size='small'
              value={form.provinceCode} onChange={onChange('provinceCode')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label='Quận/Huyện (code)' fullWidth size='small'
              value={form.districtCode} onChange={onChange('districtCode')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Giờ mở cửa (vd: 09:00-21:00)' fullWidth size='small'
              value={form.openingHours} onChange={onChange('openingHours')} />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(_, v) => setForm((f) => ({ ...f, isActive: v }))}
                />
              }
              label='Hoạt động'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant='contained' onClick={handleSave} disabled={saving}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditBranch
