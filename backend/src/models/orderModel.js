import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  originalPrice: { type: Number, default: 0 },
  price: { type: Number, required: true, min: 0 }, // This is finalPrice
  quantity: { type: Number, required: true, min: 1 },
  appliedPromoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  buyerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [orderItemSchema],
  originalSubtotal: { type: Number, default: 0 },
  totalItemDiscount: { type: Number, default: 0 },
  orderDiscount: { type: Number, default: 0 },
  appliedOrderPromoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'orders'
})

const Order = mongoose.model('Order', orderSchema)

export const orderModel = {
  ORDER_COLLECTION_NAME: 'orders',
  
  createNew: async (data) => {
    return await Order.create(data)
  },

  getDetails: async (id) => {
    return await Order.findById(id)
  },

  getDetailsWithProducts: async (id) => {
    const order = await Order.findById(id).populate('items.productId')
    if (!order) return null
    
    const orderObj = order.toObject()
    orderObj.items = orderObj.items.map(item => {
      const product = item.productId
      const variant = (product?.variants && item.variantId) 
        ? product.variants.find(v => v._id.toString() === item.variantId.toString())
        : null
      return {
        ...item,
        productId: product?._id || item.productId,
        product: product || null,
        variant: variant || null
      }
    })
    return orderObj
  },

  getAllWithProducts: async (filter = {}) => {
    const orders = await Order.find(filter).populate('items.productId').sort({ createdAt: -1 })
    return orders.map(order => {
      const orderObj = order.toObject()
      orderObj.items = orderObj.items.map(item => {
        const product = item.productId
        const variant = (product?.variants && item.variantId) 
          ? product.variants.find(v => v._id.toString() === item.variantId.toString())
          : null
        return {
          ...item,
          productId: product?._id || item.productId,
          product: product || null,
          variant: variant || null
        }
      })
      return orderObj
    })
  },

  getAll: async (filter = {}) => {
    return await Order.find(filter).sort({ createdAt: -1 })
  },

  deleteOne: async (id) => {
    return await Order.findByIdAndDelete(id)
  },

  search: async (query) => {
    const regex = new RegExp(query, 'i')
    return await Order.find({
      $or: [
        { 'buyerInfo.name': regex },
        { 'buyerInfo.email': regex },
        { status: regex }
      ]
    })
  },

  updateOne: async (id, data) => {
    return await Order.findByIdAndUpdate(id, { $set: data }, { new: true })
  },

  searchByUser: async (userId, query) => {
    const regex = new RegExp(query, 'i')
    return await Order.find({
      userId,
      $or: [
        { 'buyerInfo.name': regex },
        { 'buyerInfo.email': regex },
        { status: regex }
      ]
    })
  },

  countDocuments: async (filter) => {
    return await Order.countDocuments(filter)
  }
}

export default Order
