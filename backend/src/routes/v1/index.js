import express from "express"
import { StatusCodes } from 'http-status-codes'
import { productRoute } from '~/routes/v1/productRoute'
import { categoryRoute } from '~/routes/v1/categoryRoute'
import { userRoute } from "~/routes/v1/userRoute"
import { cartRoute } from "~/routes/v1/cartRoute"
import { orderRoute } from "./orderRoute"
import { ratingRoute } from "./ratingRoute"
import { promotionRoute } from "./promotionRoute"
import { customerRoute } from "./customerRoute"
import { aiRoute } from "./ai.route"

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.', code: StatusCodes.OK})
})

Router.use('/product', productRoute)

Router.use('/category', categoryRoute)

Router.use('/user', userRoute)

Router.use('/cart', cartRoute)

Router.use('/order', orderRoute)

Router.use('/ratings', ratingRoute)

Router.use('/promotion', promotionRoute)

Router.use('/customers', customerRoute)

Router.use('/ai', aiRoute)

export const APIs_V1 = Router