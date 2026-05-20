import React from 'react'
import { Box, Fab } from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import { useChat } from '~/context/Chat/useChat'
import CustomerChatWindow from './CustomerChatWindow'

const CustomerChatBubble = () => {
  const { isOpen, toggleChat } = useChat()

  return (
    <>
      {/* Chat Window */}
      {isOpen && <CustomerChatWindow />}

      {/* FAB Button - Chỉ hiển thị khi chat đóng */}
      {!isOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 90, md: 24 },
            right: 24,
            zIndex: 2147483647 // Đảm bảo đè lên Header (nếu bị che)
          }}
        >
          <Fab
            onClick={toggleChat}
            aria-label="Chat với Woman Basic"
            sx={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #f0b8cc 0%, #e8a0b8 50%, #d4789c 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(212, 120, 156, 0.4), 0 2px 8px rgba(232, 160, 184, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #e8a0b8 0%, #d4789c 50%, #c06888 100%)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 28px rgba(212, 120, 156, 0.5)'
              },
              // Animation rung nhẹ 1 lần sau 3 giây
              animation: 'chatBubbleWiggle 0.6s ease-in-out 3s 1',
              '@keyframes chatBubbleWiggle': {
                '0%': { transform: 'rotate(0deg)' },
                '15%': { transform: 'rotate(-12deg) scale(1.1)' },
                '30%': { transform: 'rotate(10deg) scale(1.1)' },
                '45%': { transform: 'rotate(-8deg)' },
                '60%': { transform: 'rotate(6deg)' },
                '75%': { transform: 'rotate(-3deg)' },
                '100%': { transform: 'rotate(0deg)' }
              }
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 24 }} />
          </Fab>

          {/* Tooltip nhỏ khi chưa mở */}
          <Box
            sx={{
              position: 'absolute',
              right: 64,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              borderRadius: '12px',
              px: 1.5,
              py: 0.8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              color: '#666',
              fontWeight: 500,
              animation: 'chatTooltipFade 0.4s ease-in-out 3.6s both',
              '@keyframes chatTooltipFade': {
                '0%': { opacity: 0, transform: 'translateY(-50%) translateX(8px)' },
                '100%': { opacity: 1, transform: 'translateY(-50%) translateX(0)' }
              },
              // Mũi tên nhỏ
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -5,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '5px solid white'
              }
            }}
          >
            Cần tư vấn? 💬
          </Box>
        </Box>
      )}
    </>
  )
}

export default CustomerChatBubble
