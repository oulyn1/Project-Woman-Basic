import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Fab,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useLocation, useNavigate } from 'react-router-dom'
import { sendAdminMessageAPI } from '~/apis/chat.api'
import { deleteProductAPI } from '~/apis/productAPIs'

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

// ─── Action Card (cho admin bubble popup) ───
const ActionCardCompact = ({ actionCard, onDismiss }) => {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!actionCard) return null

  const isDelete = actionCard.type === 'delete'

  const handleEdit = () => {
    if (actionCard.entity === 'product' && actionCard.data?._id) {
      navigate(`/admin/product`)
    }
    onDismiss()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (actionCard.entity === 'product' && actionCard.data?._id) {
        await deleteProductAPI(actionCard.data._id)
      }
    } catch { /* silent */ }
    setDeleting(false)
    setConfirmOpen(false)
    onDismiss()
  }

  return (
    <>
      <Card
        sx={{
          mt: 1,
          borderRadius: '12px',
          border: `1px solid ${isDelete ? '#ff634755' : '#42a5f555'}`,
          backgroundColor: isDelete ? '#2a1a1a' : '#1a2230',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ px: 1.5, py: 0.8, backgroundColor: isDelete ? '#ff634520' : '#42a5f520', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WarningAmberIcon sx={{ fontSize: 14, color: isDelete ? '#ff6347' : '#42a5f5' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: isDelete ? '#ff8a75' : '#7ec8f5' }}>
            {isDelete ? 'Xác nhận xóa' : 'Xác nhận sửa'}
          </Typography>
        </Box>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mb: 1 }}>
            {actionCard.data?.name || 'Unknown'}
            {actionCard.data?.price && ` — ${Number(actionCard.data.price).toLocaleString('vi-VN')}đ`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 12 }} />} onClick={handleEdit}
              sx={{ fontSize: '0.65rem', py: 0.2, borderColor: '#42a5f555', color: '#7ec8f5', textTransform: 'none' }}>
              Chỉnh sửa
            </Button>
            {isDelete && (
              <Button size="small" variant="contained" startIcon={<DeleteIcon sx={{ fontSize: 12 }} />} onClick={() => setConfirmOpen(true)}
                sx={{ fontSize: '0.65rem', py: 0.2, backgroundColor: '#d32f2f', textTransform: 'none', '&:hover': { backgroundColor: '#b71c1c' } }}>
                Xóa
              </Button>
            )}
            <Button size="small" startIcon={<CloseOutlinedIcon sx={{ fontSize: 12 }} />} onClick={onDismiss}
              sx={{ fontSize: '0.65rem', py: 0.2, color: '#888', textTransform: 'none' }}>
              Bỏ qua
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { backgroundColor: '#1e1e2e', color: 'white', borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontSize: '1rem' }}>⚠️ Xác nhận xóa</DialogTitle>
        <DialogContent><DialogContentText sx={{ color: '#ccc' }}>Bạn có chắc không? Hành động này không thể hoàn tác.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#999' }}>Hủy</Button>
          <Button onClick={handleDelete} disabled={deleting} variant="contained" sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>
            {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════════════
const AdminChatBubble = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Ẩn trên dashboard
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/dashboard'

  // Auto-scroll (hooks phải luôn được gọi — không được đặt sau early return)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(async (text) => {
    const messageText = text || inputValue.trim()
    if (!messageText || isLoading) return

    const userMsg = { role: 'user', content: messageText, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendAdminMessageAPI({ message: messageText, history })
      const data = res.data

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

                      {/* Action Card */}
                      {msg.actionCard && (
                        <ActionCardCompact actionCard={msg.actionCard} onDismiss={() => handleDismissAction(idx)} />
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
    </>
  )
}

export default AdminChatBubble
