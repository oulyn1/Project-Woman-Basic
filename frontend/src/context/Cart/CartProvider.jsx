import React, { useState, useEffect } from 'react'
import CartContext from './CartContext'
import {
  getCartByUserAPI,
  addToCartAPI,
  updateQuantityAPI,
  removeItemAPI,
  clearCartAPI
} from '~/apis/cartAPIs'

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        return
      }
      const res = await getCartByUserAPI()
      if (res.success) {
        setCartItems(res.data?.items || [])
      } else {
        setCartItems([])
      }
    } catch {
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const addToCart = async (product, quantity = 1) => {
    if (!product?._id) return
    try {
      const res = await addToCartAPI(product._id.toString(), quantity)
      if (res.success) {
        setCartItems(res.data?.items || [])
      }
    } catch {
      //
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const item = cartItems.find(i => i.productId === productId)
      if (!item) return

      const maxQuantity = item.product?.stock || Infinity
      if (newQuantity > maxQuantity) {
        newQuantity = maxQuantity
      }
      if (newQuantity < 1) newQuantity = 1

      const res = await updateQuantityAPI(productId, newQuantity)
      if (res.success) {
        setCartItems(prev =>
          prev.map(i =>
            i.productId === productId ? { ...i, quantity: newQuantity } : i
          )
        )
      }
    } catch {
      //
    }
  }

  const removeFromCart = async (productId) => {
    try {
      await removeItemAPI(productId)

      setCartItems((prev) => prev.filter(item => item.productId !== productId))
    } catch {
      //
    }
  }


  const clearCart = async () => {
    try {
      const res = await clearCartAPI()
      if (res.success) setCartItems(res.data?.items || [])
    } catch {
      //
    }
  }

  const removeManyFromCart = async (productIds = []) => {
    try {
      for (const productId of productIds) {
        await removeItemAPI(productId)
      }
      setCartItems(prev => prev.filter(i => !productIds.includes(i.productId)))
    } catch {
      //
    }
  }


  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        removeManyFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider
