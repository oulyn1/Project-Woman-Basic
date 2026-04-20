import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const cart = await cartService.getCart(userId)
    return res.status(StatusCodes.OK).json(cart)
  } catch (err) {
    console.error("LỖI GET CART:", err)
    next(err)
  }
}

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { productId, variantId, quantity } = req.body

    if (!productId || !variantId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'productId and variantId are required' })
    }

    const cart = await cartService.addToCart(userId, productId, variantId, quantity)

    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart 
    })
  } catch (err) {
    next(err)
  }
}

const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { productId, variantId, quantity } = req.body

    if (!productId || !variantId || quantity == null) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'productId, variantId and quantity are required' })
    }

    const cart = await cartService.updateQuantity(userId, productId, variantId, quantity)
    res.status(StatusCodes.OK).json({ success: true, data: cart })
  } catch (err) {
    next(err)
  }
}

const removeItem = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { productId, variantId } = req.body

    if (!productId || !variantId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'productId and variantId are required' })
    }

    const cart = await cartService.removeItem(userId, productId, variantId)
    res.status(StatusCodes.OK).json({ success: true, data: cart })
  } catch (err) {
    next(err)
  }
}

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const cart = await cartService.clearCart(userId)
    res.status(StatusCodes.OK).json(cart)
  } catch (err) {
    console.error("LỖI CLEAR CART:", err)
    next(err)
  }
}

// Admin
const getAllCarts = async (req, res, next) => {
  try {
    const carts = await cartService.getAllCarts()
    res.status(StatusCodes.OK).json(carts)
  } catch (err) {
    console.error("LỖI GET ALL CARTS:", err)
    next(err)
  }
}

const deleteCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId

    if (!cartId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'cartId is required' })
    }

    const result = await cartService.deleteCart(cartId)
    res.status(StatusCodes.OK).json({ message: 'Cart deleted', deletedCount: result.deletedCount || 1 })
  } catch (err) {
    console.error("LỖI DELETE CART:", err)
    next(err)
  }
}

export const cartController = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
  getAllCarts,
  deleteCart
}
