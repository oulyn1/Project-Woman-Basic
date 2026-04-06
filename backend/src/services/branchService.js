import { branchModel } from '~/models/branchModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  const created = await branchModel.createNew(reqBody)
  const newDoc = await branchModel.findOneById(created.insertedId)
  return newDoc
}

const getAll = async () => {
  const list = await branchModel.getAll()
  return list
}

const getDetails = async (id) => {
  const doc = await branchModel.findOneById(id)
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found')
  return doc
}

const deleteOne = async (id) => {
  const result = await branchModel.deleteOne(id)
  if (!result?.deletedCount) throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found to delete')
  return result
}

const updateOne = async (id, reqBody) => {
  const updateData = { ...reqBody, updatedAt: Date.now() }
  const updated = await branchModel.updateOne(id, updateData)
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found to update')
  return updated
}

const toggleActive = async (id, isActive) => {
  const updated = await branchModel.updateOne(id, { isActive: !!isActive, updatedAt: Date.now() })
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found to update status')
  return updated
}

export const branchService = {
  createNew,
  getAll,
  getDetails,
  deleteOne,
  updateOne,
  toggleActive
}
