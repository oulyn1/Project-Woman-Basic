import { Box, Typography, InputBase } from '@mui/material'
import React, { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import TableCustomer from '~/components/admin/TableCustomer/TableCustomer'

function Customer() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        mx: { xs: 1, md: 5 },
        my: 1,
        borderRadius: '8px',
        minHeight: '80vh',
        pb: 4
      }}
    >
      {/* Header with Search */}
      <Box sx={{ px: { xs: 2, md: 5 }, py: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            px: 2,
            py: 0.5,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <SearchIcon sx={{ color: '#888', mr: 1 }} />
          <InputBase
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: 'white', flex: 1 }}
          />
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 5 } }}>
        <TableCustomer searchQuery={searchQuery} />
      </Box>
    </Box>
  )
}

export default Customer
