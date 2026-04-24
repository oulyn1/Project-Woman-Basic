import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Collapse,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { fetchAllProductsAPI, deleteProductAPI } from '~/apis/productAPIs'
import { fetchAllCategoriesAPI } from '~/apis/categoryAPIs'

const TableProduct = ({ onEditProduct, searchQuery, categoryId = 'ALL', fetchTrigger }) => {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  
  // Action Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Delete State
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      try {
        const [cats, prods] = await Promise.all([
          fetchAllCategoriesAPI(),
          fetchAllProductsAPI({ q: searchQuery, limit: 200 }) // load all, filter client-side
        ])
        setCategories(cats)
        setRows(prods.data || [])
      } catch { /* ... */ }
      finally { setLoading(false) }
    }
    initData()
  }, [searchQuery, fetchTrigger])

  // Listen for optimistic updates from add/edit operations
  useEffect(() => {
    const handleAdded = (e) => {
      const newProduct = e.detail
      if (!newProduct) return
      // Prepend new product to the list, avoid duplicates
      setRows(prev => {
        const exists = prev.find(p => p._id === newProduct._id)
        if (exists) return prev.map(p => p._id === newProduct._id ? newProduct : p)
        return [newProduct, ...prev]
      })
    }

    const handleUpdated = (e) => {
      const updated = e.detail
      if (!updated) return
      setRows(prev => prev.map(p => (p._id === updated._id ? updated : p)))
    }

    window.addEventListener('PRODUCT_ADDED', handleAdded)
    window.addEventListener('PRODUCT_UPDATED', handleUpdated)
    return () => {
      window.removeEventListener('PRODUCT_ADDED', handleAdded)
      window.removeEventListener('PRODUCT_UPDATED', handleUpdated)
    }
  }, [])

  // Client-side category filter
  const filteredRows = React.useMemo(() => {
    if (categoryId === 'ALL') return rows
    return rows.filter(p => p.categoryId?.toString() === categoryId.toString())
  }, [rows, categoryId])

  const getCategoryName = (id) => categories.find(cat => cat._id === id)?.name || 'Không có'

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const handleToggleExpand = (id) => setExpandedId(expandedId === id ? null : id)

  const handleOpenMenu = (event, id) => {
    setAnchorEl(event.currentTarget)
    setMenuId(id)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuId(null)
  }

  const handleAction = (type) => {
    if (type === 'edit') onEditProduct(menuId)
    if (type === 'delete') {
      setDeletingId(menuId)
      setOpenDeleteConfirm(true)
    }
    if (type === 'view') handleToggleExpand(menuId)
    handleCloseMenu()
  }

  const confirmDelete = async () => {
    try {
      await deleteProductAPI(deletingId)
      setRows(rows.filter(r => r._id !== deletingId))
      setSnackbar({ open: true, message: 'Đã xóa sản phẩm!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi xóa!', severity: 'error' })
    } finally {
      setOpenDeleteConfirm(false)
    }
  }

  // Calculate distinct sizes and colors for the matrix
  const getMatrixHeader = (variants) => {
    const colors = []
    const sizes = []
    variants.forEach(v => {
      if (!sizes.includes(v.size)) sizes.push(v.size)
      if (!colors.find(c => c.hex === v.color.hex)) colors.push(v.color)
    })
    return { sizes, colors }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {filteredRows.length === 0 && (
        <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>Không tìm thấy sản phẩm nào.</Typography>
      )}
      {filteredRows.map((product) => {
        const isExpanded = expandedId === product._id
        const totalStock = product.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0
        const { sizes, colors } = getMatrixHeader(product.variants || [])

        return (
          <Box
            key={product._id}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              transition: '0.3s',
              '&:hover': { borderColor: 'rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }
            }}
          >
            {/* Card Header Content */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
               {/* Thumbnail */}
              <Avatar
                src={product.images?.[0]}
                variant="rounded"
                sx={{ width: 80, height: 80, backgroundColor: '#252525', border: '1px solid #333' }}
              />

              {/* Main Info */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" color="white" sx={{ mb: 0.5 }}>{product.name}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="#888">
                    {getCategoryName(product.categoryId)} • {sizes.join(', ')} • 
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {colors.map(c => (
                      <Box key={c.hex} sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c.hex }} />
                    ))}
                  </Stack>
                </Stack>

                {/* Badges */}
                <Stack direction="row" spacing={1.5}>
                  <Box sx={{ bgcolor: '#fffde7', color: '#afb42b', px: 1.5, py: 0.2, borderRadius: '50px', fontSize: '13px', fontWeight: 'bold' }}>
                    {formatCurrency(product.price)}
                  </Box>
                  <Box sx={{ bgcolor: '#e3f2fd', color: '#1976d2', px: 1.5, py: 0.2, borderRadius: '50px', fontSize: '13px' }}>
                    Đã bán: {product.sold || 0}
                  </Box>
                  <Box sx={{ bgcolor: '#fff3e0', color: '#e65100', px: 1.5, py: 0.2, borderRadius: '50px', fontSize: '13px' }}>
                    Kho: {totalStock}
                  </Box>
                </Stack>
              </Box>

              {/* Actions */}
              <Stack direction="row" alignItems="center">
                <IconButton onClick={() => handleToggleExpand(product._id)} sx={{ color: '#888' }}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton onClick={(e) => handleOpenMenu(e, product._id)} sx={{ color: '#888' }}>
                  <MoreVertIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Expanded Section (Variants Matrix) */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ p: 3, pt: 1, borderTop: '1px solid #333' }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', mb: 1.5, display: 'block' }}>TỒN KHO THEO BIẾN THẾ</Typography>
                
                {product.variants?.length > 0 ? (
                  <Box sx={{ border: '1px solid #252525', borderRadius: '8px', overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#252525' }}>
                        <TableRow>
                          <TableCell sx={{ color: '#888', borderBottom: '1px solid #252525' }}>Size \ Màu</TableCell>
                          {colors.map(c => (
                            <TableCell key={c.hex} align="center" sx={{ color: '#888', borderBottom: '1px solid #252525' }}>
                              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c.hex }} />
                                <Typography variant="caption">{c.name}</Typography>
                              </Stack>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sizes.map(size => (
                          <TableRow key={size}>
                            <TableCell sx={{ color: 'white', borderBottom: '1px solid #252525', fontWeight: 'bold' }}>{size}</TableCell>
                            {colors.map(color => {
                              const variant = product.variants.find(v => v.size === size && v.color.hex === color.hex)
                              return (
                                <TableCell key={color.hex} align="center" sx={{ color: variant ? 'white' : '#444', borderBottom: '1px solid #252525' }}>
                                  {variant ? variant.stock : '—'}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#666' }}>Không có biến thể khả dụng.</Typography>
                )}
                
                <Typography variant="caption" sx={{ color: '#666', mt: 1.5, display: 'block' }}>
                  Tổng tồn kho: <strong>{totalStock} sản phẩm</strong> • {product.variants?.length || 0} biến thể
                </Typography>
              </Box>
            </Collapse>
          </Box>
        )
      })}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { backgroundColor: '#252525', border: '1px solid #333', color: 'white', minWidth: 160 }
        }}
      >
        <MenuItem onClick={() => handleAction('edit')} sx={{ gap: 1.5 }}>
          <EditIcon fontSize="small" /> Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ gap: 1.5, color: '#f44336' }}>
          <DeleteIcon fontSize="small" /> Xóa sản phẩm
        </MenuItem>
      </Menu>

      {/* Delete Confirm */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white' } }}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Xóa ngay</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default TableProduct
