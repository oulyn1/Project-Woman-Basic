// eslint-disable-next-line no-console
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { ratingModel } from '~/models/ratingModel.js'

import { CONNECT_MONGOOSE, CLOSE_MONGOOSE } from '~/config/mongoose'


import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  app.use(cors())

  // Tăng limit lên 6mb để xử lý base64 ảnh (ảnh 4MB ≈ 5.5MB base64)
  app.use(express.json({ limit: '6mb' }))

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello Oulyne, I am running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  exitHook(() => {
    CLOSE_MONGOOSE()
  })
}

//IIFE
(async () => {
  try {
    await CONNECT_MONGOOSE()
    console.log('Connect to Database')
    // Ensure rating index uniqueness
    if (ratingModel?.ensureUniqueIndex) {
      await ratingModel.ensureUniqueIndex()
    }
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
