import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const USER_COLLECTION = 'users'

const findAll = async () => {
  return GET_DB().collection(USER_COLLECTION)
    .find({ role: 'customer' })
    .project({ password: 0 })
    .toArray()
}

const search = async (q) => {
  const regex = new RegExp(q, 'i')
  return GET_DB().collection(USER_COLLECTION)
    .find({ role: 'customer', $or: [{ name: regex }, { fullName: regex }, { email: regex }] })
    .project({ password: 0 })
    .toArray()
}

const findById = async (id) => {
  return GET_DB().collection(USER_COLLECTION)
    .findOne({ _id: new ObjectId(id), role: 'customer' }, { projection: { password: 0 } })
}

export const customerModel = { findAll, search, findById }
