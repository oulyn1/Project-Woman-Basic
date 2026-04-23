import mongoose from 'mongoose'

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  type: { type: String, enum: ['product', 'order'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  discountType: { type: String, enum: ['percent', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },

  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },   // null = vĩnh viễn
  isForever: { type: Boolean, default: false },

  // Chỉ dùng khi type = 'product'
  productIds: { type: [String], default: [] }, // ['ALL'] hoặc ['id1','id2',...]

  // Chỉ dùng khi type = 'order'
  minOrderValue: { type: Number, default: 0 },
  maxUsageTotal: { type: Number, default: 0 },   // 0 = không giới hạn
  maxUsagePerCustomer: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },      // tổng số lần đã dùng

  condition: {
    type: { type: String, enum: ['all', 'new', 'loyal', 'specific'], default: 'all' },
    newCustomerMaxOrders: { type: Number, default: null },
    loyalTiers: { type: [String], enum: ['Silver', 'Gold', 'Platinum'], default: [] },
    specificCustomerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Changed ref to User since we use users collection
  }
}, {
  timestamps: true,
  collection: 'promotions'
})

const Promotion = mongoose.model('Promotion', promotionSchema)

export default Promotion
