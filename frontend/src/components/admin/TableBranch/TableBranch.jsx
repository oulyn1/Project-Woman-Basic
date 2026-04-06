import React, { useEffect, useState, useCallback } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getBranches, deleteBranch } from '~/apis/branchAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'
import TableRowsPerPage from '../TableRowsPerPage/TableRowsPerPage'

// Debounce hook
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const StatusBadge = ({ active }) => (
  <Box
    sx={{
      display: 'inline-block',
      px: 1,
      py: 0.5,
      borderRadius: 1,
      backgroundColor: active ? '#e8f5e8' : '#ffe6e6',
      color: active ? '#2e7d32' : '#d32f2f',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    }}
  >
    {active ? 'Hoạt động' : 'Tạm dừng'}
  </Box>
)

function TableBranch({ reloadKey, onEdit, onSuccess, onError }) {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ✅ Fetch list
  const fetchList = useCallback(async () => {
    try {
      const res = await getBranches(debouncedSearch ? { search: debouncedSearch } : {})
      const list = Array.isArray(res) ? res : (res?.data || [])
      setRows([...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
    } catch {
      setRows([])
      onError?.('Không thể tải danh sách chi nhánh')
    }
  }, [debouncedSearch, onError])

  // ✅ Load khi mount + reloadKey đổi
  useEffect(() => {
    fetchList()
  }, [fetchList, reloadKey])

  const onChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }, [])

  const onChangePage = useCallback((_, newPage) => {
    setPage(newPage)
  }, [])

  const askDelete = useCallback((id) => {
    setDeletingId(id)
    setOpenDeleteConfirm(true)
  }, [])

  const onCloseDelete = useCallback(() => {
    setOpenDeleteConfirm(false)
    setDeletingId(null)
  }, [])

  const onConfirmDelete = useCallback(async () => {
    try {
      await deleteBranch(deletingId)
      onSuccess?.('Xóa chi nhánh thành công')
      // Gọi fetch lại để cập nhật danh sách
      await fetchList()
    } catch {
      onError?.('Lỗi khi xóa chi nhánh')
    } finally {
      onCloseDelete()
    }
  }, [deletingId, onCloseDelete, fetchList, onSuccess, onError])

  return (
    <>
      {/* Hàng trên: RowsPerPage + Search */}
      <TableRowsPerPage
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 100]}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: 1000 }} aria-label="branch table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>STT</strong></TableCell>
              <TableCell><strong>TÊN CHI NHÁNH</strong></TableCell>
              <TableCell><strong>ĐỊA CHỈ</strong></TableCell>
              <TableCell><strong>TỈNH/TP</strong></TableCell>
              <TableCell><strong>QUẬN/HUYỆN</strong></TableCell>
              <TableCell><strong>SĐT</strong></TableCell>
              <TableCell align="center"><strong>TRẠNG THÁI</strong></TableCell>
              <TableCell align="center"><strong>THAO TÁC</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={row._id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#fafafa' }
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Tooltip title={row.address || ''} placement="top-start">
                      <Typography variant="body2" noWrap>{row.address || '—'}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell><Typography variant="body2">{row.provinceCode || '—'}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{row.districtCode || '—'}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{row.phone || '—'}</Typography></TableCell>
                  <TableCell align="center"><StatusBadge active={!!row.isActive} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Sửa chi nhánh">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onEdit?.(row._id)}
                          sx={{
                            width: 46, height: 46, p: 0, borderRadius: 1,
                            backgroundColor: '#e8f5e8',
                            '&:hover': { backgroundColor: '#c8e6c9' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Xóa chi nhánh">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => askDelete(row._id)}
                          sx={{
                            width: 46, height: 46, p: 0, borderRadius: 1,
                            backgroundColor: '#ffebee',
                            '&:hover': { backgroundColor: '#ffcdd2' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePageControls
        page={page}
        rowsPerPage={rowsPerPage}
        count={rows.length}
        onChangePage={onChangePage}
      />

      {/* Dialog xác nhận xoá */}
      <Dialog open={openDeleteConfirm} onClose={onCloseDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa chi nhánh này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDelete}>Hủy</Button>
          <Button color="error" variant="contained" onClick={onConfirmDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TableBranch
