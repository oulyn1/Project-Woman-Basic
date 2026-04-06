import { StatusCodes } from 'http-status-codes'
import { customerService } from '~/services/customerService'

export const customerController = {
  list: async (req, res, next) => {
    try { res.status(StatusCodes.OK).json(await customerService.getCustomers()) }
    catch (e) { next(e) }
  },
  search: async (req, res, next) => {
    try {
      const q = (req.query.q || '').trim()
      if (!q) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Query "q" is required' })
      res.status(StatusCodes.OK).json(await customerService.searchCustomers(q))
    } catch (e) { next(e) }
  },
  detail: async (req, res, next) => {
    try { res.status(StatusCodes.OK).json(await customerService.getCustomerDetail(req.params.id)) }
    catch (e) { next(e) }
  },
  summary: async (req, res, next) => {
    try { res.status(StatusCodes.OK).json(await customerService.getCustomerSummary(req.params.id)) }
    catch (e) { next(e) }
  }
}
