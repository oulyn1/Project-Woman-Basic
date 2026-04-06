import express from 'express'
import { salaryController } from '~/controllers/salaryController'

const Router = express.Router()

// ✅ Tạo bảng lương mới & lấy tất cả lương (nếu cần)
Router.route('/')
  .post(salaryController.createSalary)
// .get(...) // có thể thêm nếu muốn lấy tất cả lương

// ✅ Lấy bảng lương theo nhân viên và tháng (YYYY-MM)
Router.route('/:employeeId/:workDate')
  .get(salaryController.getSalaryByEmployeeAndMonth)

// ✅ Xóa bảng lương theo ID
Router.route('/:id')
  .delete(salaryController.deleteSalary)

export const salaryRoute = Router
