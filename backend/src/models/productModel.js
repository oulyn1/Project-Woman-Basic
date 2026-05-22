import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL'], required: true },
  color: {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ }
  },
  stock: { type: Number, required: true, min: 0 },
  sku: { type: String, required: true, trim: true }
})

const productSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, minLength: 3, maxLength: 255, trim: true },
  slug: { type: String, required: true, minLength: 3, trim: true, unique: true },
  description: { type: String, required: true, minLength: 3, maxLength: 10000, trim: true },
  price: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0, min: 0 },
  images: [{ type: String, required: true }],
  tags: [{ type: String, trim: true }],
  material: { type: String, trim: true, default: '' },
  variants: [variantSchema],
  sizeChart: { type: String, default: '' },
  sizeGuide: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  // === Recommendation Engine stats ===
  // Dùng atomic $inc khi update — không dùng .save()
  stats: {
    viewCount:      { type: Number, default: 0 },
    addToCartCount: { type: Number, default: 0 },
    purchaseCount:  { type: Number, default: 0 },
    // totalScore = viewCount*1 + addToCartCount*5 + purchaseCount*10
    totalScore:     { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'products'
})

// Text indexes for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' })
productSchema.index({ slug: 1, isDeleted: 1 }) // Optimize for slug lookups

const Product = mongoose.model('Product', productSchema)

export const productModel = {
  PRODUCT_COLLECTION_NAME: 'products',
  
  createNew: async (data) => {
    return await Product.create(data)
  },

  findOneId: async (id) => {
    return await Product.findById(id)
  },

  getDetails: async (id) => {
    return await Product.findById(id)
  },

  findManyByIds: async (ids) => {
    return await Product.find({ _id: { $in: ids } }).lean()
  },

  getDetailsBySlug: async (slug) => {
    return await Product.findOne({ slug, isDeleted: { $ne: true } })
  },

  findWithPagination: async ({ filter, sort, page, limit }) => {
    const query = { ...filter, isDeleted: { $ne: true } }
    const skip = (page - 1) * limit
    const products = await Product.find(query).sort(sort).skip(skip).limit(limit).lean()
    const total = await Product.countDocuments(query)
    return { products, total }
  },

  updateOne: async (id, data) => {
    return await Product.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' })
  },

  updateVariantStock: async (productId, variantId, quantity) => {
    return await Product.findOneAndUpdate(
      {
        _id: productId,
        variants: {
          $elemMatch: {
            _id: variantId,
            stock: { $gte: quantity }
          }
        }
      },
      {
        $inc: {
          "variants.$.stock": -quantity,
          sold: quantity
        }
      },
      { returnDocument: 'after' }
    )
  },

  softDelete: async (productId) => {
    return await Product.findByIdAndUpdate(
      productId,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { returnDocument: 'after' }
    )
  }
}

export default Product