// eslint-disable-next-line no-console
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import exitHook from 'async-exit-hook'
import { ratingModel } from '~/models/ratingModel.js'

import { CONNECT_MONGOOSE, CLOSE_MONGOOSE } from '~/config/mongoose'


import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  // Giới hạn 100 yêu cầu mỗi 15 phút cho các API Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Cấu hình CORS
  app.use(cors({
    origin: process.env.CLIENT_URL || '*', // Nên cấu hình chính xác domain frontend
    credentials: true
  }))

  // Tăng limit lên 6mb để xử lý base64 ảnh (ảnh 4MB ≈ 5.5MB base64)
  app.use(express.json({ limit: '6mb' }))

  // Áp dụng giới hạn cho các route nhạy cảm
  app.use('/v1/user/login', authLimiter)
  app.use('/v1/user/register', authLimiter)
  app.use('/v1/user/send-otp', authLimiter)

  app.get('/ping', (req, res) => {
    res.status(200).send('Sống')
  })

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  const host = env.BUILD_MODE === 'production' ? '0.0.0.0' : env.APP_HOST
  app.listen(env.APP_PORT, host, () => {
    console.log(`Hello Oulyne, I am running at ${ host }:${ env.APP_PORT }/`)
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
    // Khởi động cron job weekly insight (phải sau khi DB ready)
    await import('./jobs/weeklyInsight.job.js')
    await import('./jobs/statusMonitor.job.js')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
