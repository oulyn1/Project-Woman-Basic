import express from 'express'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'   
import { isAdmin, isStaff } from '~/middlewares/roleMiddleware'
import { userValidation } from '~/validations/userValidation'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.register, userController.register)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/profile')
  .get(authMiddleware, userController.getProfile)
  .put(authMiddleware, userController.updateProfile)

Router.route('/search')
  .get(authMiddleware, isStaff, userController.search)

Router.route('/employee')
  .get(authMiddleware, isStaff, userController.employee)

Router.route('/employee/search')
  .get(authMiddleware, isStaff, userController.searchEmployee)

Router.route('/')
.get(authMiddleware, isStaff, userController.getAll)
.post(authMiddleware, isStaff, userController.createUser)

Router.route('/:id')
  .get(authMiddleware, isStaff, userController.getDetails)
  .put(authMiddleware, userController.updateAccount)
  .delete(authMiddleware, isStaff, userController.deleteOne)

  Router.route('/check-email')
  .post(userController.checkEmail)

Router.route('/send-otp')
  .post(userController.sendOtp)

Router.route('/verify-otp')
  .post(userController.verifyOtp)

Router.route('/reset-password')
  .post(userController.resetPassword)
Router.route('/logout/:id')
  .post(userController.logOut)
  Router.route('/login/:id')
  .post(userController.logIn)
export const userRoute = Router
