   import mongoose from 'mongoose'

const guestBehaviorEventSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  action:     { type: String, enum: ['view', 'add_to_cart', 'purchase'] },
  score:      { type: Number },
  createdAt:  { type: Date, default: Date.now }
}, { _id: false })

const guestBehaviorSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  categoryScores: {
    type: Map,
    of: Number,
    default: {}
  },
  behaviorEvents: [guestBehaviorEventSchema],
  createdAt: { type: Date, default: Date.now },
  expireAt:  {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}, {
  collection: 'guest_behaviors'
})

// TTL index — MongoDB tự xóa document sau khi expireAt
guestBehaviorSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

const GuestBehavior = mongoose.model('GuestBehavior', guestBehaviorSchema)
export default GuestBehavior
