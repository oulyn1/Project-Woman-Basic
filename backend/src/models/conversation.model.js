import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    actionType: {
      type: String,
      enum: ['query', 'suggest_delete', 'suggest_edit', null],
      default: null
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }
}, { _id: false })

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    default: null,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  messages: [messageSchema]
}, {
  timestamps: true,
  collection: 'conversations'
})

// Compound index for efficient lookups
conversationSchema.index({ sessionId: 1, role: 1 })
conversationSchema.index({ userId: 1, role: 1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

export const conversationModel = {
  CONVERSATION_COLLECTION_NAME: 'conversations',

  /**
   * Tìm hoặc tạo conversation mới cho customer (theo sessionId)
   */
  findOrCreateCustomerConversation: async (sessionId) => {
    let conversation = await Conversation.findOne({ sessionId, role: 'customer' })
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        role: 'customer',
        messages: []
      })
    }
    return conversation
  },

  /**
   * Tìm hoặc tạo conversation mới cho admin (theo userId)
   */
  findOrCreateAdminConversation: async (userId) => {
    let conversation = await Conversation.findOne({ userId, role: 'admin' })
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        role: 'admin',
        messages: []
      })
    }
    return conversation
  },

  /**
   * Thêm message vào conversation
   */
  pushMessage: async (conversationId, messageData) => {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { messages: messageData } },
      { returnDocument: 'after' }
    )
  },

  /**
   * Lấy conversation theo sessionId (customer)
   */
  getBySessionId: async (sessionId) => {
    return await Conversation.findOne({ sessionId, role: 'customer' })
  },

  /**
   * Lấy conversation theo userId (admin)
   */
  getByUserId: async (userId) => {
    return await Conversation.findOne({ userId, role: 'admin' })
  },

  /**
   * Xóa lịch sử chat theo sessionId
   */
  clearBySessionId: async (sessionId) => {
    return await Conversation.findOneAndUpdate(
      { sessionId, role: 'customer' },
      { $set: { messages: [] } },
      { returnDocument: 'after' }
    )
  },

  /**
   * Xóa lịch sử chat theo userId (admin)
   */
  clearByUserId: async (userId) => {
    return await Conversation.findOneAndUpdate(
      { userId, role: 'admin' },
      { $set: { messages: [] } },
      { returnDocument: 'after' }
    )
  },

  /**
   * Lấy tất cả conversations của admin (cho sidebar lịch sử)
   */
  getAllAdminConversations: async (userId) => {
    return await Conversation.find({ userId, role: 'admin' }).sort({ updatedAt: -1 })
  }
}

export default Conversation
