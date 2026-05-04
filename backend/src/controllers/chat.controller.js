import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { customerChatService } from '~/services/customerChat.service'
import { adminChatService } from '~/services/adminChat.service'
import { conversationModel } from '~/models/conversation.model'

/**
 * POST /v1/chat/customer
 * Body: { sessionId, message, history }
 * Không cần auth — dành cho khách vãng lai
 */
const customerChat = async (req, res, next) => {
  try {
    const { sessionId, message, history } = req.body

    if (!sessionId || !message) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'sessionId và message là bắt buộc')
    }

    const result = await customerChatService.sendCustomerMessage({
      sessionId,
      message,
      history: history || []
    })

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /v1/chat/admin
 * Body: { message, history }
 * Yêu cầu auth + role admin
 */
const adminChat = async (req, res, next) => {
  try {
    const { message, history } = req.body
    const adminId = req.user?.userId

    if (!adminId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không xác định được admin')
    }

    if (!message) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'message là bắt buộc')
    }

    // Kiểm tra role admin
    if (req.user?.role !== 'admin') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ admin mới có quyền sử dụng chức năng này')
    }

    const result = await adminChatService.sendAdminMessage({
      adminId,
      message,
      history: history || []
    })

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /v1/chat/history
 * Query: ?sessionId= (cho customer) hoặc dùng req.user (cho admin)
 */
const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query

    let conversation = null

    if (sessionId) {
      // Customer — lấy theo sessionId
      conversation = await conversationModel.getBySessionId(sessionId)
    } else if (req.user) {
      // Admin — lấy theo userId
      const adminId = req.user.userId
      conversation = await conversationModel.getByUserId(adminId)
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cần sessionId (customer) hoặc đăng nhập (admin)')
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        messages: conversation?.messages || [],
        conversationId: conversation?._id || null
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /v1/chat/history
 * Query: ?sessionId= (cho customer) hoặc dùng req.user (cho admin)
 */
const clearChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query

    if (sessionId) {
      // Customer — xóa theo sessionId
      await conversationModel.clearBySessionId(sessionId)
    } else if (req.user) {
      // Admin — xóa theo userId
      const adminId = req.user.userId
      await conversationModel.clearByUserId(adminId)
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cần sessionId (customer) hoặc đăng nhập (admin)')
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xóa lịch sử chat thành công'
    })
  } catch (error) {
    next(error)
  }
}

export const chatController = {
  customerChat,
  adminChat,
  getChatHistory,
  clearChatHistory
}
