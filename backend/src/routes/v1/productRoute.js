import express from "express"
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

const Router = express.Router()

Router.route('/')
  .get(productController.fetchAll)
  .post(productValidation.createNew, productController.createNew)

Router.route('/slug/:slug')
  .get(productController.getDetailsBySlug)

Router.route('/:id')
  .get(productController.getDetails)
  .patch(productValidation.updateOne, productController.updateOne)
  .delete(productController.softDelete)

Router.route('/:id/variants/:variantId')
  .patch(productController.updateVariantStock)

export const productRoute = Router