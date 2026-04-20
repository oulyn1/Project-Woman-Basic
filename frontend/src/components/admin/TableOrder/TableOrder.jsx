import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  Collapse,
  Avatar,
  Divider,
  IconButton
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PersonIcon from '@mui/icons-material/Person'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'

import {
  fetchAllOrdersAPI,
  updateOrderAPI,
  searchOrdersAPI,
  confirmOrderAPI
} from '~/apis/orderAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const TableOrder = ({ searchQuery }) => {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, orderId: null, action: '' })

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const data = searchQuery
          ? await searchOrdersAPI(searchQuery)
          : await fetchAllOrdersAPI()
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setOrders(sortedData)
      } catch {
        setOrders([])
        setSnackbar({ open: true, message: 'Lỗi khi tải đơn hàng!', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [searchQuery])

  const handleAction = (event, orderId, action) => {
    event.stopPropagation()
    setConfirmDialog({ open: true, orderId, action })
  }

  const handleConfirmAction = async () => {
    try {
      const { orderId, action } = confirmDialog
      let updatedOrder = null
      if (action === 'confirm') updatedOrder = await confirmOrderAPI(orderId)
      else if (action === 'cancel') updatedOrder = await updateOrderAPI(orderId, { status: 'cancelled' })
      
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o))
      setSnackbar({ open: true, message: `Thành công!`, severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi!', severity: 'error' })
    } finally {
      setConfirmDialog({ open: false, orderId: null, action: '' })
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { bg: 'rgba(251, 192, 45, 0.1)', color: '#fbc02d' }
      case 'confirmed': return { bg: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }
      case 'shipped': return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }
      case 'delivered': return { bg: 'rgba(56, 142, 60, 0.1)', color: '#388e3c' }
      case 'cancelled': return { bg: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }
      default: return { bg: 'rgba(117, 117, 117, 0.1)', color: '#757575' }
    }
  }

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id)

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => {
          const statusStyle = getStatusStyle(order.status)
          return (
            <Box
              key={order._id}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {/* Order Header */}
              <Box sx={{ p: 2.5, cursor: 'pointer' }} onClick={() => toggleExpand(order._id)}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888' }}><ReceiptLongIcon /></Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="#888">#{order._id.slice(-8).toUpperCase()}</Typography>
                    <Typography variant="body1" fontWeight="bold" color="white">{order.buyerInfo?.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="bold" color="#fff">{order.total.toLocaleString('vi-VN')}₫</Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        mt: 0.5
                      }}
                    >
                      {order.status}
                    </Box>
                  </Box>
                  {expandedId === order._id ? <ExpandLessIcon sx={{ color: '#555' }} /> : <ExpandMoreIcon sx={{ color: '#555' }} />}
                </Stack>
              </Box>

              {/* Order Details (Expandable) */}
              <Collapse in={expandedId === order._id}>
                <Box sx={{ p: 3, pt: 0, backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ flex: 1.5 }}>
                      <Typography variant="overline" color="#555" fontWeight="bold">Sản phẩm đã đặt</Typography>
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        {order.items.map((item, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="#aaa">{item.product?.name || 'N/A'} x{item.quantity}</Typography>
                            <Typography variant="body2" color="#fff">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" color="#555" fontWeight="bold">Thông tin giao hàng</Typography>
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <LocalShippingIcon sx={{ color: '#888', fontSize: 18 }} />
                          <Typography variant="body2" color="#aaa">{order.buyerInfo?.address || 'Chưa cập nhật'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CalendarTodayIcon sx={{ color: '#888', fontSize: 18 }} />
                          <Typography variant="body2" color="#aaa">{new Date(order.createdAt).toLocaleString('vi-VN')}</Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={(e) => handleAction(e, order._id, 'confirm')}
                            sx={{
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              color: '#4caf50',
                              textTransform: 'none',
                              '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                            }}
                          >
                            Xác nhận
                          </Button>
                          <Button
                            variant="outlined"
                            fullWidth
                            color="error"
                            startIcon={<CancelOutlinedIcon />}
                            onClick={(e) => handleAction(e, order._id, 'cancel')}
                            sx={{ textTransform: 'none' }}
                          >
                            Hủy đơn
                          </Button>
                        </>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          )
        })}
      </Stack>

      <TablePageControls page={page} rowsPerPage={rowsPerPage} count={orders.length} onChangePage={(_, p) => setPage(p)} />

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, orderId: null, action: '' })}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận hành động</DialogTitle>
        <DialogContent sx={{ color: '#aaa' }}>
          Bạn có chắc chắn muốn {confirmDialog.action === 'confirm' ? 'xác nhận' : 'hủy'} đơn hàng này?
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button onClick={() => setConfirmDialog({ open: false, orderId: null, action: '' })} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={handleConfirmAction} variant="contained" color={confirmDialog.action === 'confirm' ? 'primary' : 'error'} sx={{ textTransform: 'none' }}>
            {confirmDialog.action === 'confirm' ? 'Xác nhận ngay' : 'Hủy đơn hàng'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TableOrder
