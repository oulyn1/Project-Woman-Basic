import { customerModel } from '~/models/customerModel'
import { orderModel } from '~/models/orderModel'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'

const getCustomers = async () => customerModel.findAll()
const searchCustomers = async (q) => customerModel.search(q)

const getCustomerDetail = async (id) => {
  const user = await customerModel.findById(id)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found')
  return user
}

const getCustomerSummary = async (id) => {
  const user = await getCustomerDetail(id)
  // Lấy đơn theo userId 
  const orders = await orderModel.getAll({ userId: id })

  const totalOrders = orders.length
  const totalAmount = orders.reduce((s, o) => s + Number(o?.total || 0), 0)
  const tier = user.tier || (
    totalAmount >= 50_000_000 ? 'Platinum'
      : totalAmount >= 20_000_000 ? 'Gold'
      : totalAmount >= 5_000_000  ? 'Silver'
      : 'Standard'
  )
  return { user, stats: { totalOrders, totalAmount, tier } }
}

export const customerService = {
  getCustomers,
  searchCustomers,
  getCustomerDetail,
  getCustomerSummary
}
