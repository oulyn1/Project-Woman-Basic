import express from "express"
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'

import { authMiddleware } from '~/middlewares/authMiddleware'
import { isStaff } from '~/middlewares/roleMiddleware'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(authMiddleware, isStaff, categoryValidation.createNew, categoryController.createNew)

Router.route('/search')
  .get(categoryController.search)

Router.route('/:id')
  .get(categoryController.getDetails)
  .delete(authMiddleware, isStaff, categoryController.deleteOne)
  .put(authMiddleware, isStaff, categoryController.updateOne)



export const categoryRoute = Router