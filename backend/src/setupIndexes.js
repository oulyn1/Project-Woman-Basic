import { CONNECT_DB, GET_DB, CLOSE_DB } from './config/mongodb'
import { productModel } from './models/productModel'

const setupIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('Connected successfully.')

    console.log('Creating indexes for products collection...')
    await productModel.createIndexes()
    console.log('Indexes created successfully.')

    await CLOSE_DB()
    console.log('Done.')
    process.exit(0)
  } catch (error) {
    console.error('FAILED TO CREATE INDEXES:', error)
    process.exit(1)
  }
}

setupIndexes()
