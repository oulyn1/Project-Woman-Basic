import mongoose from 'mongoose'
import ChatCache from './backend/src/models/chatCache.model'

async function clear() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ProjectWB')
  await ChatCache.deleteMany({})
  console.log('Cache cleared!')
  process.exit(0)
}
clear()
