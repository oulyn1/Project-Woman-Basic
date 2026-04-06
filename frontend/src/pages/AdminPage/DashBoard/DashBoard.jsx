import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllOrdersAPI } from '~/apis/orderAPIs'
import { AllUsersAPI } from '~/apis/userAPIs'

const Dashboard = () => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE']
  const userStr = localStorage.getItem('user')
  const token = userStr ? JSON.parse(userStr).accessToken : null

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  })
  const [topProducts, setTopProducts] = useState([])
  const [orderStatus, setOrderStatus] = useState([])
  const [topCustomers, setTopCustomers] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [products, orders, users] = await Promise.all([
          fetchAllProductsAPI(),
          fetchAllOrdersAPI(),
          AllUsersAPI(token)
        ])

        const totalProducts = products.length
        const totalOrders = orders.length
        const totalCustomers = users.filter((u) => u.role === 'customer').length
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

        const top10Products = [...products]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 5)
          .map((p) => ({
            name: p.name,
            value: p.sold || 0
          }))

        const groupedStatus = orders.reduce((acc, o) => {
          const s = o.status || 'Unknown'
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {})
        const orderStatusData = Object.entries(groupedStatus).map(
          ([status, quantity]) => ({ status, quantity })
        )

        const userTotalSpend = orders.reduce((acc, o) => {
          const uid = o.userId?._id || o.userId
          acc[uid] = (acc[uid] || 0) + (o.total || 0)
          return acc
        }, {})
        const top10Customers = Object.entries(userTotalSpend)
          .map(([userId, total]) => {
            const user = users.find((u) => u._id === userId && u.role === 'customer')
            return user ? { name: user.name, total } : null
          })
          .filter(Boolean)
          .sort((a, b) => b.total - a.total)
          .slice(0, 3)


        setSummary({
          totalProducts,
          totalOrders,
          totalRevenue,
          totalCustomers
        })
        setTopProducts(top10Products)
        setOrderStatus(orderStatusData)
        setTopCustomers(top10Customers)
      } catch {
        //
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [token])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        height: 'auto',
        overflow: 'auto',
        mx: 5,
        my: 1,
        borderRadius: '8px'
      }}
    >
      <Box sx={{ p: 3, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
        {/* === Top Cards === */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ width: '250px' }}>
            <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)', color: 'white' }}>
              <Typography variant="subtitle2">Products</Typography>
              <Typography variant="h4">{summary.totalProducts}</Typography>
              <ShoppingCartIcon />
            </Paper>
          </Box>
          <Box sx={{ width: '250px' }}>
            <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', color: 'white' }}>
              <Typography variant="subtitle2">Orders</Typography>
              <Typography variant="h4">{summary.totalOrders}</Typography>
              <ShoppingCartIcon />
            </Paper>
          </Box>
          <Box sx={{ width: '290px' }}>
            <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)', color: 'white' }}>
              <Typography variant="subtitle2">Revenue</Typography>
              <Typography variant="h4">
                {summary.totalRevenue.toLocaleString('vi-VN')}  ₫
              </Typography>
              <MonetizationOnIcon />
            </Paper>
          </Box>
          <Box sx={{ width: '250px' }}>
            <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', color: 'white' }}>
              <Typography variant="subtitle2">Customers</Typography>
              <Typography variant="h4">{summary.totalCustomers}</Typography>
              <PeopleIcon />
            </Paper>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              flex: '1 1 48%',
              p: 3,
              borderRadius: 3,
              minWidth: 350
            }}
          >
            <Typography variant="h6" align="center" fontWeight={600} mb={2}>
              Top 5 Product Sell
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>

          {/* Bar Chart - Order Status */}
          <Paper
            elevation={3}
            sx={{
              flex: '1 1 48%',
              p: 3,
              borderRadius: 3,
              minWidth: 350
            }}
          >
            <Typography variant="h6" align="center" fontWeight={600} mb={2}>
              Status Order
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatus}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="quantity"
                  fill="#8884d8"
                  radius={[6, 6, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" align="center" fontWeight={600} mb={2}>
              Top Customer Buy Most
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers} margin={{ top: 20, right: 30, left: 50, bottom: 10 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(v) =>
                    v.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    })
                  }
                />
                <Bar
                  dataKey="total"
                  fill="#82ca9d"
                  radius={[6, 6, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
