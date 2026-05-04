import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Backdrop,
  Fade
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useChat } from '~/context/Chat/useChat'

// ─── Tin nhắn chào mừng mặc định ───
const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Xin chào! Mình là trợ lý của Woman Basic 👗 Mình có thể giúp bạn tìm trang phục phù hợp hoặc tư vấn phong cách. Bạn đang tìm kiếm gì hôm nay?',
  timestamp: new Date().toISOString(),
  quickReplies: ['Tư vấn phong cách', 'Xem sản phẩm mới', 'Tìm đồ theo dịp']
}

// ─── Typing Indicator (3 chấm nhảy) ───
const TypingIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1.5, maxWidth: 80 }}>
    {[0, 1, 2].map(i => (
      <Box
        key={i}
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#b0b0b0',
          animation: 'chatBounce 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
          '@keyframes chatBounce': {
            '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
            '40%': { transform: 'scale(1)', opacity: 1 }
          }
        }}
      />
    ))}
  </Box>
)

// ─── Product Card (trong bubble) ───
const ProductCard = ({ product }) => (
  <Card
    sx={{
      minWidth: 140,
      maxWidth: 140,
      flexShrink: 0,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.06)',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-2px)' }
    }}
  >
    <CardMedia
      component="img"
      height="100"
      image={product.image || 'https://placehold.co/140x100/f8e8ee/d4a0b0?text=WB'}
      alt={product.name}
      sx={{ objectFit: 'cover' }}
    />
    <CardContent sx={{ p: 1, pb: '4px !important' }}>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.3,
          fontSize: '0.7rem'
        }}
      >
        {product.name}
      </Typography>
      <Typography variant="caption" color="error" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
        {Number(product.price).toLocaleString('vi-VN')}đ
      </Typography>
    </CardContent>
    <CardActions sx={{ p: 1, pt: 0 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<VisibilityIcon sx={{ fontSize: 12 }} />}
        component={Link}
        to={`/productdetail/${product._id}`}
        sx={{
          fontSize: '0.6rem',
          py: 0.2,
          px: 1,
          borderRadius: '8px',
          borderColor: '#e8a0b8',
          color: '#d4789c',
          textTransform: 'none',
          '&:hover': { borderColor: '#d4789c', backgroundColor: '#fdf2f6' }
        }}
      >
        Xem
      </Button>
    </CardActions>
  </Card>
)

// ─── Product Cards List (horizontal scroll) ───
const ProductCardsList = ({ products }) => {
  if (!products?.length) return null
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        py: 1,
        px: 0.5,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#e0c0d0',
          borderRadius: 2
        }
      }}
    >
      {products.map((product, idx) => (
        <ProductCard key={product._id || idx} product={product} />
      ))}
    </Box>
  )
}

// ─── Quick Reply Chips ───
const QuickReplyChips = ({ replies, onSelect }) => {
  if (!replies?.length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      {replies.map((reply, idx) => (
        <Chip
          key={idx}
          label={reply}
          size="small"
          variant="outlined"
          onClick={() => onSelect(reply)}
          sx={{
            fontSize: '0.7rem',
            height: 26,
            borderColor: '#e8a0b8',
            color: '#c07090',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#fdf2f6',
              borderColor: '#d4789c',
              transform: 'translateY(-1px)'
            }
          }}
        />
      ))}
    </Box>
  )
}

// ─── Markdown Table Renderer ───
const MarkdownTable = ({ tableData }) => {
  // Tách dòng, loại bỏ dòng trống
  const lines = tableData.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return <Typography sx={{ whiteSpace: 'pre-wrap' }}>{tableData}</Typography>

  // Hàm tách cell, xử lý cả trường hợp không có dấu | ở đầu/cuối
  const parseRow = (row) => {
    return row.split('|')
      .map(cell => cell.trim())
      .filter((cell, index, array) => {
        // Loại bỏ cell trống ở đầu và cuối do dấu | 
        if ((index === 0 || index === array.length - 1) && cell === '') return false
        return true
      })
  }
  
  const headers = parseRow(lines[0])
  // Tìm dòng separator (thường là dòng thứ 2)
  const separatorIdx = lines.findIndex(l => l.includes('---') && l.includes('|'))
  const dataRows = lines.filter((l, idx) => idx !== 0 && idx !== separatorIdx).map(parseRow)

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 1.5, 
        mb: 1.5, 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 15px rgba(212, 120, 156, 0.15)', // Đổ bóng màu hồng nhẹ
        border: '1.5px solid #e8a0b8', // Viền hồng rõ ràng hơn
        backgroundColor: 'white'
      }}
    >
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#fdf2f6' }}>
          <TableRow>
            {headers.map((h, i) => (
              <TableCell key={i} sx={{ fontWeight: 800, color: '#d4789c', fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #f0dce4' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRows.map((row, i) => (
            <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}>
              {row.map((cell, j) => (
                <TableCell key={j} sx={{ fontSize: '0.75rem', py: 1, color: '#444', borderBottom: '1px solid #f9f0f4' }}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// ─── Markdown Content Parser ───
const MarkdownContent = ({ content, onImageClick }) => {
  // 1. Xử lý SIZE_CHART tag
  const sizeChartRegex = /<!--SIZE_CHART::(.*?)-->/g
  const sizeChartMatch = content.match(sizeChartRegex)
  let cleanedContent = content

  const sizeChartUrls = []
  if (sizeChartMatch) {
    sizeChartMatch.forEach(tag => {
      const url = tag.replace('<!--SIZE_CHART::', '').replace('-->', '')
      if (url) sizeChartUrls.push(url)
      cleanedContent = cleanedContent.replace(tag, '')
    })
  }

  // 2. Xử lý Table Markdown (nếu còn)
  const lines = cleanedContent.split(/\r?\n/)
  const blocks = []
  let currentTable = []
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1]

    if (!inTable && line.includes('|') && nextLine?.includes('|') && nextLine?.includes('---')) {
      inTable = true
      currentTable.push(line)
    } else if (inTable) {
      if (line.includes('|')) {
        currentTable.push(line)
      } else {
        blocks.push({ type: 'table', content: currentTable.join('\n') })
        currentTable = []
        inTable = false
        if (line.trim()) blocks.push({ type: 'text', content: line })
      }
    } else {
      if (line.trim() || line === '') {
        blocks.push({ type: 'text', content: line })
      }
    }
  }
  if (inTable) blocks.push({ type: 'table', content: currentTable.join('\n') })

  return (
    <Box>
      {blocks.map((block, idx) => (
        block.type === 'table' ? (
          <MarkdownTable key={idx} tableData={block.content} />
        ) : (
          <Typography 
            key={idx} 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '0.85rem',
              mb: block.content === '' ? 0.5 : 0.2,
              minHeight: block.content === '' ? '0.5rem' : 'auto'
            }}
          >
            {block.content}
          </Typography>
        )
      ))}

      {/* Hiển thị Bảng Size dạng ảnh nếu có tag */}
      {sizeChartUrls.map((url, idx) => (
        <Box 
          key={idx} 
          onClick={() => onImageClick && onImageClick(url)}
          sx={{ 
            mt: 1.5, 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1.5px solid #e8a0b8', 
            boxShadow: '0 4px 12px rgba(232, 160, 184, 0.2)',
            cursor: 'zoom-in',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }}
        >
          <img 
            src={url} 
            alt="Size Chart" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </Box>
      ))}
    </Box>
  )
}

// ─── Message Bubble ───
const MessageBubble = ({ msg, onQuickReply, onImageClick }) => {
  const isUser = msg.role === 'user'
  const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 1
      }}
    >
      <Box sx={{ maxWidth: '85%' }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            backgroundColor: isUser ? '#e8a0b8' : '#f5f5f5',
            color: isUser ? 'white' : '#333',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            boxShadow: isUser
              ? '0 2px 8px rgba(232, 160, 184, 0.3)'
              : '0 1px 4px rgba(0,0,0,0.05)',
            ...(msg.isError && {
              backgroundColor: '#fff3f0',
              color: '#d32f2f',
              border: '1px solid #ffcdd2'
            })
          }}
        >
          {isUser ? (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
              {msg.content}
            </Typography>
          ) : (
            <MarkdownContent content={msg.content} onImageClick={onImageClick} />
          )}
        </Box>

        {/* Product Cards */}
        {msg.products?.length > 0 && (
          <ProductCardsList products={msg.products} />
        )}

        {/* Quick Replies */}
        {msg.quickReplies?.length > 0 && (
          <QuickReplyChips replies={msg.quickReplies} onSelect={onQuickReply} />
        )}

        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: isUser ? 'right' : 'left',
            color: '#aaa',
            fontSize: '0.65rem',
            mt: 0.3,
            px: 0.5
          }}
        >
          {time}
        </Typography>
      </Box>
    </Box>
  )
}

// ═══════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════════════
const CustomerChatWindow = () => {
  const {
    messages,
    isLoading,
    isMinimized,
    sendMessage,
    loadHistory,
    historyLoaded,
    minimizeChat,
    closeChat
  } = useChat()

  const [inputValue, setInputValue] = useState('')
  const [zoomImage, setZoomImage] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Merge welcome message nếu chưa có lịch sử
  const displayMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE]

  // Load history khi mount
  useEffect(() => {
    if (!historyLoaded) {
      loadHistory()
    }
  }, [loadHistory, historyLoaded])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Handle gửi message
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue.trim())
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue, isLoading, sendMessage])

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle quick reply click
  const handleQuickReply = useCallback((text) => {
    if (isLoading) return
    sendMessage(text)
  }, [isLoading, sendMessage])

  return (
    <>
      <Slide direction="up" in mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 0, sm: 90 },
          right: { xs: 0, sm: 24 },
          width: { xs: '100%', sm: 360 },
          height: { xs: '100%', sm: isMinimized ? 'auto' : 520 },
          maxHeight: { xs: '100dvh', sm: 520 },
          borderRadius: { xs: 0, sm: '20px' },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.1)',
          zIndex: 1300,
          backgroundColor: 'white'
        }}
      >
        {/* ─── Header ─── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            background: 'linear-gradient(135deg, #e8a0b8 0%, #d4789c 100%)',
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={isMinimized ? minimizeChat : undefined}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Woman Basic Assistant
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4cff88' }} />
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.65rem' }}>
                Online
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={minimizeChat} sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={closeChat} sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ─── Message Area (ẩn khi minimize) ─── */}
        {!isMinimized && (
          <>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                py: 2,
                backgroundColor: '#fafafa',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#e0c0d0',
                  borderRadius: 2
                }
              }}
            >
              {displayMessages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  msg={msg}
                  onQuickReply={handleQuickReply}
                  onImageClick={setZoomImage}
                />
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 1, mb: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '16px 16px 16px 4px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <TypingIndicator />
                  </Box>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* ─── Input Area ─── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
                p: 1.5,
                borderTop: '1px solid #f0e0e8',
                backgroundColor: 'white'
              }}
            >
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={3}
                size="small"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về sản phẩm, phong cách..."
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    fontSize: '0.85rem',
                    backgroundColor: '#faf5f8',
                    '& fieldset': { borderColor: '#f0dce4' },
                    '&:hover fieldset': { borderColor: '#e8a0b8' },
                    '&.Mui-focused fieldset': { borderColor: '#d4789c' }
                  }
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                sx={{
                  backgroundColor: '#e8a0b8',
                  color: 'white',
                  width: 38,
                  height: 38,
                  '&:hover': { backgroundColor: '#d4789c' },
                  '&.Mui-disabled': { backgroundColor: '#f0dce4', color: '#ccc' },
                  transition: 'all 0.2s'
                }}
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Slide>

    {/* Modal Zoom Ảnh - Đưa ra ngoài Slide để tránh lỗi MUI Transition */}
    <Modal
      open={Boolean(zoomImage)}
      onClose={() => setZoomImage(null)}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }
        }
      }}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
    >
      <Fade in={Boolean(zoomImage)}>
        <div style={{ outline: 'none' }}>
          <Box sx={{ position: 'relative', maxWidth: '95vw', maxHeight: '95vh' }}>
            <IconButton
              onClick={() => setZoomImage(null)}
              sx={{
                position: 'absolute',
                top: -40,
                right: 0,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>
            {zoomImage && (
              <img
                src={zoomImage}
                alt="Zoomed Chart"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '90vh',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  display: 'block'
                }}
              />
            )}
          </Box>
        </div>
      </Fade>
    </Modal>
  </>
)
}

export default CustomerChatWindow
