import React, { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { getCustomerSummaryAPI, getCustomerOrdersAPI } from '~/apis/customerAPIs'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

export default function CustomerDetail() {
  const { id } = useParams()
  const token = localStorage.getItem('accessToken')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ totalOrders: 0, totalAmount: 0, tier: 'Standard' })
  const [orders, setOrders] = useState([])
  const [openDetail, setOpenDetail] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const [summary, ordersRes] = await Promise.all([
          getCustomerSummaryAPI(id, token),
          getCustomerOrdersAPI(id, token)
        ])
        setUser(summary.user)
        setStats(summary.stats)
        setOrders(Array.isArray(ordersRes) ? ordersRes : [])
      } catch {
        setError('Không thể tải thông tin khách hàng / đơn hàng.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const openOrderDialog = (order) => {
    setCurrentOrder(order)
    setOpenDetail(true)
  }
  const closeOrderDialog = () => setOpenDetail(false)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
  if (error) return <Box sx={{ px: 6, py: 3 }}><Alert severity='error'>{error}</Alert></Box>

  const commonProps = {
    fullWidth: true,
    InputLabelProps: { shrink: true },
    InputProps: { readOnly: true },
    sx: { mb: 2 }
  }

  return (
    <Box sx={{ backgroundColor: '#343a40', mx: 5, my: 1, borderRadius: '8px', color: 'white' }}>
      <Box sx={{ m: '16px 48px 16px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Thông tin khách hàng</Typography>
      </Box>

      <Box sx={{ px: 6 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <FieldCustom label="Họ và tên" name="name" value={user?.fullName || user?.name || ''} {...commonProps} />
            <FieldCustom label="Email" name="email" required value={user?.email || ''} {...commonProps} />
            <FieldCustom label="Số điện thoại" name="phone" value={user?.phone || ''} {...commonProps} />
            <FieldCustom label="Địa chỉ" name="address" value={user?.address || ''} multiline rows={2} {...commonProps} />
            <FieldCustom label="Vai trò" name="role" value={user?.role || 'customer'} {...commonProps} />
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ px: 6, pt: 2 }}>
        <Card sx={{ borderRadius: 2, mb: 2 }}>
          <CardContent sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Tổng số đơn hàng</Typography>
              <Typography variant="h5">{stats.totalOrders}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Tổng giá trị đơn hàng</Typography>
              <Typography variant="h5">{formatVND(stats.totalAmount)}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Hạng thẻ khách hàng</Typography>
              <Typography variant="h5">{stats.tier}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ px: 6, pb: 4 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Đơn hàng của khách</Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>STT</TableCell>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((o, idx) => (
                    <TableRow key={o._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{o.code || o._id}</TableCell>
                      <TableCell>{o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</TableCell>
                      <TableCell>
                        <Box sx={{
                          display:'inline-block', px:1, py:0.25, borderRadius:1,
                          backgroundColor: o.status === 'confirmed' || o.status === 'paid' ? '#e8f5e8' : '#fff3e0',
                          color: o.status === 'confirmed' || o.status === 'paid' ? '#2e7d32' : '#e65100',
                          fontSize:'0.75rem', fontWeight:600
                        }}>
                          {o.status || '—'}
                        </Box>
                      </TableCell>
                      <TableCell>{formatVND(o.total)}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() => openOrderDialog(o)}
                          sx={{ textTransform:'none' }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Chưa có đơn hàng</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={openDetail} onClose={closeOrderDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent dividers>
          {currentOrder ? (
            <>
              <Typography sx={{ mb: 1 }} variant="body2" color="text.secondary">
                Mã đơn: <b>{currentOrder.code || currentOrder._id}</b>
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(currentOrder.items || []).map((it, i) => {
                    const name = it.name || it.productName || it.title || it.product?.name || '—'
                    const sku = it.sku || it.product?.sku
                    const quantity = it.quantity || it.qty || 1
                    const price = it.price || it.unitPrice || it.total || 0
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2">{name}</Typography>
                            {sku && <Typography variant="caption" color="text.secondary">{sku}</Typography>}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{quantity}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                          {formatVND(price)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Tổng tiền:</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>
                      {formatVND(currentOrder.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          ) : (
            <Typography>Không có dữ liệu.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeOrderDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
