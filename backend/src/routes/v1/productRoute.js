import express from "express"
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

import { authMiddleware } from '~/middlewares/authMiddleware'
import { isStaff } from '~/middlewares/roleMiddleware'

const Router = express.Router()

Router.route('/')
  .get(productController.fetchAll)
  .post(authMiddleware, isStaff, productValidation.createNew, productController.createNew)

Router.route('/slug/:slug')
  .get(productController.getDetailsBySlug)

Router.route('/:id')
  .get(productController.getDetails)
  .patch(authMiddleware, isStaff, productValidation.updateOne, productController.updateOne)
  .delete(authMiddleware, isStaff, productController.softDelete)

Router.route('/:id/variants/:variantId')
  .patch(authMiddleware, isStaff, productController.updateVariantStock)

export const productRoute = Router