import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  color: { type: String, default: '' },
  size: { type: String, default: '' }
}, { _id: false })

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema]
}, {
  timestamps: true,
  collection: 'carts'
})

const Cart = mongoose.model('Cart', cartSchema)

export const cartModel = {
  CART_COLLECTION_NAME: 'carts',
  
  createNew: async (data) => {
    return await Cart.create(data)
  },

  findByUserId: async (userId) => {
    // Populate product details
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price images slug variants')
    if (!cart) return null

    // Transform for backward compatibility with the complex aggregate result
    const cartObj = cart.toObject()
    cartObj.items = cartObj.items.map(item => {
      const product = item.productId
      const variant = (product?.variants && item.variantId) 
        ? product.variants.find(v => v._id.toString() === item.variantId.toString())
        : null
      
      return {
        productId: product?._id || item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        color: item.color || variant?.color?.name || variant?.color || '',
        size: item.size || variant?.size || '',
        product: product ? {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          slug: product.slug
        } : null,
        variant: variant || null
      }
    })
    return cartObj
  },

  addToCart: async (userId, productId, variantId, quantity = 1, color = '', size = '') => {
    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, variantId, quantity, color, size }]
      })
    } else {
      const index = cart.items.findIndex(
        i => i.productId.toString() === productId.toString() && i.variantId.toString() === variantId.toString()
      )
      if (index >= 0) {
        cart.items[index].quantity += quantity
        if (color) cart.items[index].color = color
        if (size) cart.items[index].size = size
      } else {
        cart.items.push({ productId, variantId, quantity, color, size })
      }
      await cart.save()
    }
    return await cartModel.findByUserId(userId)
  },

  updateQuantity: async (userId, productId, variantId, quantity) => {
    const cart = await Cart.findOne({ userId })
    if (!cart) throw new Error('Cart not found')

    const index = cart.items.findIndex(
      i => i.productId.toString() === productId.toString() && i.variantId.toString() === variantId.toString()
    )
    if (index < 0) throw new Error('Item not in cart')
    
    cart.items[index].quantity = quantity
    await cart.save()
    return await cartModel.findByUserId(userId)
  },

  removeItem: async (userId, productId, variantId) => {
    const result = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId, variantId } } },
      { new: true }
    )
    return await cartModel.findByUserId(userId)
  },

  clearCart: async (userId) => {
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } })
    return await cartModel.findByUserId(userId)
  },

  getAll: async () => {
    return await Cart.find()
  },

  deleteOne: async (id) => {
    return await Cart.findByIdAndDelete(id)
  }
}

export default Cart