// src/components/MyOrders/MyOrders.jsx
import React, { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Select, MenuItem, FormControl, InputLabel, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar, Chip,
  Snackbar, Alert, CircularProgress, Stack, IconButton,
  Container, Tooltip,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import CloseIcon from '@mui/icons-material/Close'
import { fetchMyOrdersAPI, searchMyOrdersAPI, updateOrderAPI } from '~/apis/orderAPIs'
import TablePageControls from '~/components/admin/TablePageControls/TablePageControls'
import { addRatingAPI } from '~/apis/ratingAPIs'
const statusColor = (status) => {
  switch (status) {
  case 'pending': return 'warning'
  case 'confirmed': return 'info'
  case 'shipped': return 'secondary'
  case 'delivered': return 'success'
  case 'cancelled': return 'error'
  default: return 'default'
  }
}

// small timeline visual for order status
const OrderStatusTimeline = ({ status }) => {
  const steps = ['pending', 'confirmed', 'shipped', 'delivered']
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
      {steps.map((s, i) => {
        const activeIndex = steps.indexOf(status) >= 0 ? steps.indexOf(status) : -1
        const done = i <= activeIndex
        return (
          <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: done ? (s === 'delivered' ? '#388e3c' : '#1976d2') : '#e0e0e0',
                boxShadow: done ? '0 0 0 4px rgba(25,118,210,0.06)' : 'none'
              }}
            />
            {i < steps.length - 1 && (
              <Box sx={{ width: 40, height: 2, bgcolor: done ? '#1976d2' : '#e0e0e0' }} />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [detailDialog, setDetailDialog] = useState({ open: false, order: null })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, orderId: null, action: '' })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [ratingDialog, setRatingDialog] = useState({ open: false, productId: null, productName: null, image: null })
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = debouncedSearch
          ? await searchMyOrdersAPI(debouncedSearch)
          : await fetchMyOrdersAPI()

        const filtered = filterStatus === 'all'
          ? data
          : data.filter(o => o.status === filterStatus)

        const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setOrders(sorted)
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
        setPage(0)
      }
    }
    fetchData()
  }, [debouncedSearch, filterStatus])

  const paginated = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const AddRatingHandler = async (ratingData) => {
    try {
      await addRatingAPI(ratingData)
      setSnackbar({
        open: true,
        message: 'Đánh giá đã được thêm thành công!',
        severity: 'success'
      })
    } catch (error) {
      const backendMsg = error.response?.data?.message || 'Có lỗi xảy ra khi thêm đánh giá. Vui lòng thử lại!'
      setSnackbar({
        open: true,
        message: backendMsg,
        severity: 'error'
      })
    }
    setRatingDialog({ open: false, productId: null })
    setRatingValue(0)
    setHoverRating(0)
    setRatingComment('')
  }
  const handleViewDetail = (order) => {
    setDetailDialog({ open: true, order })
  }

  // Customer cancel order (only when pending)
  const handleCancelOrder = async (orderId) => {
    setConfirmDialog({ open: true, orderId, action: 'cancel' })
  }

  // placeholder pay again (you integrate payment gateway here)
  const handlePayAgain = async (orderId) => {
    setConfirmDialog({ open: true, orderId, action: 'pay' })
  }

  const performAction = async () => {
    const { orderId, action } = confirmDialog
    if (!orderId) return
    try {
      if (action === 'cancel') {
        const updated = await updateOrderAPI(orderId, { status: 'cancelled' })
        setOrders(prev =>
          prev.map(o => o._id === orderId
            ? { ...o, status: updated.status }
            : o
          )
        )
        setSnackbar({ open: true, message: 'Đã hủy đơn hàng', severity: 'success' })
      }
      else if (action === 'pay') {
        // placeholder: ideally call payment API then update order paymentStatus
        // mock: update paymentStatus to 'paid'
        const updated = await updateOrderAPI(orderId, { paymentStatus: 'paid' })
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o))
        setSnackbar({ open: true, message: 'Thanh toán (giả lập) thành công', severity: 'success' })
      }
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' })
    } finally {
      setConfirmDialog({ open: false, orderId: null, action: '' })
    }
  }

  const handleCloseSnackbar = () => setSnackbar(s => ({ ...s, open: false }))

  return (
    <Container sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <TextField
          variant="outlined"
          placeholder="Tìm kiếm theo mã đơn / tên / email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 360 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="filter-status-label">Lọc trạng thái</InputLabel>
          <Select
            labelId="filter-status-label"
            value={filterStatus}
            label="Lọc trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel id="rows-label">Số hàng</InputLabel>
          <Select
            labelId="rows-label"
            value={rowsPerPage}
            label="Số hàng"
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setPage(0)
            }}
          >
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={24}>24</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography variant="h6" color="text.secondary">Chưa có đơn hàng.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginated.map((o) => (
              <Grid key={o._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minWidth: '534px' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Mã đơn</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{o._id}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {new Date(o.createdAt).toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Chip label={o.status} color={statusColor(o.status)} size="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, color: '#cc3300' }}>
                          {Number(o.total).toLocaleString('vi-VN')}₫
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                      {/* show up to 3 product images as preview */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {o.items?.slice(0, 3).map((it, idx) => (
                          <Avatar
                            key={idx}
                            src={it.product?.image || ''}
                            variant="rounded"
                            sx={{ width: 64, height: 64 }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {o.items?.length} sản phẩm • Người nhận: {o.buyerInfo?.name}
                        </Typography>

                        <OrderStatusTimeline status={o.status} />
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', pr: 2, pb: 2 }}>
                    <Button size="small" onClick={() => handleViewDetail(o)}>Xem chi tiết</Button>
                    {o.status === 'pending' && (
                      <Button size="small" color="error" onClick={() => handleCancelOrder(o._id)}>
                        Hủy đơn
                      </Button>
                    )}

                    {o.paymentStatus === 'unpaid' && (
                      <Button size="small" variant="contained" onClick={() => handlePayAgain(o._id)}>
                        Thanh toán
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <TablePageControls
              page={page}
              rowsPerPage={rowsPerPage}
              count={orders.length}
              onChangePage={(_, newPage) => setPage(newPage)}
            />
          </Box>
        </>
      )}

      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, order: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chi tiết đơn hàng
          <IconButton size="small" onClick={() => setDetailDialog({ open: false, order: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailDialog.order && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Mã đơn</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{detailDialog.order._id}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(detailDialog.order.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Sản phẩm</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {detailDialog.order.items.map((it, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar src={it.product?.image} variant="rounded" sx={{ width: 56, height: 56 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography>{it.product?.name || it.productId}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {it.quantity} x {Number(it.price).toLocaleString('vi-VN')}₫
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700 }}>{(it.quantity * it.price).toLocaleString('vi-VN')}₫</Typography>
                      {detailDialog.order.status === 'confirmed' && (
                        <Tooltip title="Đánh giá sản phẩm này">
                          <IconButton
                            onClick={() => setRatingDialog({ open: true, productId: it.productId, productName: it.product?.name, image: it.product?.image })}
                            sx={{ ml: 1, p: 0, bgcolor: 'transparent' }}
                          >
                            <StarIcon sx={{ color: 'gray', '&:hover': { color: 'gold' } }} fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Người nhận</Typography>
                <Typography>{detailDialog.order.buyerInfo?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{detailDialog.order.buyerInfo?.phone}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{detailDialog.order.buyerInfo?.address}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Tổng tiền</Typography>
                <Typography variant="h6" sx={{ color: '#cc3300' }}>{Number(detailDialog.order.total).toLocaleString('vi-VN')}₫</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, order: null })}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, orderId: null, action: '' })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'cancel' ? 'Bạn có chắc chắn muốn hủy đơn này?' : 'Tiếp tục thanh toán?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, orderId: null, action: '' })}>Hủy</Button>
          <Button variant="contained" onClick={performAction}>Xác nhận</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={ratingDialog.open}
        onClose={() => {
          setRatingDialog({ open: false, productId: null })
          setRatingValue(0)
          setHoverRating(0)
          setRatingComment('')
        }}
      >
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <IconButton
                key={i}
                onClick={() => setRatingValue(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                sx={{ color: i <= (hoverRating || ratingValue) ? 'gold' : 'gray' }}
              >
                <StarIcon />
              </IconButton>
            ))}
          </Box>
          <TextField
            multiline
            fullWidth
            required
            rows={3}
            name="des"
            placeholder="Viết nhận xét của bạn..."
            sx={{ mt: 2 }}
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRatingDialog({ open: false, productId: null })
              setRatingValue(0)
              setHoverRating(0)
              setRatingComment('')
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (ratingValue === 0) {
                setSnackbar({ open: true, message: 'Vui lòng chọn số sao để đánh giá', severity: 'error' })
                return
              }
              if (!ratingComment.trim()) {
                setSnackbar({ open: true, message: 'Vui lòng viết nhận xét của bạn', severity: 'error' })
                return
              }
              // Gửi ratingValue + ratingComment cho backend
              const ratingData = {
                productId: ratingDialog.productId,
                productName: ratingDialog.productName,
                image: ratingDialog.image,
                star: ratingValue,
                description: ratingComment
              }
              AddRatingHandler(ratingData)
            }}
          >
            Gửi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyOrders
