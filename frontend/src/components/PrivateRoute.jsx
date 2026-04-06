import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * PrivateRoute bảo vệ route cần đăng nhập
 * @param {string[]} allowedRoles - danh sách role được phép (nếu có)
 */
function PrivateRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem('accessToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // ✅ Nếu chưa đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // ✅ Nếu có quy định role mà user không thuộc nhóm được phép
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // ví dụ: admin cố truy cập customer hoặc ngược lại
    return <Navigate to="/login" replace />
  }

  // ✅ Cho phép vào trang (Outlet đại diện cho các route con)
  return <Outlet />
}

export default PrivateRoute
