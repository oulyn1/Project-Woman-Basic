import React, { useEffect, useState } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material'
import {
  fetchAllOrdersAPI,
  updateOrderAPI,
  searchOrdersAPI,
  confirmOrderAPI
} from '~/apis/orderAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'
import TableRowsPerPage from '../TableRowsPerPage/TableRowsPerPage'

const TableOrder = () => {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({ open: false, orderId: null, action: '' })
  const [detailDialog, setDetailDialog] = useState({ open: false, order: null })

  // Debounce hook
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = debouncedSearchQuery
          ? await searchOrdersAPI(debouncedSearchQuery)
          : await fetchAllOrdersAPI()
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setOrders(sortedData)
      } catch {
        setOrders([])
        setSnackbarMessage('Không thể tải đơn hàng.')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }
    fetchOrders()
  }, [debouncedSearchQuery])

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }
  const handleCloseSnackbar = () => setOpenSnackbar(false)

  const handleAction = (orderId, action) => {
    if (action === 'view') {
      const order = orders.find(o => o._id === orderId)
      setDetailDialog({ open: true, order })
    } else {
      setConfirmDialog({ open: true, orderId, action })
    }
  }

  const handleConfirmAction = async () => {
    try {
      const { orderId, action } = confirmDialog
      let updatedOrder = null

      if (action === 'confirm') {
        updatedOrder = await confirmOrderAPI(orderId)
      } else if (action === 'cancel') {
        updatedOrder = await updateOrderAPI(orderId, { status: 'cancelled' })
      }

      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o))
      setSnackbarMessage(`Đơn hàng đã ${action === 'confirm' ? 'xác nhận' : 'hủy'}`)
      setSnackbarSeverity('success')
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || 'Có lỗi xảy ra!')
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
      setConfirmDialog({ open: false, orderId: null, action: '' })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
    case 'pending': return '#fbc02d'
    case 'confirmed': return '#1976d2'
    case 'shipped': return '#ff9800'
    case 'delivered': return '#388e3c'
    case 'cancelled': return '#d32f2f'
    default: return '#757575'
    }
  }

  return (
    <>
      {/* Rows per page + Search */}
      <TableRowsPerPage
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>STT</TableCell>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell align="right">Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((o, index) => (
              <TableRow key={o._id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{o._id}</TableCell>
                <TableCell>{o.buyerInfo?.name}</TableCell>
                <TableCell align="right">{o.total.toLocaleString('vi-VN')}₫</TableCell>
                <TableCell>
                  <Box sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: getStatusColor(o.status),
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {o.status}
                  </Box>
                </TableCell>
                <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Button size="small" sx={{ mr: 1 }} onClick={() => handleAction(o._id, 'view')}>
                    Xem chi tiết
                  </Button>
                  {o.status === 'pending' && (
                    <>
                      <Button size="small" onClick={() => handleAction(o._id, 'confirm')} sx={{ mr: 1 }}>
                        Confirm
                      </Button>
                      <Button size="small" color="error" onClick={() => handleAction(o._id, 'cancel')}>
                        Hủy
                      </Button>
                    </>
                  )}
                  {o.status !== 'pending' && <Typography>—</Typography>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePageControls
        page={page}
        rowsPerPage={rowsPerPage}
        count={orders.length}
        onChangePage={handleChangePage}
      />

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, orderId: null, action: '' })}>
        <DialogTitle>Xác nhận hành động</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn {confirmDialog.action === 'confirm' ? 'xác nhận' : 'hủy'} đơn hàng này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, orderId: null, action: '' })}>Hủy</Button>
          <Button onClick={handleConfirmAction} color="primary" variant="contained">Xác nhận</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, order: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', fontWeight: 'bold', mb: 1 }}>
            <Typography sx={{ flex: 2 }}>Sản phẩm</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Số lượng</Typography>
            <Typography sx={{ flex: 1, textAlign: 'right' }}>Giá</Typography>
          </Box>
          <Box sx={{ borderTop: '1px solid #eee', mb: 1 }} />
          {detailDialog.order?.items.map((item, i) => (
            <Box key={i} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ flex: 2 }}>{item.product?.name || 'N/A'}</Typography>
              <Typography sx={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Typography>
              <Typography sx={{ flex: 1, textAlign: 'right', color: '#cc3300' }}>
                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
              </Typography>
            </Box>
          ))}
          <Box sx={{ borderTop: '1px solid #eee', mt: 2, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Tổng tiền:</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#cc3300' }}>
              {detailDialog.order?.total.toLocaleString('vi-VN')}₫
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, order: null })} variant="outlined" color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TableOrder
