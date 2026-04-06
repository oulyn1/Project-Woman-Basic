import express from "express"
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(productValidation.createNew, productController.createNew)

Router.route('/search')
  .get(productController.search)
  
Router.route('/:id')
  .get(productController.getDetails)
  .delete(productController.deleteOne)
  .put(productController.updateOne)


export const productRoute = Router