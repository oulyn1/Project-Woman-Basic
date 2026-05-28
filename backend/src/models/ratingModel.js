import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  image: { type: String, default: '' },
  star: { type: Number, required: true, min: 1, max: 5 },
  description: { type: String, required: true, maxLength: 500 }
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Ratings usually only have createdAt
  collection: 'ratings'
})

// Unique index for (userId, orderId, productId)
ratingSchema.index({ userId: 1, orderId: 1, productId: 1 }, { unique: true, sparse: true })

const Rating = mongoose.model('Rating', ratingSchema)

export const ratingModel = {
  RATING_COLLECTION_NAME: 'ratings',
  
  createNew: async (data) => {
    const doc = await Rating.create(data)
    // Trả về object có insertedId để tương thích với controller
    return { insertedId: doc._id, ...doc.toObject() }
  },

  getAll: async () => {
    return await Rating.find()
  },

  searchByProductName: async (productName) => {
    const regex = new RegExp(productName, 'i')
    return await Rating.find({ productName: regex })
  },

  findOneId: async (id) => {
    return await Rating.findById(id)
  },

  updateOne: async (id, updateData) => {
    return await Rating.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
  },

  deleteOne: async (id) => {
    return await Rating.findByIdAndDelete(id)
  },

  findByProductId: async (productId) => {
    // Dùng native collection để bypass Mongoose schema casting.
    // Mongoose tự cast string -> ObjectId khi dùng Rating.find(),
    // nên data cũ lưu dạng string sẽ không match. Native driver không cast.
    let pid
    try { pid = new ObjectId(productId) } catch { pid = null }
    const orConditions = pid
      ? [{ productId: pid }, { productId: productId.toString() }]
      : [{ productId: productId.toString() }]
    const results = await Rating.collection
      .find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .toArray()
    return results
  },

  findByUserProduct: async (userId, productId) => {
    return await Rating.findOne({ userId, productId })
  },

  findByComposite: async (userId, orderId, productId) => {
    const query = { userId, productId }
    if (orderId) query.orderId = orderId
    else query.orderId = null
    return await Rating.findOne(query)
  }
}

export default Rating
