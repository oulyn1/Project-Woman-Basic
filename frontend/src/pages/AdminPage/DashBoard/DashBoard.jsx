import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box, Typography, TextField, IconButton, Avatar, Chip, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Divider, CircularProgress
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useNavigate } from 'react-router-dom'
import { sendAdminMessageAPI, getChatHistoryAPI, clearChatHistoryAPI } from '~/apis/chat.api'
import { deleteProductAPI } from '~/apis/productAPIs'

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

// ─── Action Card ───
const ActionCard = ({ ac, onDismiss }) => {
  const nav = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!ac) return null
  const isDel = ac.type === 'delete'

  const handleDelete = async () => {
    setBusy(true)
    try {
      if (ac.entity === 'product' && ac.data?._id) await deleteProductAPI(ac.data._id)
    } catch { /* */ }
    setBusy(false); setConfirmOpen(false); onDismiss()
  }

  return (
    <>
      <Card sx={{ mt: 1.5, borderRadius: '14px', border: `1px solid ${isDel ? '#ff634740' : '#42a5f540'}`, backgroundColor: isDel ? '#1e1215' : '#121a28', overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1, backgroundColor: isDel ? '#ff634718' : '#42a5f518', display: 'flex', alignItems: 'center', gap: 1 }}>
          {isDel ? <WarningAmberIcon sx={{ fontSize: 16, color: '#ff6347' }} /> : <InfoOutlinedIcon sx={{ fontSize: 16, color: '#42a5f5' }} />}
          <Typography variant="caption" fontWeight={700} sx={{ color: isDel ? '#ff8a75' : '#7ec8f5' }}>
            {isDel ? 'Xác nhận xóa' : 'Xác nhận chỉnh sửa'}
          </Typography>
        </Box>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {ac.data?.image && (
            <Box component="img" src={ac.data.image} alt="" sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '10px', mb: 1, border: '1px solid #2a3040' }} />
          )}
          <Typography variant="body2" sx={{ color: '#ccc', mb: 0.5 }}>
            {ac.data?.name || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#888' }}>
            {ac.data?.price ? `${Number(ac.data.price).toLocaleString('vi-VN')}đ` : ''}
            {ac.data?.stock != null ? ` • Kho: ${ac.data.stock}` : ''}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#999', mt: 1, fontStyle: 'italic' }}>
            {ac.confirmMessage || ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 14 }} />}
              onClick={() => { nav('/admin/product'); onDismiss() }}
              sx={{ fontSize: '0.72rem', borderColor: '#42a5f540', color: '#7ec8f5', textTransform: 'none', borderRadius: '8px' }}>
              Chỉnh sửa
            </Button>
            {isDel && (
              <Button size="small" variant="contained" startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                onClick={() => setConfirmOpen(true)}
                sx={{ fontSize: '0.72rem', backgroundColor: '#d32f2f', textTransform: 'none', borderRadius: '8px', '&:hover': { backgroundColor: '#b71c1c' } }}>
                Xóa
              </Button>
            )}
            <Button size="small" startIcon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />} onClick={onDismiss}
              sx={{ fontSize: '0.72rem', color: '#666', textTransform: 'none' }}>
              Bỏ qua
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { backgroundColor: '#1a1e2e', color: '#eee', borderRadius: '16px' } }}>
        <DialogTitle>⚠️ Xác nhận xóa</DialogTitle>
        <DialogContent><DialogContentText sx={{ color: '#aaa' }}>Bạn có chắc không? Hành động này không thể hoàn tác.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#999' }}>Hủy</Button>
          <Button onClick={handleDelete} disabled={busy} variant="contained" sx={{ backgroundColor: '#d32f2f' }}>{busy ? 'Đang xóa...' : 'Xóa'}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ═══════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════
const Dashboard = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const autoTriggered = useRef(false)

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  // Load history + auto-trigger
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getChatHistoryAPI()
        if (res.success && res.data?.messages?.length > 0) {
          setMessages(res.data.messages)
          setHistoryLoaded(true)
          return // Đã có history → không auto-trigger
        }
      } catch { /* */ }
      setHistoryLoaded(true)
      // Auto-trigger: gửi tóm tắt hôm nay
      if (!autoTriggered.current) {
        autoTriggered.current = true
        sendMsg('Tóm tắt nhanh tình hình hôm nay cho tôi')
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMsg = useCallback(async (text) => {
    const t = text || inputValue.trim()
    if (!t || isLoading) return
    const userMsg = { role: 'user', content: t, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendAdminMessageAPI({ message: t, history })
      const d = res.data
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
    try { await clearChatHistoryAPI() } catch { /* */ }
    setMessages([]); setClearDialogOpen(false); autoTriggered.current = false
  }

  const dismissAction = (idx) => setMessages(prev => prev.map((m, i) => i === idx ? { ...m, actionCard: null } : m))

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>Lịch sử chat</Typography>
          <IconButton size="small" onClick={() => setClearDialogOpen(true)} sx={{ color: '#888', '&:hover': { color: '#ff6347' } }}>
            <DeleteSweepIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#2a3040', borderRadius: 2 } }}>
          {Object.keys(grouped).length === 0 && (
            <Typography variant="caption" sx={{ color: '#555', display: 'block', textAlign: 'center', mt: 4 }}>Chưa có lịch sử</Typography>
          )}
          {Object.entries(grouped).map(([date, msgs]) => (
            <Box key={date} sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, px: 1, display: 'block', mb: 0.5 }}>{date}</Typography>
              {msgs.filter(m => m.role === 'user').slice(-3).map((m, i) => (
                <Box key={i} sx={{
                  px: 1.5, py: 1, mb: 0.5, borderRadius: '10px', cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.02)', transition: 'all 0.2s',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' }
                }}>
                  <Typography variant="caption" sx={{ color: '#aaa', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.72rem' }}>
                    {m.content}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#555', fontSize: '0.6rem' }}>
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Typography>
                </Box>
              ))}
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

                  {m.actionCard && <ActionCard ac={m.actionCard} onDismiss={() => dismissAction(idx)} />}

                  {m.quickReplies?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {m.quickReplies.map((r, ri) => (
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
