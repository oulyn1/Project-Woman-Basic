import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

const createNew = async (req, res, next) => {
  try {
    const createdProduct = await productService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: createdProduct,
      message: 'Thêm sản phẩm thành công'
    })
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const product = await productService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: product,
      message: 'Lấy chi tiết sản phẩm thành công'
    })
  } catch (error) {
    next(error)
  }
}

const getDetailsBySlug = async (req, res, next) => {
  try {
    const product = await productService.getDetailsBySlug(req.params.slug)
    res.status(StatusCodes.OK).json({
      success: true,
      data: product,
      message: 'Lấy chi tiết sản phẩm theo slug thành công'
    })
  } catch (error) {
    next(error)
  }
}

const fetchAll = async (req, res, next) => {
  try {
    const result = await productService.fetchAll(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateOne = async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateOne(req.params.id, req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedProduct,
      message: 'Cập nhật sản phẩm thành công'
    })
  } catch (error) {
    next(error)
  }
}

const updateVariantStock = async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateVariantStock(
      req.params.id, 
      req.params.variantId, 
      req.body.quantity
    )
    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedProduct,
      message: 'Cập nhật tồn kho biến thể thành công'
    })
  } catch (error) {
    next(error)
  }
}

const softDelete = async (req, res, next) => {
  try {
    await productService.softDelete(req.params.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: null,
      message: 'Xóa sản phẩm thành công (Soft Delete)'
    })
  } catch (error) {
    next(error)
  }
}

export const productController = {
  createNew,
  getDetails,
  getDetailsBySlug,
  fetchAll,
  updateOne,
  updateVariantStock,
  softDelete
}
