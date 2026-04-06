import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'

const createNew = async (req, res, next) => {
  try {
    const createdCategory = await categoryService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdCategory)
    
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const category = await categoryService.getDetails(req.params.id)

    res.status(StatusCodes.OK).json(category)
    
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const categorys = await categoryService.getAll()
    res.status(StatusCodes.OK).json(categorys)
    
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const result = await categoryService.deleteOne(categoryId)
    res.status(StatusCodes.OK).json({ 
      message: 'category deleted successfully',
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

    const categorys = await categoryService.search(name.trim())
    res.status(StatusCodes.OK).json(categorys)
  } catch (error) {
    console.error("Search error:", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" })
  }
}

const updateOne = async (req, res, next) => {
  try {
    console.log("PUT categoryId:", req.params.id)  // 👈 debug
    console.log("PUT body:", req.body) 
    const categoryId = req.params.id
    const updatedCategory = await categoryService.updateOne(categoryId, req.body)

    res.status(StatusCodes.OK).json(updatedCategory)
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  createNew,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne
}
