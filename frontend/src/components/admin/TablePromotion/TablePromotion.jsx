import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Snackbar from '@mui/material/Snackbar'

import { fetchAllPromotionsAPI, deletePromotionAPI, searchPromotionsAPI } from '~/apis/promotionAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'
import TableRowsPerPage from '../TableRowsPerPage/TableRowsPerPage'

const TablePromotion = ({ onEditPromotion }) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingPromotionId, setDeletingPromotionId] = useState(null)
  const [rows, setRows] = useState([])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const [searchQuery, setSearchQuery] = useState('')

  // Debounce search
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        let data
        if (!debouncedSearchQuery) {
          data = await fetchAllPromotionsAPI()
        } else {
          data = await searchPromotionsAPI(debouncedSearchQuery)
        }
        const sortedData = data.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        )
        setRows(sortedData)
      } catch {
        setRows([])
        setSnackbarMessage('Không thể tải dữ liệu khuyến mãi. Vui lòng thử lại.')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }
    fetchPromotions()
  }, [debouncedSearchQuery])

  const handleEdit = id => onEditPromotion(id)
  const handleDelete = id => {
    setDeletingPromotionId(id)
    setOpenDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deletePromotionAPI(deletingPromotionId)
      setRows(rows.filter(p => p._id !== deletingPromotionId))
      setSnackbarMessage('Khuyến mãi đã được xóa thành công!')
      setSnackbarSeverity('success')
    } catch {
      setSnackbarMessage('Lỗi khi xóa khuyến mãi. Vui lòng thử lại.')
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
      setOpenDeleteConfirm(false)
      setDeletingPromotionId(null)
    }
  }

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false)
    setDeletingPromotionId(null)
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setOpenSnackbar(false)
  }

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = e => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const truncateDescription = (desc, maxLength = 50) =>
    desc.length <= maxLength ? desc : `${desc.substring(0, maxLength)}...`

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <>
      <TableRowsPerPage
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 100]}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflowX: 'auto' }}
      >
        <Table sx={{ minWidth: 1000 }} aria-label="promotion table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>STT</strong></TableCell>
              <TableCell><strong>TÊN KM</strong></TableCell>
              <TableCell><strong>MÔ TẢ</strong></TableCell>
              <TableCell><strong>GIẢM (%)</strong></TableCell>
              <TableCell><strong>NGÀY BẮT ĐẦU</strong></TableCell>
              <TableCell><strong>NGÀY KẾT THÚC</strong></TableCell>
              <TableCell align="center"><strong>SẢN PHẨM</strong></TableCell>
              <TableCell align="center"><strong>THAO TÁC</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row._id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{truncateDescription(row.description)}</TableCell>
                <TableCell>{row.discountPercent}%</TableCell>
                <TableCell>{formatDate(row.startDate)}</TableCell>
                <TableCell>{formatDate(row.endDate)}</TableCell>
                <TableCell align="center">{row.productIds?.length || 0}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Sửa khuyến mãi">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(row._id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Xóa khuyến mãi">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(row._id)}
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
        onChangePage={handleChangePage}
      />

      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa khuyến mãi này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
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

export default TablePromotion
