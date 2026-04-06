// src/routes/v1/branchRoute.js
import express from 'express'
import { branchController } from '~/controllers/branchController'

const Router = express.Router()

// GET list + POST create
Router.route('/')
  .get(branchController.getAll)
  .post(branchController.createNew)

// GET details + PUT update + DELETE
Router.route('/:id')
  .get(branchController.getDetails)
  .put(branchController.updateOne)
  .delete(branchController.deleteOne)

// PATCH toggle active (khớp frontend toggleActive(id, isActive)) :contentReference[oaicite:6]{index=6}
Router.patch('/:id/active', branchController.toggleActive)

export const branchRoute = Router
