// eslint-disable-next-line no-console
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'

import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'

import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  app.use(cors())

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello Nguyen Minh Hieu, I am running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  exitHook(() => {
    CLOSE_DB()
  })
}

//IIFE
(async () => {
  try {
    await CONNECT_DB()
    console.log('Connect to Database')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// CONNECT_DB()
//   .then(() => console.log('Connect to Database'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })

