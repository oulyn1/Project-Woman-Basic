import { env } from '~/config/environment'

import { MongoClient, ServerApiVersion } from 'mongodb'

let databaseInstant = null

const clientInstant = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

export const CONNECT_DB = async () => {
  await clientInstant.connect()

  databaseInstant = clientInstant.db(env.DATABASE_NAME)

  databaseInstant
}

export const GET_DB = () => {
  if (!databaseInstant) throw new Error('Must connect to Database first!')
  return databaseInstant
}

export const CLOSE_DB = async () => {
  console.log('close')
  await clientInstant.close()
}