// src/controllers/branchController.js
import { StatusCodes } from 'http-status-codes'
import { branchService } from '~/services/branchService'

const createNew = async (req, res, next) => {
  try {
    const created = await branchService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(created)
  } catch (err) {
    next(err)
  }
}

const getAll = async (req, res, next) => {
  try {
    const branches = await branchService.getAll(req.query?.search)
    res.status(StatusCodes.OK).json(branches)
  } catch (err) {
    next(err)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const branch = await branchService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(branch)
  } catch (err) {
    next(err)
  }
}

const updateOne = async (req, res, next) => {
  try {
    const updated = await branchService.updateOne(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (err) {
    next(err)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const result = await branchService.deleteOne(req.params.id)
    res.status(StatusCodes.OK).json({
      message: 'Branch deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (err) {
    next(err)
  }
}

const toggleActive = async (req, res, next) => {
  try {
    const updated = await branchService.toggleActive(req.params.id, req.body?.isActive)
    res.status(StatusCodes.OK).json(updated)
  } catch (err) {
    next(err)
  }
}

export const branchController = {
  createNew,
  getAll,
  getDetails,
  updateOne,
  deleteOne,
  toggleActive
}
