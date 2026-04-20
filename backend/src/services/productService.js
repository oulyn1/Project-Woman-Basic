import slugifyLib from 'slugify'
import { ObjectId } from 'mongodb'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const generateSkuPrefix = (name) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z]/g, '') // Keep only letters
    .substring(0, 3)
    .toUpperCase()
}

const createNew = async (reqBody) => {
  try {
    // 1. Generate unique slug
    let slug = slugifyLib(reqBody.name, { lower: true, strict: true })
    const existingProduct = await productModel.getDetailsBySlug(slug)
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`
    }

    // 2. Generate SKUs for variants
    const prefix = generateSkuPrefix(reqBody.name)
    const variants = reqBody.variants.map((v) => ({
      _id: new ObjectId().toString(), // Generate new ID for each variant
      ...v,
      sku: `${prefix}-${v.size}-${v.color.name.toUpperCase().substring(0, 3)}`
    }))

    const newProduct = {
      ...reqBody,
      slug,
      variants,
      sold: 0,
      isDeleted: false
    }

    const createdProduct = await productModel.createNew(newProduct)
    return await productModel.findOneId(createdProduct.insertedId)
  } catch (error) {
    throw error
  }
}

const getDetails = async (productId) => {
  try {
    const product = await productModel.getDetails(productId)
    if (!product || product.isDeleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại hoặc đã bị xóa')
    }
    return product
  } catch (error) {
    throw error
  }
}

const getDetailsBySlug = async (slug) => {
  try {
    const product = await productModel.getDetailsBySlug(slug)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại')
    }
    return product
  } catch (error) {
    throw error
  }
}

const fetchAll = async (query) => {
  try {
    const { 
      q, categoryId, minPrice, maxPrice, size, color, inStock, 
      sortBy, page = 1, limit = 20 
    } = query

    const filter = {}
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    }
    if (categoryId) filter.categoryId = new ObjectId(categoryId)
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (size || color || inStock) {
      const variantFilter = {}
      if (size) variantFilter.size = size
      if (color) variantFilter['color.hex'] = color
      if (inStock === 'true') variantFilter.stock = { $gt: 0 }
      filter.variants = { $elemMatch: variantFilter }
    }

    let sort = { createdAt: -1 }
    if (sortBy === 'price_asc') sort = { price: 1 }
    if (sortBy === 'price_desc') sort = { price: -1 }
    if (sortBy === 'best_seller') sort = { sold: -1 }
    if (sortBy === 'newest') sort = { createdAt: -1 }

    const result = await productModel.findWithPagination({ 
      filter, sort, page: Number(page), limit: Number(limit) 
    })

    return {
      success: true,
      data: result.products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    }
  } catch (error) {
    throw error
  }
}

const updateOne = async (productId, reqBody) => {
  try {
    const updatedProduct = await productModel.updateOne(productId, reqBody)
    if (!updatedProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm để cập nhật')
    }
    return updatedProduct
  } catch (error) {
    throw error
  }
}

const updateVariantStock = async (productId, variantId, quantity) => {
  try {
    const updatedProduct = await productModel.updateVariantStock(productId, variantId, quantity)
    if (!updatedProduct) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Sản phẩm đã hết hàng hoặc không đủ số lượng')
    }
    return updatedProduct
  } catch (error) {
    throw error
  }
}

const softDelete = async (productId) => {
  try {
    const result = await productModel.softDelete(productId)
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm')
    }
    return result
  } catch (error) {
    throw error
  }
}

export const productService = {
  createNew,
  getDetails,
  getDetailsBySlug,
  fetchAll,
  updateOne,
  updateVariantStock,
  softDelete
}