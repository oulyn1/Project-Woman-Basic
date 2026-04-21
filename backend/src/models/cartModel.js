import Joi from "joi"
import { ObjectId } from "mongodb"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"
import { GET_DB } from "~/config/mongodb"

const CART_COLLECTION_NAME = "carts"

// Schema cho từng item (thêm color, size)
const CART_ITEM_SCHEMA = Joi.object({
  productId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),
  variantId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),
  quantity: Joi.number().integer().min(1).default(1),
  color: Joi.string().allow("", null).optional(),
  size: Joi.string().allow("", null).optional()
})

// Schema cho giỏ hàng
const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),
  items: Joi.array().items(CART_ITEM_SCHEMA).default([]),
  createdAt: Joi.date().timestamp("javascript").default(() => Date.now()),
  updatedAt: Joi.date().timestamp("javascript").default(() => Date.now())
})

// Validate trước khi create
const validateBeforeCreate = async (data) => {
  return await CART_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Tạo cart mới
const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  return await GET_DB()
    .collection(CART_COLLECTION_NAME)
    .insertOne(validData)
}

const resolveVariantMeta = async (productId, variantId) => {
  try {
    const product = await GET_DB()
      .collection("products")
      .findOne(
        { _id: new ObjectId(productId) },
        { projection: { variants: 1 } }
      )
    if (!product?.variants?.length) return { color: "", size: "" }

    const matched = product.variants.find((v) => {
      const dbId = v?._id ? String(v._id) : ""
      const legacyId = v?.variantId ? String(v.variantId) : ""
      const targetId = String(variantId)
      return dbId === targetId || legacyId === targetId
    })

    return {
      color: matched?.color?.name || matched?.color || "",
      size: matched?.size || ""
    }
  } catch {
    return { color: "", size: "" }
  }
}

// Lấy cart theo userId (có populate chi tiết sản phẩm và biến thể)
const findByUserId = async (userId) => {
  const result = await GET_DB().collection(CART_COLLECTION_NAME).aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: "products",
        let: { items: "$items" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", { $map: { input: "$$items", as: "i", in: { $toObjectId: "$$i.productId" } } }]
              }
            }
          },
          { $project: { name: 1, price: 1, images: 1, variants: 1, slug: 1 } }
        ],
        as: "products"
      }
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "i",
            in: {
              productId: "$$i.productId",
              variantId: "$$i.variantId",
              quantity: "$$i.quantity",
              color: "$$i.color",
              size: "$$i.size",
              product: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$products",
                      as: "p",
                      cond: { $eq: ["$$p._id", { $toObjectId: "$$i.productId" }] }
                    }
                  },
                  0
                ]
              }
            }
          }
        }
      }
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "item",
            in: {
              productId: "$$item.productId",
              variantId: "$$item.variantId",
              quantity: "$$item.quantity",
              variant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$$item.product.variants",
                      as: "v",
                      cond: {
                        $or: [
                          {
                            $eq: [
                              { $toString: "$$v._id" },
                              { $toString: "$$item.variantId" }
                            ]
                          },
                          {
                            $eq: [
                              { $toString: "$$v.variantId" },
                              { $toString: "$$item.variantId" }
                            ]
                          }
                        ]
                      }
                    }
                  },
                  0
                ]
              },
              product: {
                _id: "$$item.product._id",
                name: "$$item.product.name",
                price: "$$item.product.price",
                image: { $arrayElemAt: ["$$item.product.images", 0] },
                slug: "$$item.product.slug"
              },
              color: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$item.color", null] },
                      { $ne: ["$$item.color", ""] }
                    ]
                  },
                  "$$item.color",
                  { $ifNull: ["$$item.variant.color.name", "$$item.variant.color"] }
                ]
              },
              size: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$$item.size", null] },
                      { $ne: ["$$item.size", ""] }
                    ]
                  },
                  "$$item.size",
                  "$$item.variant.size"
                ]
              }
            }
          }
        }
      }
    },
    { $project: { products: 0 } }
  ]).toArray()

  return result[0] || null
}

// Thêm item vào giỏ (nếu có color/size sẽ lưu)
const addToCart = async (userId, productId, variantId, quantity = 1, color = "", size = "") => {
  if (quantity < 1) throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity must be at least 1')
  try {
    const resolvedMeta =
      (!color || !size) ? await resolveVariantMeta(productId, variantId) : { color: "", size: "" }
    const finalColor = color || resolvedMeta.color || ""
    const finalSize = size || resolvedMeta.size || ""

    let cart = await GET_DB().collection(CART_COLLECTION_NAME).findOne({ userId })

    if (!cart) {
      await createNew({ userId, items: [{ productId, variantId, quantity, color: finalColor, size: finalSize }] })
      return await findByUserId(userId)
    }

    const index = cart.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId
    )
    if (index >= 0) {
      cart.items[index].quantity += quantity
      if (!cart.items[index].color && finalColor) {
        cart.items[index].color = finalColor
      }
      if (!cart.items[index].size && finalSize) {
        cart.items[index].size = finalSize
      }
    } else {
      cart.items.push({ productId, variantId, quantity, color: finalColor, size: finalSize })
    }

    await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cart._id) },
      { $set: { items: cart.items, updatedAt: Date.now() } }
    )

    return await findByUserId(userId)
  } catch (error) {
    console.error("LỖI KHI THÊM VÀO CART:", error)
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Failed to add to cart')
  }
}

// Cập nhật quantity (giữ nguyên color/size hiện có)
const updateQuantity = async (userId, productId, variantId, quantity) => {
  if (quantity < 1) throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity must be at least 1')
  const cart = await GET_DB().collection(CART_COLLECTION_NAME).findOne({ userId })
  if (!cart) throw new Error("Cart not found")

  const index = cart.items.findIndex(
    (i) => i.productId === productId && i.variantId === variantId
  )
  if (index < 0) throw new Error("Item not in cart")
  cart.items[index].quantity = quantity

  await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(cart._id) },
    { $set: { items: cart.items, updatedAt: Date.now() } }
  )
  return await findByUserId(userId)
}

// Xóa 1 item, giữ nguyên các item còn lại (bao gồm color/size)
const removeItem = async (userId, productId, variantId) => {
  const cart = await GET_DB().collection(CART_COLLECTION_NAME).findOne({ userId })
  if (!cart) throw new Error("Cart not found")

  const newItems = cart.items.filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  )

  await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(cart._id) },
    { $set: { items: newItems, updatedAt: Date.now() } }
  )
  return await findByUserId(userId)
}

// Xóa hết sản phẩm
const clearCart = async (userId) => {
  const cart = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId },
    { $set: { items: [], updatedAt: Date.now() } },
    { returnDocument: "after" }
  )
  return await findByUserId(userId) // gọi lại để populate
}

// Lấy tất cả cart
const getAll = async () => {
  return await GET_DB().collection(CART_COLLECTION_NAME).find().toArray()
}

// Xóa cart theo _id
const deleteOne = async (cartId) => {
  return await GET_DB()
    .collection(CART_COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(cartId) })
}

export const cartModel = {
  CART_COLLECTION_NAME,
  CART_COLLECTION_SCHEMA,
  createNew,
  findByUserId,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
  getAll,
  deleteOne
}