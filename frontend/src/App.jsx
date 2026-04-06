import Button from '@mui/material/Button'
import HomePage from '~/pages/CustomerPage/HomePage/HomePage'
import { Box, Container } from '@mui/material'
import AdminPage from '~/pages/AdminPage/AdminPage'
import { Outlet } from 'react-router-dom'
function App() {

  return (
    <Box>
      <Outlet />
    </Box>
  )
}

export default App
