import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

const createNew = async (req, res, next) => {
  try {
    const createdProduct = await productService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdProduct)
    
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const product = await productService.getDetails(req.params.id)

    res.status(StatusCodes.OK).json(product)
    
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const products = await productService.getAll()
    res.status(StatusCodes.OK).json(products)
    
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const productId = req.params.id
    const result = await productService.deleteOne(productId)
    res.status(StatusCodes.OK).json({ 
      message: 'Product deleted successfully',
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    next(error)
  }
}

const search = async (req, res, next) => {
  try {
    const { name } = req.query

    if (!name || name.trim() === '') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Search query "name" is required' })
    }

    const products = await productService.search(name.trim())
    res.status(StatusCodes.OK).json(products)
  } catch (error) {
    console.error("Search error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" })
  }
}

const updateOne = async (req, res, next) => {
  try {
    console.log("PUT productId:", req.params.id)  // 👈 debug
    console.log("PUT body:", req.body) 
    const productId = req.params.id
    const updatedProduct = await productService.updateOne(productId, req.body)

    res.status(StatusCodes.OK).json(updatedProduct)
  } catch (error) {
    next(error)
  }
}

export const productController = {
  createNew,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne
}
