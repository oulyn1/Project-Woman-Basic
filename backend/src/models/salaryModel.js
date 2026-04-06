import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import Joi from 'joi'

// Tên collection
const SALARY_COLLECTION_NAME = 'salaries'

// Joi Schema
const SALARY_COLLECTION_SCHEMA = Joi.object({
  employeeId: Joi.string().required(),        // tham chiếu sang employee
  workDate: Joi.string().required(),          // kỳ lương dạng YYYY-MM
  totalHours: Joi.number().min(0).required(), // tổng số giờ làm trong tháng
  hourlyRate: Joi.number().min(0).required(), // lương theo giờ
  bonus: Joi.number().min(0).default(0),      // thưởng
  deduction: Joi.number().min(0).default(0),  // khoản trừ
  netSalary: Joi.number().min(0).required()   // lương thực lĩnh
})

// Tạo lương mới
const createSalary = async (data) => {
  try {
    const validData = await SALARY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const db = await GET_DB()
    const result = await db.collection(SALARY_COLLECTION_NAME).insertOne({
      ...validData,
      employeeId: new ObjectId(validData.employeeId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy lương theo nhân viên và tháng
const getSalaryByEmployeeAndMonth = async (employeeId, workDate) => {
  try {
    const db = await GET_DB()
    const salary = await db.collection(SALARY_COLLECTION_NAME).findOne({
      employeeId: new ObjectId(employeeId),
      workDate: workDate
    })
    return salary
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa lương theo ID
const deleteSalary = async (salaryId) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(SALARY_COLLECTION_NAME).findOneAndDelete({
      _id: new ObjectId(salaryId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const salaryModel = {
  SALARY_COLLECTION_NAME,
  SALARY_COLLECTION_SCHEMA,
  createSalary,
  getSalaryByEmployeeAndMonth,
  deleteSalary
}
