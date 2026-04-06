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

import { fetchAllCategorysAPI, deleteCategoryAPI, searchCategorysAPI } from '~/apis/categoryAPIs'
import TablePageControls from '../TablePageControls/TablePageControls'
import TableRowsPerPage from '../TableRowsPerPage/TableRowsPerPage'

const TableCategory = ({ onEditCategory }) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)
  const [rows, setRows] = useState([])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const [searchQuery, setSearchQuery] = useState('')

  // Debounce để giảm số lần gọi API
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
    const fetchCategorys = async () => {
      try {
        // 1. Lấy tất cả category để build map cha-con
        const allCategories = await fetchAllCategorysAPI()

        // 2. Lấy data hiển thị theo search
        const data = !debouncedSearchQuery
          ? allCategories
          : await searchCategorysAPI(debouncedSearchQuery)

        // 3. Build map toàn bộ category để tra cứu parent/children
        const map = {}
        allCategories.forEach(cat => (map[cat._id] = { ...cat, children: [] }))
        allCategories.forEach(cat => {
          if (cat.parentId) {
            map[cat.parentId]?.children.push(map[cat._id])
          }
        })

        // 4. Thêm parentName cho mỗi category trong data
        const categoriesWithParentName = data.map(cat => {
          let parentName = null
          let currentParent = cat.parentId ? map[cat.parentId] : null
          const parentNames = []

          while (currentParent) {
            parentNames.push(currentParent.name)
            currentParent = currentParent.parentId ? map[currentParent.parentId] : null
          }

          if (parentNames.length > 0) parentName = parentNames.join(' - ')

          return { ...cat, parentName }
        })

        setRows(categoriesWithParentName)
      } catch {
        setRows([])
        setSnackbarMessage('Không thể tải dữ liệu danh mục. Vui lòng thử lại.')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }

    fetchCategorys()
  }, [debouncedSearchQuery])


  const handleEdit = (id) => onEditCategory(id)

  const handleDelete = (id) => {
    setDeletingCategoryId(id)
    setOpenDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCategoryAPI(deletingCategoryId)
      setRows(rows.filter(cat => cat._id !== deletingCategoryId))
      setSnackbarMessage('Danh mục đã được xóa thành công!')
      setSnackbarSeverity('success')
    } catch {
      setSnackbarMessage('Lỗi khi xóa danh mục. Vui lòng thử lại.')
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
      setOpenDeleteConfirm(false)
      setDeletingCategoryId(null)
    }
  }

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false)
    setDeletingCategoryId(null)
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setOpenSnackbar(false)
  }

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <>
      <TableRowsPerPage
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 100]}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }} aria-label="category table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>STT</strong></TableCell>
              <TableCell><strong>DANH MỤC</strong></TableCell>
              <TableCell><strong>DANH MỤC CHA</strong></TableCell>
              <TableCell align="center"><strong>THAO TÁC</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#fafafa' } }}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{row.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.parentName || 'Gốc'}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Sửa danh mục">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(row._id)}
                        sx={{ width: 46, height: 46, minWidth: 32, padding: 0, borderRadius: 1, backgroundColor: '#e8f5e8', '&:hover': { backgroundColor: '#c8e6c9' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa danh mục">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(row._id)}
                        sx={{ width: 46, height: 46, minWidth: 32, padding: 0, borderRadius: 1, backgroundColor: '#ffebee', '&:hover': { backgroundColor: '#ffcdd2' } }}
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

      <TablePageControls page={page} rowsPerPage={rowsPerPage} count={rows.length} onChangePage={handleChangePage} />

      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa danh mục này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ marginTop: '46px' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TableCategory
