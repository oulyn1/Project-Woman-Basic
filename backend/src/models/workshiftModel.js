import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
const WORKSHIFT_COLLECTION_NAME = 'workshifts'
export const WORKSHIFT_COLLECTION_SCHEMA = Joi.object({
    employeeId: Joi.string().required(),                     
    workDate: Joi.date().required(),                          // ngày làm việc (Date)
    startTime: Joi.date().required(),                         // giờ bắt đầu (Date)
    endTime: Joi.date().allow(null),                          // giờ kết thúc (Date hoặc null)
    totalHours: Joi.number().min(0).default(0),               
    shiftStatus: Joi.string().valid('Scheduled', 'Completed')
      .default('Scheduled'),                                 
  })

const validateBeforeCreate = async (data) => {
  return await WORKSHIFT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  validData.totalHours = 0 // mặc định = 0 cho tới khi chốt
  const result = await GET_DB().collection(WORKSHIFT_COLLECTION_NAME).insertOne(validData)
  return result
}

const getAll = async () => {
  return await GET_DB().collection(WORKSHIFT_COLLECTION_NAME).find().toArray()
}
const findOneId = async (id) => {
  return await GET_DB().collection(WORKSHIFT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
}
const closeShift = async (id) => {
    const shift = await findOneId(id)
    if (!shift) throw new Error('Shift not found')
    if (shift.shiftStatus === 'Completed') return shift
  
    // Ghi lại thời gian kết thúc ca
    const endTime = new Date()
  
    // Tính số giờ làm
    let totalHours = 0
    if (shift.startTime) {
      const start = new Date(shift.startTime)
      totalHours = (endTime - start) / (1000 * 60 * 60) // ms → giờ
    }
  
    // Cập nhật DB
    const result = await GET_DB().collection(WORKSHIFT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            shiftStatus: 'Completed',
            totalHours,
            endTime
          }
        },
        { returnDocument: 'after',
            returnOriginal: false }
      )
    return result
  }

// ---------------------------
// Tìm ca làm theo employeeId
// ---------------------------
const findByEmployeeId = async (employeeId) => {
  return await GET_DB().collection(WORKSHIFT_COLLECTION_NAME).find({ employeeId }).toArray()
}

// ---------------------------
// Tìm ca làm theo employeeId + tháng
// ---------------------------
const findByEmployeeIdAndMonth = async (employeeId, year, month) => {
  const startOfMonth = new Date(year, month - 1, 1)
  startOfMonth.setHours(0, 0, 0, 0)

  const endOfMonth = new Date(year, month, 0) // trick: day 0 của tháng sau = cuối tháng hiện tại
  endOfMonth.setHours(23, 59, 59, 999)

  return await GET_DB().collection(WORKSHIFT_COLLECTION_NAME).find({
    employeeId,
    workDate: { $gte: startOfMonth, $lte: endOfMonth }
  }).toArray()
}
export const workShiftModel = {
  WORKSHIFT_COLLECTION_NAME,
  WORKSHIFT_COLLECTION_SCHEMA,
  createNew,
  getAll,
  findOneId,
  closeShift,
  findByEmployeeId,
  findByEmployeeIdAndMonth
}
