import React, { useEffect, useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Snackbar, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Stack, Divider, CircularProgress, Avatar, IconButton, Tooltip
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import PaymentsIcon from '@mui/icons-material/Payments'
import LoyaltyIcon from '@mui/icons-material/Loyalty'

import {
  fetchCustomersAPI,
  searchCustomersAPI,
  getCustomerSummaryAPI,
  getCustomerOrdersAPI
} from '~/apis/customerAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

const TableCustomer = ({ searchQuery }) => {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const token = localStorage.getItem('accessToken')

  const [openDetail, setOpenDetail] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailUser, setDetailUser] = useState(null)
  const [detailStats, setDetailStats] = useState({ totalOrders: 0, totalAmount: 0, tier: 'Standard' })
  const [detailOrders, setDetailOrders] = useState([])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = searchQuery
          ? await searchCustomersAPI(searchQuery, token)
          : await fetchCustomersAPI(token)

        const filtered = (data || []).map(u => ({
          _id: u._id,
          name: u.fullName || u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          role: u.role || 'customer'
        }))
        setRows(filtered)
      } catch {
        setRows([])
        setSnack({ open: true, message: 'Lỗi khi tải danh sách.', severity: 'error' })
      }
    }
    fetchCustomers()
  }, [searchQuery, token])

  const handleOpenDetail = async (id) => {
    setOpenDetail(true)
    setLoadingDetail(true)
    try {
      const summary = await getCustomerSummaryAPI(id, token)
      setDetailUser(summary?.user || null)
      let stats = summary?.stats || { totalOrders: 0, totalAmount: 0, tier: 'Standard' }

      const ordersRaw = await getCustomerOrdersAPI(id, token)
      const orders = Array.isArray(ordersRaw) ? ordersRaw : []
      const filtered = orders.filter(o => {
        const uid = o.userId || o.user || o.user?._id || o.userId?._id
        return String(uid) === String(id)
      })
      setDetailOrders(filtered)
      stats = { ...stats, totalOrders: filtered.length, totalAmount: filtered.reduce((s, o) => s + Number(o?.total || 0), 0) }
      setDetailStats(stats)
    } catch {
      setSnack({ open: true, message: 'Lỗi khi tải chi tiết.', severity: 'error' })
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
          <Box
            key={customer._id}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              p: 2.5,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888', width: 50, height: 50 }}>
                <PersonIcon />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" color="white">{customer.name}</Typography>
                <Stack direction="row" spacing={3} sx={{ mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ color: '#555', fontSize: 16 }} />
                    <Typography variant="body2" color="#888">{customer.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ color: '#555', fontSize: 16 }} />
                    <Typography variant="body2" color="#888">{customer.phone || 'Chưa cập nhật'}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Tooltip title="Xem chi tiết">
                <IconButton 
                  onClick={() => handleOpenDetail(customer._id)}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    color: '#888',
                    transition: '0.2s',
                    '&:hover': { bgcolor: '#66FF99', color: 'black' }
                  }}
                >
                  <VisibilityOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}
      </Stack>

      <TablePageControls page={page} rowsPerPage={rowsPerPage} count={rows.length} onChangePage={(_, p) => setPage(p)} />

      {/* Modernized Detail Dialog */}
      <Dialog 
        open={openDetail} 
        onClose={() => setOpenDetail(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Hồ sơ khách hàng</DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="inherit" /></Box>
          ) : (
            <Stack spacing={4}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
                <Box>
                  <Typography variant="overline" color="#555" fontWeight="bold">Thông tin cá nhân</Typography>
                  {[
                    { icon: <PersonIcon />, text: detailUser?.fullName || detailUser?.name },
                    { icon: <EmailIcon />, text: detailUser?.email },
                    { icon: <PhoneIcon />, text: detailUser?.phone || 'N/A' },
                    { icon: <LocationOnIcon />, text: detailUser?.address || 'Chưa cập nhật' }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                      <Box sx={{ color: '#555', fontSize: 18 }}>{item.icon}</Box>
                      <Typography variant="body2" color="#aaa">{item.text}</Typography>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="overline" color="#555" fontWeight="bold">Thống kê mua hàng</Typography>
                  <StatItem icon={<ShoppingBagIcon />} title="Tổng đơn hàng" value={detailStats.totalOrders} color="#2196f3" />
                  <StatItem icon={<PaymentsIcon />} title="Tổng chi tiêu" value={formatVND(detailStats.totalAmount)} color="#4caf50" />
                  <StatItem icon={<LoyaltyIcon />} title="Hạng thành viên" value={detailStats.tier} color="#ff9800" />
                </Box>
              </Box>

              <Box>
                <Typography variant="overline" color="#555" fontWeight="bold" sx={{ mb: 2, display: 'block' }}>Lịch sử giao dịch</Typography>
                <TableContainer sx={{ maxHeight: 300, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#252525', color: '#888' }}>Mã đơn</TableCell>
                        <TableCell sx={{ bgcolor: '#252525', color: '#888' }}>Ngày</TableCell>
                        <TableCell sx={{ bgcolor: '#252525', color: '#888' }}>Trạng thái</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#252525', color: '#888' }}>Tổng tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailOrders.map((o) => (
                        <TableRow key={o._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                          <TableCell sx={{ color: '#aaa', borderBottom: '1px solid #333' }}>#{o._id.slice(-6).toUpperCase()}</TableCell>
                          <TableCell sx={{ color: '#aaa', borderBottom: '1px solid #333' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell sx={{ color: '#aaa', borderBottom: '1px solid #333' }}>{o.status}</TableCell>
                          <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333' }}>{formatVND(o.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button onClick={() => setOpenDetail(false)} sx={{ color: '#888' }}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  )
}

const StatItem = ({ icon, title, value, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="#555" display="block">{title}</Typography>
      <Typography variant="subtitle2" fontWeight="bold" color="white">{value}</Typography>
    </Box>
  </Box>
)

export default TableCustomer
