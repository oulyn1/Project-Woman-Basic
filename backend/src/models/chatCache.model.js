import mongoose from 'mongoose'

const chatCacheSchema = new mongoose.Schema({
  normalizedQuestion: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalQuestion: String,
  answer: {
    type: String,
    required: true
  },
  products: [mongoose.Schema.Types.Mixed],
  quickReplies: [String]
}, {
  timestamps: true,
  collection: 'chat_caches'
})

const ChatCache = mongoose.model('ChatCache', chatCacheSchema)
export default ChatCache
