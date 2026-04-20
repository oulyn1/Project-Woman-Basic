import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * RoleGate bảo vệ các trang khách hàng
 * Nếu user là Admin hoặc Employee thì auto-redirect sang /admin
 */
function RoleGate() {
  const token = localStorage.getItem('accessToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // ✅ Nếu đã đăng nhập và là Admin/Employee
  if (token && (user.role === 'admin' || user.role === 'employee')) {
    // Chặn không cho vào trang khách hàng, đẩy về trang quản trị
    return <Navigate to="/admin" replace />
  }

  // ✅ Ngược lại (chưa đăng nhập hoặc là Customer) thì cho vào bình thường
  return <Outlet />
}

export default RoleGate
