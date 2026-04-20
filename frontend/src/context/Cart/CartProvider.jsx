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

  const addToCart = async (product, variantId, quantity = 1) => {
    if (!product?._id || !variantId) return
    try {
      const res = await addToCartAPI(product._id.toString(), variantId, quantity)
      if (res.success) {
        setCartItems(res.data?.items || [])
      }
    } catch { /* ... */ }
  }

  const updateQuantity = async (productId, variantId, newQuantity) => {
    try {
      const item = cartItems.find(i => i.productId === productId && i.variantId === variantId)
      if (!item) return

      const maxQuantity = item.variant?.stock || Infinity
      if (newQuantity > maxQuantity) newQuantity = maxQuantity
      if (newQuantity < 1) newQuantity = 1

      const res = await updateQuantityAPI(productId, variantId, newQuantity)
      if (res.success) {
        setCartItems(res.data?.items || [])
      }
    } catch { /* ... */ }
  }

  const removeFromCart = async (productId, variantId) => {
    try {
      const res = await removeItemAPI(productId, variantId)
      if (res.success) {
        setCartItems(res.data?.items || [])
      }
    } catch { /* ... */ }
  }

  const clearCart = async () => {
    try {
      const res = await clearCartAPI()
      if (res.success) setCartItems(res.data?.items || [])
    } catch { /* ... */ }
  }

  const removeManyFromCart = async (items = []) => {
    try {
      // items are expected to be { productId, variantId } objects
      for (const item of items) {
        await removeItemAPI(item.productId, item.variantId)
      }
      fetchCart() // Refresh to be safe
    } catch { /* ... */ }
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
