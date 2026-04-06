import { cartModel } from '~/models/cartModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const getCart = async (userId) => {
  try {
    const cart = await cartModel.findByUserId(userId)
    if (!cart) {
      return {
        _id: null,
        userId,
        items: [],
        createdAt: null,
        updatedAt: null
      }
    }
    return cart
  } catch (error) {
    console.error("LỖI KHI LẤY CART:", error)
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get cart')
  }
}

const addToCart = async (userId, productId, quantity = 1) => {
  if (quantity < 1) throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity must be at least 1')
  try {
    const cart = await cartModel.addToCart(userId, productId, quantity)
    return cart
  } catch (error) {
    console.error("LỖI KHI THÊM VÀO CART:", error)
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Failed to add to cart')
  }
}


const updateQuantity = async (userId, productId, quantity) => {
  if (quantity < 1) throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity must be at least 1')
  try {
    return await cartModel.updateQuantity(userId, productId, quantity)
  } catch (error) {
    console.error("LỖI KHI CẬP NHẬT QUANTITY:", error)
    throw new ApiError(StatusCodes.NOT_FOUND, error.message || 'Product not found in cart')
  }
}

const removeItem = async (userId, productId) => {
  try {
    return await cartModel.removeItem(userId, productId)
  } catch (error) {
    console.error("LỖI KHI XÓA ITEM:", error)
    throw new ApiError(StatusCodes.NOT_FOUND, error.message || 'Product not found in cart')
  }
}

const clearCart = async (userId) => {
  try {
    const result = await cartModel.clearCart(userId)
    if (!result) throw new Error("Cart not found")
    return result
  } catch (error) {
    console.error("LỖI KHI CLEAR CART:", error)
    throw new ApiError(StatusCodes.NOT_FOUND, error.message || 'Cart not found')
  }
}

const getAllCarts = async () => {
  try {
    const carts = await cartModel.getAll()
    if (!carts || carts.length === 0) {
      return [] 
    }
    return carts
  } catch (error) {
    console.error("LỖI KHI LẤY TẤT CẢ CARTS:", error)
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get carts')
  }
}

const deleteCart = async (cartId) => {
  try {
    const result = await cartModel.deleteOne(cartId)
    if (!result || result.deletedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found')
    }
    return result
  } catch (error) {
    console.error("LỖI KHI XÓA CART:", error)
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Failed to delete cart')
  }
}

export const cartService = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
  getAllCarts,
  deleteCart
}
