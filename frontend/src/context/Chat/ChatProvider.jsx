import React, { useState, useCallback } from 'react'
import ChatContext from './ChatContext'
import {
  sendCustomerMessageAPI,
  sendAdminMessageAPI,
  getChatHistoryAPI,
  clearChatHistoryAPI
} from '~/apis/chat.api'

/**
 * ChatProvider — quản lý state chat global.
 * Props:
 *   - mode: 'customer' | 'admin' — xác định loại chat
 *   - children: React nodes
 */
const ChatProvider = ({ children, mode = 'customer' }) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [error, setError] = useState(null)

  const sessionIdRef = React.useRef(null)

  // SessionId cho customer — tạo mới mỗi khi reload trang (không lưu vào storage)
  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      // Tạo UUID v4 đơn giản không cần thư viện
      sessionIdRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
    return sessionIdRef.current
  }, [])

  /**
   * Load lịch sử chat từ API
   */
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    try {
      const params = mode === 'customer' ? { sessionId: getSessionId() } : {}
      const res = await getChatHistoryAPI(params)
      if (res.success && res.data?.messages?.length > 0) {
        setMessages(res.data.messages)
      }
      setHistoryLoaded(true)
    } catch {
      // Silent fail — không có lịch sử cũng ok
      setHistoryLoaded(true)
    }
  }, [mode, getSessionId, historyLoaded])

  /**
   * Gửi tin nhắn
   */
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText?.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    }

    // Thêm message của user vào UI ngay lập tức
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      // Chuẩn bị history (chỉ role + content)
      const history = messages.map(m => ({ role: m.role, content: m.content }))

      let result
      if (mode === 'customer') {
        const res = await sendCustomerMessageAPI({
          sessionId: getSessionId(),
          message: messageText.trim(),
          history
        })
        result = res.data
      } else {
        const res = await sendAdminMessageAPI({
          message: messageText.trim(),
          history
        })
        result = res.data
      }

      // Thêm response của assistant
      const assistantMessage = {
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toISOString(),
        // Lưu thêm parsed data để UI render
        products: result.products || [],
        quickReplies: result.quickReplies || [],
        actionCard: result.actionCard || null
      }

      setMessages(prev => [...prev, assistantMessage])
      return result
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      setError(errorMsg)

      // Thêm error message vào chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }, [mode, messages, isLoading, getSessionId])

  /**
   * Xóa lịch sử chat
   */
  const clearHistory = useCallback(async () => {
    try {
      const params = mode === 'customer' ? { sessionId: getSessionId() } : {}
      await clearChatHistoryAPI(params)
      setMessages([])
      setHistoryLoaded(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa lịch sử')
    }
  }, [mode, getSessionId])

  /**
   * Toggle mở/đóng chat
   */
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      const newOpen = !prev
      if (newOpen) {
        setIsMinimized(false)
      }
      return newOpen
    })
  }, [])

  /**
   * Minimize/expand chat window
   */
  const minimizeChat = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  /**
   * Đóng chat
   */
  const closeChat = useCallback(() => {
    setIsOpen(false)
    setIsMinimized(false)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isOpen,
        isMinimized,
        error,
        historyLoaded,
        sessionId: mode === 'customer' ? getSessionId() : null,
        mode,
        sendMessage,
        loadHistory,
        clearHistory,
        toggleChat,
        minimizeChat,
        closeChat,
        setError
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export default ChatProvider
