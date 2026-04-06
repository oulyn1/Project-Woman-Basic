import express from 'express'
import { customerController } from '~/controllers/customerController'

const Router = express.Router()

Router.get('/', customerController.list)
Router.get('/search', customerController.search)
Router.get('/:id', customerController.detail)
Router.get('/:id/summary', customerController.summary)

export const customerRoute = Router
