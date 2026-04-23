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
  variants: [variantSchema],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'products'
})

// Text indexes for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' })

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

  getDetailsBySlug: async (slug) => {
    return await Product.findOne({ slug, isDeleted: { $ne: true } })
  },

  findWithPagination: async ({ filter, sort, page, limit }) => {
    const query = { ...filter, isDeleted: { $ne: true } }
    const skip = (page - 1) * limit
    const products = await Product.find(query).sort(sort).skip(skip).limit(limit)
    const total = await Product.countDocuments(query)
    return { products, total }
  },

  updateOne: async (id, data) => {
    return await Product.findByIdAndUpdate(id, { $set: data }, { new: true })
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
      { new: true }
    )
  },

  softDelete: async (productId) => {
    return await Product.findByIdAndUpdate(
      productId,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    )
  }
}

export default Product