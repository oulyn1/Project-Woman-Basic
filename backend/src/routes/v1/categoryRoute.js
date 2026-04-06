import express from "express"
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(categoryValidation.createNew, categoryController.createNew)

Router.route('/search')
  .get(categoryController.search)

Router.route('/:id')
  .get(categoryController.getDetails)
  .delete(categoryController.deleteOne)
  .put(categoryController.updateOne)



export const categoryRoute = Router