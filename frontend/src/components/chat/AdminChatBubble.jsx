import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Fab,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Button,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useLocation, useNavigate } from 'react-router-dom'
import { sendAdminMessageAPI, getChatHistoryAPI, clearChatHistoryAPI } from '~/apis/chat.api'
import {
  fetchAllProductsAPI, deleteProductAPI, updateProductAPI, createProductAPI
} from '~/apis/productAPIs'
import { AllUsersAPI, deleteUserAPI, updateAccountAPI, createUserAPI } from '~/apis/userAPIs'
import { fetchAllCategoriesAPI, deleteCategoryAPI } from '~/apis/categoryAPIs'
import { fetchAllOrdersAPI, deleteOrderAPI, updateOrderAPI } from '~/apis/orderAPIs'

// Import chính chủ từ các trang quản lý
import AddProduct from '../../pages/AdminPage/ProductPage/AddProduct/AddProduct'
import EditProduct from '../../pages/AdminPage/ProductPage/EditProduct/EditProduct'
import AddAccount from '../../pages/AdminPage/AccountPage/AddAccount/AddAccount'
import EditAccount from '../../pages/AdminPage/AccountPage/EditAccount/EditAccount'
import AddCategory from '../../pages/AdminPage/CategoryPage/AddCategory/AddCategory'
import EditCategory from '../../pages/AdminPage/CategoryPage/EditCategory/EditCategory'

// ─── Quick Action Chips ───
const QUICK_ACTIONS = [
  { label: '📊 Tóm tắt hôm nay', message: 'Tóm tắt hôm nay' },
  { label: '⚠️ Sắp hết hàng', message: 'Sản phẩm sắp hết hàng' },
  { label: '🕐 Đơn chờ xử lý', message: 'Đơn hàng chờ xử lý' },
  { label: '💰 Doanh thu tuần', message: 'Doanh thu tuần này' },
  { label: '📝 Nhận xét KD', message: 'Nhận xét kinh doanh tuần này' }
]

// ─── Typing Indicator ───
const TypingIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1.5, maxWidth: 80 }}>
    {[0, 1, 2].map(i => (
      <Box
        key={i}
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: '#666',
          animation: 'adminBounce 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
          '@keyframes adminBounce': {
            '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
            '40%': { transform: 'scale(1)', opacity: 1 }
          }
        }}
      />
    ))}
  </Box>
)

// ─── Mini Manager (Đồng bộ từ Dashboard) ───
const MiniManagerCompact = ({ ac, onEdit, onDelete, onAdd }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const entity = ac?.entity

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (entity === 'product') res = await fetchAllProductsAPI({ q: search })
      else if (entity === 'account') res = await AllUsersAPI()
      else if (entity === 'category') res = await fetchAllCategoriesAPI()
      else if (entity === 'order') res = await fetchAllOrdersAPI()
      const items = res?.data || res || []
      setData(Array.isArray(items) ? items : [])
    } catch { /* */ }
    setLoading(false)
  }, [entity, search])

  useEffect(() => { loadData() }, [loadData])

  return (
    <Box sx={{ mt: 1, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d131f', overflow: 'hidden', width: '100%' }}>
      <Box sx={{ px: 1, py: 0.8, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <TextField
          size="small" fullWidth placeholder={`Tìm ${entity}...`} value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ sx: { height: 28, borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.2)', fontSize: '0.65rem', color: '#ccc' } }}
        />
        <Button
          variant="contained" size="small" onClick={onAdd}
          sx={{ minWidth: '40px', height: 28, backgroundColor: '#1e3a5f', color: '#60efff', textTransform: 'none', fontSize: '0.6rem' }}
        >
          + Thêm
        </Button>
      </Box>
      <Box sx={{ maxHeight: '180px', overflowY: 'auto' }}>
        {loading ? <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={16} /></Box> : (
          data.slice(0, 5).map(item => (
            <Box key={item._id} sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', '&:last-child': { borderBottom: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Avatar src={item.images?.[0] || item.avatar} sx={{ width: 24, height: 24, borderRadius: '4px' }} />
                <Typography sx={{ color: 'white', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name || item.fullName || item.buyerInfo?.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.3 }}>
                <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#42a5f5', p: 0.2 }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                <IconButton size="small" onClick={() => onDelete(item._id)} sx={{ color: '#ff6347', p: 0.2 }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════════════
const AdminChatBubble = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Dialog & Snackbar state (Sync from Dashboard)
  const [activeEntity, setActiveEntity] = useState(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleSuccess = (msg = 'Thành công!') => {
    setOpenAdd(false)
    setOpenEdit(false)
    setSnackbar({ open: true, message: msg, severity: 'success' })
    // Re-trigger manager load if needed
  }

  const handleDelete = async () => {
    try {
      if (activeEntity === 'product') await deleteProductAPI(deletingId)
      else if (activeEntity === 'account') await deleteUserAPI(deletingId)
      else if (activeEntity === 'category') await deleteCategoryAPI(deletingId)
      else if (activeEntity === 'order') await deleteOrderAPI(deletingId)
      setSnackbar({ open: true, message: 'Đã xóa bản ghi!', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi xóa!', severity: 'error' })
    } finally {
      setOpenDeleteConfirm(false)
      setDeletingId(null)
    }
  }

  // Ẩn trên dashboard
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/dashboard'

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Load history
  useEffect(() => {
    if (isOpen) {
      const loadHistory = async () => {
        setMessages([]) // Reset để load lại từ đầu
        try {
          const res = await getChatHistoryAPI()
          if (res.success && res.data?.messages) {
            setMessages(res.data.messages)
            if (res.data.conversationId) setActiveConversationId(res.data.conversationId)
          }
        } catch (err) {
          console.error('[AdminChat] Failed to load history:', err)
        }
      }
      loadHistory()
    }
  }, [isOpen])

  const handleSend = useCallback(async (text) => {
    const messageText = text || inputValue.trim()
    if (!messageText || isLoading) return

    const userMsg = { role: 'user', content: messageText, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendAdminMessageAPI({
        message: messageText,
        history,
        conversationId: activeConversationId
      })
      const data = res.data
      if (data.conversationId) setActiveConversationId(data.conversationId)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        actionCard: data.actionCard || null,
        quickReplies: data.quickReplies || []
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`,
        timestamp: new Date().toISOString(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading, messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDismissAction = (idx) => {
    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, actionCard: null } : m))
  }

  // Ẩn component trên dashboard — sau tất cả hooks
  if (isDashboard) return null

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Slide direction="up" in mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 0, sm: 90 },
              right: { xs: 0, sm: 24 },
              width: { xs: '100%', sm: 380 },
              height: { xs: '100%', sm: 520 },
              maxHeight: { xs: '100dvh', sm: 520 },
              borderRadius: { xs: 0, sm: '16px' },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              zIndex: 1300,
              backgroundColor: '#0f1118'
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: 'linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)', borderBottom: '1px solid #2a3040' }}>
              <Avatar sx={{ width: 32, height: 32, backgroundColor: '#2a3550' }}>
                <AutoAwesomeIcon sx={{ fontSize: 18, color: '#60efff' }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white', fontSize: '0.85rem' }}>Admin AI Copilot</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#4cff88' }} />
                  <Typography variant="caption" sx={{ color: '#888', fontSize: '0.6rem' }}>Online</Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#888', '&:hover': { color: 'white' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', gap: 0.5, px: 1.5, py: 1, overflowX: 'auto', borderBottom: '1px solid #1a2030', '&::-webkit-scrollbar': { height: 0 } }}>
              {QUICK_ACTIONS.map((action, idx) => (
                <Chip
                  key={idx}
                  label={action.label}
                  size="small"
                  onClick={() => handleSend(action.message)}
                  sx={{
                    fontSize: '0.65rem', height: 24, flexShrink: 0,
                    backgroundColor: '#1a2030', color: '#a0b0c8', border: '1px solid #2a3550',
                    '&:hover': { backgroundColor: '#253045', borderColor: '#3a5070' }
                  }}
                />
              ))}
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', py: 2, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#2a3040', borderRadius: 2 } }}>
              {messages.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                  <SmartToyIcon sx={{ fontSize: 40, color: '#2a3550', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#555', fontSize: '0.8rem' }}>
                    Hỏi về doanh thu, sản phẩm, đơn hàng...
                  </Typography>
                </Box>
              )}

              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user'
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''

                return (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 1.5, px: 1.5 }}>
                    <Box sx={{ maxWidth: '85%' }}>
                      <Box sx={{
                        p: 1.5, borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        backgroundColor: isUser ? '#1e3a5f' : '#1a1f2e',
                        color: isUser ? '#c8dff5' : '#d0d8e8',
                        fontSize: '0.82rem', lineHeight: 1.5, wordBreak: 'break-word',
                        border: `1px solid ${isUser ? '#2a4a6f' : '#252b3b'}`,
                        ...(msg.isError && { backgroundColor: '#2a1a1a', color: '#ff8a75', border: '1px solid #ff634530' })
                      }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem' }}>{msg.content}</Typography>
                      </Box>

                      {/* Action Card / Mini Manager */}
                      {(msg.actionCard || msg.metadata?.actionCard) && (
                        <MiniManagerCompact
                          ac={msg.actionCard || msg.metadata?.actionCard}
                          onAdd={() => { setActiveEntity((msg.actionCard || msg.metadata?.actionCard).entity); setOpenAdd(true) }}
                          onEdit={(item) => { setActiveEntity((msg.actionCard || msg.metadata?.actionCard).entity); setEditingItem(item); setOpenEdit(true) }}
                          onDelete={(id) => { setActiveEntity((msg.actionCard || msg.metadata?.actionCard).entity); setDeletingId(id); setOpenDeleteConfirm(true) }}
                        />
                      )}

                      {/* Quick Replies */}
                      {msg.quickReplies?.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.8 }}>
                          {msg.quickReplies.map((reply, rIdx) => (
                            <Chip key={rIdx} label={reply} size="small" variant="outlined" onClick={() => handleSend(reply)}
                              sx={{ fontSize: '0.65rem', height: 24, borderColor: '#2a3550', color: '#7090b0', '&:hover': { backgroundColor: '#1a2540', borderColor: '#4a6a90' } }}
                            />
                          ))}
                        </Box>
                      )}

                      <Typography variant="caption" sx={{ display: 'block', textAlign: isUser ? 'right' : 'left', color: '#555', fontSize: '0.6rem', mt: 0.3, px: 0.5 }}>
                        {time}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}

              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 1.5, mb: 1 }}>
                  <Box sx={{ backgroundColor: '#1a1f2e', borderRadius: '14px 14px 14px 4px', border: '1px solid #252b3b' }}>
                    <TypingIndicator />
                  </Box>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, p: 1.5, borderTop: '1px solid #1a2030', backgroundColor: '#0d1018' }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={3}
                size="small"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về doanh thu, sản phẩm, đơn hàng..."
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px', fontSize: '0.82rem', color: '#d0d8e8', backgroundColor: '#141820',
                    '& fieldset': { borderColor: '#1e2535' },
                    '&:hover fieldset': { borderColor: '#2a3550' },
                    '&.Mui-focused fieldset': { borderColor: '#3a5070' }
                  },
                  '& .MuiOutlinedInput-input::placeholder': { color: '#555', opacity: 1 }
                }}
              />
              <IconButton onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading}
                sx={{ backgroundColor: '#1e3a5f', color: '#60efff', width: 36, height: 36, '&:hover': { backgroundColor: '#2a4a6f' }, '&.Mui-disabled': { backgroundColor: '#141820', color: '#333' } }}>
                <SendIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Slide>
      )}

      {/* FAB Button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1299, display: 'flex', alignItems: 'center', gap: 1 }}>
        {!isOpen && (
          <Typography variant="caption" sx={{ color: '#888', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#1a1f2e', px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid #252b3b' }}>
            Admin AI
          </Typography>
        )}
        <Fab
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Admin AI Chat"
          sx={{
            width: 52,
            height: 52,
            background: isOpen
              ? 'linear-gradient(135deg, #555, #444)'
              : 'linear-gradient(135deg, #1a2540 0%, #2a3550 50%, #1e3a5f 100%)',
            color: isOpen ? '#ccc' : '#60efff',
            boxShadow: isOpen
              ? '0 4px 16px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(30, 58, 95, 0.5), 0 0 12px rgba(96, 239, 255, 0.15)',
            transition: 'all 0.3s',
            '&:hover': {
              background: isOpen
                ? 'linear-gradient(135deg, #666, #555)'
                : 'linear-gradient(135deg, #253050 0%, #3a4560 50%, #2a4a6f 100%)',
              transform: 'scale(1.05)'
            }
          }}
        >
          {isOpen ? <CloseIcon sx={{ fontSize: 22 }} /> : <SmartToyIcon sx={{ fontSize: 24 }} />}
        </Fab>
      </Box>

      {/* Dialogs chính chủ */}
      {activeEntity === 'product' && (
        <>
          <AddProduct open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => handleSuccess('Đã thêm sản phẩm!')} />
          {editingItem && <EditProduct open={openEdit} productId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={() => handleSuccess('Đã cập nhật sản phẩm!')} />}
        </>
      )}
      {activeEntity === 'account' && (
        <>
          <AddAccount open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => handleSuccess('Đã thêm tài khoản!')} />
          {editingItem && <EditAccount open={openEdit} accountId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={() => handleSuccess('Đã cập nhật tài khoản!')} />}
        </>
      )}
      {activeEntity === 'category' && (
        <>
          <AddCategory open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => handleSuccess('Đã thêm danh mục!')} />
          {editingItem && <EditCategory open={openEdit} categoryId={editingItem._id} onClose={() => setOpenEdit(false)} onSuccess={() => handleSuccess('Đã cập nhật danh mục!')} />}
        </>
      )}

      {/* Delete Confirm */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} PaperProps={{ sx: { backgroundColor: '#1a1a1a', color: 'white', borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent sx={{ color: '#ccc' }}>Bạn có chắc muốn xóa bản ghi này? Thao tác không thể hoàn tác.</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#888' }}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Xóa ngay</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </>
  )
}

export default AdminChatBubble
