import { slugify } from '~/utils/formatters'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
 
const createNew = async (reqBody) => {
  try {
    const newProduct = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }

    const createdProduct = await productModel.createNew(newProduct)

    const getNewProduct = await productModel.findOneId(createdProduct.insertedId)

    return getNewProduct
  } catch (error) {
    throw error
  }
}

const getDetails = async (productId) => {
  try {
    const product = await productModel.getDetails(productId)

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')
    }

    return product
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  try {
    const products = await productModel.getAll()
    if (!products) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No products found')
    }
    return products
  } catch (error) {
    throw error
  }
}

const deleteOne = async (productId) => {
  try {
    const result = await productModel.deleteOne(productId)
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No products found')
    }
    return result
  } catch (error) {
    throw error
  }
}

const search = async (name) => {
  try {
    const products = await productModel.search(name)
    if (!products) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No products found matching your query')
    }
    return products
  } catch (error) {
    throw error
  }
}

const updateOne = async (productId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedProduct = await productModel.updateOne(productId, updateData)

    if (!updatedProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found to update')
    }

    return updatedProduct
  } catch (error) {
    throw error
  }
}

export const productService = {
  createNew,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne
}