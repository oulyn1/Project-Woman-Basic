import React from 'react'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

const breadcrumbNameMap = {
  '/admin/dashboard': 'Dashboard',
  '/admin/product': 'Product',
  '/admin/product/add-product': 'Add Product',
  '/admin/product/edit-product': 'Edit Product',
  '/admin/category': 'Category',
  '/admin/category/add-category': 'Add Category',
  '/admin/category/edit-category': 'Edit Category',
  '/admin/order': 'Order',
  '/admin/account': 'Account',
  '/admin/account/add-account': 'Add Account',
  '/admin/account/edit-account': 'Edit Account',
  '/admin/promotion': 'Promotion',
  '/admin/promotion/add-promotion': 'Add Promotion',
  '/admin/promotion/edit-promotion': 'Edit Promotion',
  '/admin/rating': 'Rating',
  '/admin/employee': 'Employee',
  '/admin/employee/salary': 'Salary',
  '/admin/employee/addsalary': 'Add Salary',
  '/admin/employee/workshift': 'Workshift',
  '/admin/branch': 'Branch',
  '/admin/customer': 'Customer',
}

const AdminBreadcrumbs = () => {
  const location = useLocation()

  // Lấy path và loại bỏ 'admin'
  const rawPathnames = location.pathname
    .split('/')
    .filter((x) => x && x !== 'admin')

  // Lọc bỏ ID (24 ký tự hex hoặc toàn số)
  const pathnames = rawPathnames.filter(
    (x) => !/^[0-9a-fA-F]{24}$/.test(x) && !/^\d+$/.test(x)
  )

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      <Link component={RouterLink} underline="hover" color="inherit" to="/admin/dashboard">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1
        const to = `/admin/${pathnames.slice(0, index + 1).join('/')}`
        const name = breadcrumbNameMap[to] || value

        return last ? (
          <Typography color="text.primary" key={to} fontWeight="bold">
            {name}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
            key={to}
          >
            {name}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

export default AdminBreadcrumbs
