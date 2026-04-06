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
    const { productId, quantity } = req.body

    if (!productId) return res.status(400).json({ message: 'productId is required' })

    const cart = await cartService.addToCart(userId, productId, quantity)

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
    const { productId, quantity } = req.body

    if (!productId || quantity == null) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'productId and quantity are required' })
    }

    if (quantity < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Quantity must be at least 1' })
    }

    const cart = await cartService.updateQuantity(userId, productId, quantity)
    res.status(StatusCodes.OK).json(cart)
  } catch (err) {
    console.error("LỖI UPDATE QUANTITY:", err)
    next(err)
  }
}

const removeItem = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { productId } = req.body

    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'productId is required' })
    }

    const cart = await cartService.removeItem(userId, productId)
    res.status(StatusCodes.OK).json(cart)
  } catch (err) {
    console.error("LỖI REMOVE ITEM:", err)
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
