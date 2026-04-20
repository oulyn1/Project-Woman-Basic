import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Stack,
  Collapse,
  Avatar,
  CircularProgress
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BadgeIcon from '@mui/icons-material/Badge'

import { AllEmployeeAPI, searchEmployeeAPI } from '~/apis/userAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'

const TableEmployee = ({ searchQuery }) => {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      try {
        const data = !searchQuery
          ? await AllEmployeeAPI(token)
          : await searchEmployeeAPI(searchQuery, token)
        setRows(data)
      } catch {
        setRows([])
        setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu nhân viên!', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [searchQuery, token])

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id)

  return (
    <Box sx={{ mt: 2 }}>
      {loading && rows.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="inherit" /></Box>
      ) : (
        <Stack spacing={2}>
          {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
            <Box
              key={row._id}
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
              {/* Main Header */}
              <Box
                sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => toggleExpand(row._id)}
              >
                <Avatar
                  sx={{
                    bgcolor: '#2196f3',
                    width: 44,
                    height: 44,
                    mr: 2,
                    fontWeight: 'bold'
                  }}
                >
                  {row.name.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="white">
                    {row.name}
                  </Typography>
                  <Typography variant="body2" color="#888">
                    {row.email}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '20px',
                      backgroundColor: row.status === 'online' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                      color: row.status === 'online' ? '#4caf50' : '#888',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {row.status || 'Offline'}
                  </Box>
                  {expandedId === row._id ? <ExpandLessIcon sx={{ color: '#555' }} /> : <ExpandMoreIcon sx={{ color: '#555' }} />}
                </Box>
              </Box>

              {/* Expandable Content */}
              <Collapse in={expandedId === row._id}>
                <Box sx={{ p: 3, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Stack spacing={2} sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BadgeIcon sx={{ color: '#888', fontSize: 20 }} />
                        <Typography variant="body2" color="#aaa"><Box component="span" sx={{ color: '#555' }}>Mã nhân viên:</Box> {row._id.slice(-6).toUpperCase()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PhoneIcon sx={{ color: '#888', fontSize: 20 }} />
                        <Typography variant="body2" color="#aaa"><Box component="span" sx={{ color: '#555' }}>Số điện thoại:</Box> {row.phone || 'Chưa cập nhật'}</Typography>
                      </Box>
                    </Stack>
                    <Stack spacing={2} sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocationOnIcon sx={{ color: '#888', fontSize: 20 }} />
                        <Typography variant="body2" color="#aaa"><Box component="span" sx={{ color: '#555' }}>Địa chỉ:</Box> {row.address || 'Chưa cập nhật'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EmailIcon sx={{ color: '#888', fontSize: 20 }} />
                        <Typography variant="body2" color="#aaa">
                          <Box component="span" sx={{ color: '#555' }}>Đăng ký từ:</Box> {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          ))}

          {rows.length === 0 && !loading && (
            <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
              Không tìm thấy nhân viên nào.
            </Typography>
          )}
        </Stack>
      )}

      <TablePageControls
        page={page}
        rowsPerPage={rowsPerPage}
        count={rows.length}
        onChangePage={(_, p) => setPage(p)}
      />

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

export default TableEmployee
