import { slugify } from '~/utils/formatters'
import { categoryModel } from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
 
const createNew = async (reqBody) => {
  try {
    const newCategory = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }

    const createdCategory = await categoryModel.createNew(newCategory)

    const getNewCategory = await categoryModel.findOneId(createdCategory.insertedId)

    return getNewCategory
  } catch (error) {
    throw error
  }
}

const getDetails = async (categoryId) => {
  try {
    const category = await categoryModel.getDetails(categoryId)

    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'category not found')
    }

    return category
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  try {
    const categorys = await categoryModel.getAll()
    if (!categorys) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No categorys found')
    }
    return categorys
  } catch (error) {
    throw error
  }
}

const deleteOne = async (categoryId) => {
  try {
    const result = await categoryModel.deleteOne(categoryId)
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No categorys found')
    }
    return result
  } catch (error) {
    throw error
  }
}

const search = async (name) => {
  try {
    const categorys = await categoryModel.search(name)
    if (!categorys) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No categorys found matching your query')
    }
    return categorys
  } catch (error) {
    throw error
  }
}

const updateOne = async (categoryId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedCategory = await categoryModel.updateOne(categoryId, updateData)

    if (!updatedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'category not found to update')
    }

    return updatedCategory
  } catch (error) {
    throw error
  }
}

export const categoryService = {
  createNew,
  getDetails,
  getAll,
  deleteOne,
  search,
  updateOne
}