import express from 'express'
import { workShiftController } from '~/controllers/workshiftController'

const Router = express.Router()

// ✅ Tạo ca làm mới
Router.route('/')
  .post(workShiftController.createShift)
  .get(workShiftController.getAllShifts)

// ✅ Lấy chi tiết ca làm theo ID
Router.route('/:id')
  .get(workShiftController.getShiftDetails)

// ✅ Chốt ca làm
Router.route('/:id/close')
  .post(workShiftController.closeShift)

// ✅ Lấy tất cả ca làm của 1 nhân viên
Router.route('/employee/:employeeId')
  .get(workShiftController.getShiftsByEmployee)

// ✅ Lấy ca làm của 1 nhân viên theo tháng
Router.route('/employee/:employeeId/:year/:month')
  .get(workShiftController.getShiftsByEmployeeAndMonth)

export const workShiftRoute = Router
