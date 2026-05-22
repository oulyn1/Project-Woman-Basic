import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Typography, TextField, IconButton, Avatar, Chip, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Divider, CircularProgress, Snackbar, Alert, Select, MenuItem
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import SendIcon from '@mui/icons-material/Send'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { useNavigate } from 'react-router-dom'
import {
  sendAdminMessageAPI,
  getChatHistoryAPI,
  clearChatHistoryAPI,
  getAdminConversationsAPI
} from '~/apis/chat.api'
import { fetchAllProductsAPI, deleteProductAPI, updateProductAPI, createProductAPI } from '~/apis/productAPIs'
import { AllUsersAPI, deleteUserAPI, updateAccountAPI, createUserAPI } from '~/apis/userAPIs'
import { fetchAllCategoriesAPI, deleteCategoryAPI } from '~/apis/categoryAPIs'
import { fetchAllOrdersAPI, deleteOrderAPI, updateOrderAPI, confirmOrderAPI } from '~/apis/orderAPIs'
import { fetchAllPromotionsAPI, deletePromotionAPI } from '~/apis/promotionAPIs'
import { getAllRatingsAPI, deleteRatingAPI } from '~/apis/ratingAPIs'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

// Import chính chủ từ các trang quản lý
import AddProduct from '../ProductPage/AddProduct/AddProduct'
import EditProduct from '../ProductPage/EditProduct/EditProduct'
import AddAccount from '../AccountPage/AddAccount/AddAccount'
import EditAccount from '../AccountPage/EditAccount/EditAccount'
import AddCategory from '../CategoryPage/AddCategory/AddCategory'
import EditCategory from '../CategoryPage/EditCategory/EditCategory'
import AddPromotion from '../PromotionPage/AddPromotion/AddPromotion'
import EditPromotion from '../PromotionPage/EditPromotion/EditPromotion'

const QUICK_ACTIONS = [
  { label: '📊 Tóm tắt hôm nay', msg: 'Tóm tắt hôm nay' },
  { label: '⚠️ Sắp hết hàng', msg: 'Sản phẩm sắp hết hàng' },
  { label: '🕐 Đơn chờ xử lý', msg: 'Đơn hàng chờ xử lý' },
  { label: '💰 Doanh thu tuần này', msg: 'Doanh thu tuần này' },
  { label: '📝 Nhận xét kinh doanh', msg: 'Nhận xét kinh doanh tuần này' }
]

// ─── Typing Indicator ───
const Typing = () => (
  <Box sx={{ display: 'flex', gap: 0.5, p: 1.5 }}>
    {[0, 1, 2].map(i => (
      <Box key={i} sx={{
        width: 8, height: 8, borderRadius: '50%', backgroundColor: '#555',
        animation: 'dbBounce 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s`,
        '@keyframes dbBounce': { '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.4 }, '40%': { transform: 'scale(1)', opacity: 1 } }
      }} />
    ))}
  </Box>
)

// ─── Mini Manager (Quick CRUD) ───
const MiniManager = ({ entity, onDismiss }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (entity === 'product') res = await fetchAllProductsAPI({ q: search })
      else if (entity === 'account') res = await AllUsersAPI()
      else if (entity === 'category') res = await fetchAllCategoriesAPI()
      else if (entity === 'order') res = await fetchAllOrdersAPI()
      else if (entity === 'promotion') res = await fetchAllPromotionsAPI()
      else if (entity === 'rating') res = await getAllRatingsAPI()

      // Handle different API response structures
      const items = res?.items || res?.data || res || []
      setData(Array.isArray(items) ? items : [])
    } catch (err) { console.error('Load failed:', err) }
    setLoading(false)
  }, [entity, search])

  useEffect(() => { loadData() }, [loadData])


  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleSuccess = (msg = 'Thành công!') => {
    setOpenAdd(false)
    setOpenEdit(false)
    setSnackbar({ open: true, message: msg, severity: 'success' })
    loadData()
  }

  const handleDelete = async () => {
    try {
      if (entity === 'product') await deleteProductAPI(deletingId)
      else if (entity === 'account') await deleteUserAPI(deletingId)
      else if (entity === 'category') await deleteCategoryAPI(deletingId)
      else if (entity === 'order') await deleteOrderAPI(deletingId)
      else if (entity === 'promotion') await deletePromotionAPI(deletingId)
      else if (entity === 'rating') await deleteRatingAPI(deletingId)
      setSnackbar({ open: true, message: 'Đã xóa bản ghi!', severity: 'success' })
      loadData()
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi xóa!', severity: 'error' })
    } finally {
      setOpenDeleteConfirm(false)
      setDeletingId(null)
    }
  }

  const showAddButton = entity !== 'order' && entity !== 'rating'

  return (
    <Box sx={{ mt: 1.5, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d131f', overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <TextField
          size="small" fullWidth placeholder={`Tìm kiếm ${entity}...`}
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#555', mr: 1, fontSize: 18 }} />,
            sx: { borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: '#ccc' }
          }}
        />
        {showAddButton && (
          <Button
            variant="contained" size="small" startIcon={<AddIcon />}
            onClick={() => { setEditingItem(null); setOpenAdd(true) }}
            sx={{ backgroundColor: '#1e3a5f', color: '#60efff', textTransform: 'none', borderRadius: '10px', minWidth: '90px', fontSize: '0.7rem' }}
          >
            Thêm
          </Button>
        )}
        <IconButton size="small" onClick={onDismiss} sx={{ color: '#555' }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>

      <Box sx={{ maxHeight: '240px', overflowY: 'auto', p: 1 }}>
        {loading ? <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={20} /></Box> : (
          data.slice(0, 10).map((item) => {
            let title = item.name || item.fullName || item.username || item.title || item._id
            let subtitle = ''
            let avatarUrl = item.image || item.images?.[0] || item.avatar || ''

            if (entity === 'order') {
              title = `Đơn hàng #${item.code || item._id?.substring(18) || item._id}`
              subtitle = `${item.total?.toLocaleString()}đ • Trạng thái: ${item.status}`
            } else if (entity === 'promotion') {
              title = item.title || item._id
              subtitle = `Giảm ${item.discountValue}${item.discountType === 'percent' ? '%' : 'đ'} • ${item.computedStatus || item.status || ''}`
            } else if (entity === 'rating') {
              title = item.productName || 'Đánh giá'
              subtitle = `${'⭐'.repeat(item.star || 5)} • "${item.description}"`
            } else {
              subtitle = item.price ? `${item.price.toLocaleString()}đ` : item.email || item.status || ''
              if (item.role) subtitle += ` • ${item.role}`
            }

            const canEdit = entity !== 'rating'

            return (
              <Box key={item._id} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, mb: 0.5, borderRadius: '10px',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }
              }}>
                <Avatar src={avatarUrl} sx={{ width: 32, height: 32, borderRadius: '8px' }} variant="rounded" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: '#eee', fontWeight: 600, display: 'block', noWrap: true }}>{title}</Typography>
                  <Typography variant="caption" sx={{ color: '#555', fontSize: '0.65rem' }}>
                    {subtitle}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {canEdit && (
                    <IconButton size="small" onClick={() => { setEditingItem(item); setOpenEdit(true) }} sx={{ color: '#42a5f5', p: 0.5 }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                  )}
                  <IconButton size="small" onClick={() => { setDeletingId(item._id); setOpenDeleteConfirm(true) }} sx={{ color: '#ff6347', p: 0.5 }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              </Box>
            )
          })
        )}
        {!loading && data.length === 0 && (
          <Typography variant="caption" sx={{ color: '#444', display: 'block', textAlign: 'center', p: 2 }}>Không tìm thấy dữ liệu</Typography>
        )}
      </Box>

      {/* --- REUSE OFFICIAL DIALOGS --- */}
      {entity === 'product' && (
        <>
          <AddProduct open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={handleSuccess} />
          {editingItem && <EditProduct open={openEdit} productId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={handleSuccess} />}
        </>
      )}
      {entity === 'account' && (
        <>
          <AddAccount open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={handleSuccess} />
          {editingItem && <EditAccount open={openEdit} accountId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={handleSuccess} />}
        </>
      )}
      {entity === 'category' && (
        <>
          <AddCategory open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => handleSuccess('Đã thêm danh mục!')} />
          {editingItem && <EditCategory open={openEdit} categoryId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={() => handleSuccess('Đã cập nhật danh mục!')} />}
        </>
      )}
      {entity === 'promotion' && (
        <>
          <AddPromotion open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => handleSuccess('Đã thêm khuyến mãi!')} />
          {editingItem && <EditPromotion open={openEdit} promotionId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={handleSuccess} />}
        </>
      )}
      {entity === 'order' && editingItem && (
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px', minWidth: '350px' } }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Cập nhật đơn hàng #{editingItem.code || editingItem._id}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Khách hàng: <b>{editingItem.fullName || editingItem.username || 'Khách vãng lai'}</b>
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Tổng tiền: <b>{editingItem.total?.toLocaleString()}đ</b>
            </Typography>
            
            <Box>
              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>Cập nhật trạng thái:</Typography>
              <Select
                value={editingItem.status}
                onChange={async (e) => {
                  try {
                    const newStatus = e.target.value
                    let updated
                    if (newStatus === 'confirmed' && editingItem.status === 'pending') {
                      updated = await confirmOrderAPI(editingItem._id)
                    } else {
                      updated = await updateOrderAPI(editingItem._id, { status: newStatus })
                    }
                    handleSuccess('Đã cập nhật trạng thái đơn hàng!')
                  } catch {
                    setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái!', severity: 'error' })
                  }
                }}
                fullWidth
                size="small"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <MenuItem value="pending">Chờ xử lý (Pending)</MenuItem>
                <MenuItem value="confirmed">Đã xác nhận (Confirmed)</MenuItem>
                <MenuItem value="shipped">Đang giao hàng (Shipped)</MenuItem>
                <MenuItem value="delivered">Đã giao hàng (Delivered)</MenuItem>
                <MenuItem value="cancelled">Đã hủy (Cancelled)</MenuItem>
              </Select>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEdit(false)} sx={{ color: '#888' }}>Đóng</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent sx={{ color: '#ccc' }}>
          Bạn có chắc chắn muốn xóa bản ghi này? Thao tác này không thể hoàn tác.
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 'bold' }}>Xóa ngay</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

// ─── Action Card (Legacy or Bridge) ───
const ActionCard = ({ ac, onDismiss }) => {
  if (!ac) return null
  return <MiniManager entity={ac.entity} onDismiss={onDismiss} />
}

// ═══════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════
const Dashboard = () => {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null) // Để xóa session cụ thể
  const endRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  // Load conversations list
  const loadSessions = useCallback(async () => {
    try {
      const res = await getAdminConversationsAPI()
      if (res.success) setConversations(res.data)
    } catch { /* */ }
  }, [])

  // Initial Load
  useEffect(() => {
    const init = async () => {
      await loadSessions()
      try {
        const res = await getChatHistoryAPI() // Lấy phiên gần nhất
        if (res.success && res.data?.messages) {
          setMessages(res.data.messages)
          if (res.data.conversationId) setActiveConversationId(res.data.conversationId)
          setHistoryLoaded(true)
          if (res.data.messages.length > 0) return
        }
      } catch { /* */ }
      setHistoryLoaded(true)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSessions])

  const handleSelectSession = async (id) => {
    if (id === activeConversationId || isLoading) return
    setIsLoading(true)
    setHistoryLoaded(false)
    try {
      const res = await getChatHistoryAPI({ conversationId: id })
      if (res.success) {
        setMessages(res.data.messages || [])
        setActiveConversationId(res.data.conversationId)
      }
    } catch { /* */ }
    setIsLoading(false)
    setHistoryLoaded(true)
  }

  const handleNewChat = () => {
    setMessages([])
    setActiveConversationId(null)
    if (inputRef.current) inputRef.current.focus()
  }

  const sendMsg = useCallback(async (text) => {
    const t = text || inputValue.trim()
    if (!t || isLoading) return
    const userMsg = { role: 'user', content: t, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendAdminMessageAPI({
        message: t,
        history,
        conversationId: activeConversationId
      })
      const d = res.data
      if (d.conversationId && !activeConversationId) {
        setActiveConversationId(d.conversationId)
        loadSessions()
      }
      setMessages(prev => [...prev, {
        role: 'assistant', content: d.reply, timestamp: new Date().toISOString(),
        actionCard: d.actionCard || null, quickReplies: d.quickReplies || []
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant', content: `⚠️ ${err.response?.data?.message || err.message}`,
        timestamp: new Date().toISOString(), isError: true
      }])
    } finally { setIsLoading(false) }
  }, [inputValue, isLoading, messages])

  const handleClear = async () => {
    try {
      await clearChatHistoryAPI({ conversationId: deleteTargetId || activeConversationId })
      if (deleteTargetId === activeConversationId || !deleteTargetId) {
        setMessages([])
        setActiveConversationId(null)
      }
      loadSessions()
    } catch (err) {
      console.error('[Dashboard Chat] Failed to clear history:', err)
    } finally {
      setClearDialogOpen(false)
      setDeleteTargetId(null)
    }
  }

  const dismissAction = (idx) => setMessages(prev => prev.map((m, i) =>
    i === idx ? { ...m, actionCard: null, metadata: m.metadata ? { ...m.metadata, actionCard: null } : null } : m
  ))

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }

  // Group messages by date for sidebar
  const grouped = {}
  messages.forEach((m, idx) => {
    const d = m.timestamp ? new Date(m.timestamp).toLocaleDateString('vi-VN') : 'Khác'
    if (!grouped[d]) grouped[d] = []
    grouped[d].push({ ...m, idx })
  })

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', mx: { xs: 1, md: 4 }, my: 2, gap: 2 }}>
      {/* ─── SIDEBAR ─── */}
      <Box sx={{
        width: { xs: 0, md: 280 }, flexShrink: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
            onClick={handleNewChat}
            sx={{
              justifyContent: 'flex-start', color: '#60efff', borderColor: 'rgba(96,239,255,0.2)',
              textTransform: 'none', borderRadius: '12px', fontSize: '0.8rem',
              '&:hover': { backgroundColor: 'rgba(96,239,255,0.05)', borderColor: 'rgba(96,239,255,0.4)' }
            }}
          >
            Chat mới
          </Button>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1.5, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#2a3040', borderRadius: 2 } }}>
          {conversations.length === 0 && (
            <Typography variant="caption" sx={{ color: '#555', display: 'block', textAlign: 'center', mt: 4 }}>Chưa có phiên chat</Typography>
          )}
          {conversations.map((conv) => (
            <Box
              key={conv._id}
              onClick={() => handleSelectSession(conv._id)}
              sx={{
                px: 1.5, py: 1.2, mb: 1, borderRadius: '12px', cursor: 'pointer',
                backgroundColor: activeConversationId === conv._id ? 'rgba(96,239,255,0.08)' : 'transparent',
                border: `1px solid ${activeConversationId === conv._id ? 'rgba(96,239,255,0.2)' : 'transparent'}`,
                transition: 'all 0.2s', position: 'relative', group: 'true',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                '&:hover .del-btn': { opacity: 1 }
              }}
            >
              <Typography variant="caption" sx={{
                color: activeConversationId === conv._id ? '#60efff' : '#aaa',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                fontSize: '0.78rem', fontWeight: activeConversationId === conv._id ? 600 : 400, pr: 2
              }}>
                {conv.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#555', fontSize: '0.62rem' }}>
                  {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                </Typography>
                <IconButton
                  className="del-btn"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeleteTargetId(conv._id); setClearDialogOpen(true) }}
                  sx={{ opacity: 0, p: 0.2, color: '#ff634750', '&:hover': { color: '#ff6347', backgroundColor: 'transparent' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── MAIN CHAT ─── */}
      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
        backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #1e3a5f, #2a4a6f)' }}>
            <AutoAwesomeIcon sx={{ fontSize: 20, color: '#60efff' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>Admin AI Copilot</Typography>
            <Typography variant="caption" sx={{ color: '#4cff88' }}>● Online</Typography>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 0.8, px: 2, py: 1.5, overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.03)', '&::-webkit-scrollbar': { height: 0 } }}>
          {QUICK_ACTIONS.map((a, i) => (
            <Chip key={i} label={a.label} size="small" onClick={() => sendMsg(a.msg)}
              sx={{ fontSize: '0.72rem', height: 28, flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.04)', color: '#a0b8d0', border: '1px solid rgba(255,255,255,0.06)',
                '&:hover': { backgroundColor: 'rgba(96,239,255,0.08)', borderColor: 'rgba(96,239,255,0.2)' }
              }}
            />
          ))}
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}>
          {!historyLoaded && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} sx={{ color: '#60efff' }} /></Box>
          )}

          {historyLoaded && messages.length === 0 && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'rgba(96,239,255,0.15)', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#555' }}>Bắt đầu hội thoại với Admin AI Copilot</Typography>
            </Box>
          )}

          {messages.map((m, idx) => {
            const isU = m.role === 'user'
            const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
            return (
              <Box key={idx} sx={{ display: 'flex', justifyContent: isU ? 'flex-end' : 'flex-start', mb: 2, px: 2 }}>
                <Box sx={{ maxWidth: '80%' }}>
                  <Box sx={{
                    p: 2, borderRadius: isU ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isU ? 'rgba(30,58,95,0.6)' : 'rgba(255,255,255,0.03)',
                    color: isU ? '#c8e0f5' : '#d0d8e8', fontSize: '0.85rem', lineHeight: 1.6, wordBreak: 'break-word',
                    border: `1px solid ${isU ? 'rgba(42,74,111,0.5)' : 'rgba(255,255,255,0.05)'}`,
                    ...(m.isError && { backgroundColor: 'rgba(211,47,47,0.1)', color: '#ff8a75', border: '1px solid rgba(255,99,71,0.2)' })
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', fontFamily: isU ? 'inherit' : '"Inter", monospace' }}>
                      {m.content}
                    </Typography>
                  </Box>

                  {/* Lấy từ m trực tiếp (khi vừa chat) hoặc m.metadata (khi load lịch sử) */}
                  {(m.actionCard || m.metadata?.actionCard) && (
                    <ActionCard ac={m.actionCard || m.metadata.actionCard} onDismiss={() => dismissAction(idx)} />
                  )}

                  {(m.quickReplies?.length > 0 || m.metadata?.quickReplies?.length > 0) && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {(m.quickReplies || m.metadata?.quickReplies || []).map((r, ri) => (
                        <Chip key={ri} label={r} size="small" variant="outlined" onClick={() => sendMsg(r)}
                          sx={{ fontSize: '0.7rem', height: 26, borderColor: 'rgba(96,239,255,0.15)', color: '#7090b0',
                            '&:hover': { backgroundColor: 'rgba(96,239,255,0.06)', borderColor: 'rgba(96,239,255,0.3)' } }}
                        />
                      ))}
                    </Box>
                  )}

                  <Typography variant="caption" sx={{ display: 'block', textAlign: isU ? 'right' : 'left', color: '#444', fontSize: '0.62rem', mt: 0.5, px: 0.5 }}>
                    {time}
                  </Typography>
                </Box>
              </Box>
            )
          })}

          {isLoading && (
            <Box sx={{ px: 2, mb: 1 }}>
              <Box sx={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block' }}>
                <Typing />
              </Box>
            </Box>
          )}
          <div ref={endRef} />
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <TextField
            inputRef={inputRef} fullWidth multiline maxRows={4} size="small"
            value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKey}
            placeholder="Hỏi về doanh thu, sản phẩm, đơn hàng..." disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px', fontSize: '0.85rem', color: '#d0d8e8', backgroundColor: 'rgba(255,255,255,0.02)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(96,239,255,0.3)' }
              },
              '& .MuiOutlinedInput-input::placeholder': { color: '#555', opacity: 1 }
            }}
          />
          <IconButton onClick={() => sendMsg()} disabled={!inputValue.trim() || isLoading}
            sx={{
              backgroundColor: 'rgba(30,58,95,0.6)', color: '#60efff', width: 42, height: 42, borderRadius: '12px',
              '&:hover': { backgroundColor: 'rgba(42,74,111,0.8)' },
              '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.02)', color: '#333' }
            }}>
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ textAlign: 'center', color: '#444', pb: 1, fontSize: '0.6rem' }}>
          Enter để gửi • Shift+Enter xuống dòng
        </Typography>
      </Box>

      {/* Clear Confirm Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}
        PaperProps={{ sx: { backgroundColor: '#1a1e2e', color: '#eee', borderRadius: '16px' } }}>
        <DialogTitle>Xóa lịch sử chat</DialogTitle>
        <DialogContent><DialogContentText sx={{ color: '#aaa' }}>Toàn bộ lịch sử sẽ bị xóa. Bạn có chắc chắn?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} sx={{ color: '#999' }}>Hủy</Button>
          <Button onClick={handleClear} variant="contained" sx={{ backgroundColor: '#d32f2f' }}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Dashboard
