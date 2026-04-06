import express from "express"
import { promotionController } from '~/controllers/promotionController'

const Router = express.Router()

Router.route('/')
  .get(promotionController.getAll)
  .post(promotionController.createNew)

Router.route('/:id')
  .get(promotionController.getDetails)
  .put(promotionController.updateOne)
  .delete(promotionController.deleteOne)

export const promotionRoute = Router
