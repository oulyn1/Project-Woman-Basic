import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Grid
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import InventoryIcon from '@mui/icons-material/Inventory'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts'
import { fetchAllProductsAPI } from '~/apis/productAPIs'
import { fetchAllOrdersAPI } from '~/apis/orderAPIs'
import { AllUsersAPI } from '~/apis/userAPIs'

const Dashboard = () => {
  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884d8']
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
  const [revenueTrend, setRevenueTrend] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [prodRes, orders, users] = await Promise.all([
          fetchAllProductsAPI(),
          fetchAllOrdersAPI(),
          AllUsersAPI(token)
        ])

        const products = prodRes.data || []
        const totalProducts = products.length
        const totalOrders = orders.length
        const totalCustomers = users.filter((u) => u.role === 'customer').length
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

        const top5Products = [...products]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 5)
          .map((p) => ({
            name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
            value: p.sold || 0
          }))

        const groupedStatus = orders.reduce((acc, o) => {
          const s = o.status || 'Unknown'
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {})
        const orderStatusData = Object.entries(groupedStatus).map(
          ([status, count]) => ({ status, count })
        )

        // Mock revenue trend
        const mockTrend = [
          { day: 'Mon', revenue: 4000 },
          { day: 'Tue', revenue: 3000 },
          { day: 'Wed', revenue: 8000 },
          { day: 'Thu', revenue: 4500 },
          { day: 'Fri', revenue: 9000 },
          { day: 'Sat', revenue: 12000 },
          { day: 'Sun', revenue: totalRevenue / 10 }
        ]

        setSummary({ totalProducts, totalOrders, totalRevenue, totalCustomers })
        setTopProducts(top5Products)
        setOrderStatus(orderStatusData)
        setRevenueTrend(mockTrend)
      } catch { /* ... */ } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [token])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="inherit" />
      </Box>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '220px',
        flex: 1
      }}
    >
      <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }}>
        <Icon sx={{ fontSize: 100, color }} />
      </Box>
      <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>{title}</Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>{value}</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
        <Typography variant="caption" sx={{ color: '#4caf50' }}>{trend} than last month</Typography>
      </Stack>
    </Box>
  )

  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        mx: 5,
        my: 1,
        borderRadius: '8px',
        pb: 4,
        px: 4,
        pt: 2,
        color: 'white'
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>Tổng quan Dashboard</Typography>

      <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
        <StatCard title="Tổng Sản phẩm" value={summary.totalProducts} icon={InventoryIcon} color="#2196f3" trend="+12%" />
        <StatCard title="Tổng Đơn hàng" value={summary.totalOrders} icon={ShoppingCartIcon} color="#ff9800" trend="+5%" />
        <StatCard title="Tổng Doanh thu" value={`${(summary.totalRevenue / 1000000).toFixed(1)}M`} icon={MonetizationOnIcon} color="#4caf50" trend="+18%" />
        <StatCard title="Khách hàng" value={summary.totalCustomers} icon={PeopleIcon} color="#e91e63" trend="+24%" />
      </Stack>

      <Grid container spacing={3}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} md={8}>
          <Box sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Xu hướng Doanh thu (Tuần)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="day" stroke="#555" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4caf50" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Top Products Pie */}
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Top 5 Sản phẩm bán chạy</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={topProducts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Order Status Bar */}
        <Grid item xs={12}>
          <Box sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Phân tích trạng thái đơn hàng</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatus} layout="horizontal">
                <XAxis dataKey="status" stroke="#888" axisLine={false} tickLine={false} />
                <YAxis stroke="#888" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#2196f3" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
