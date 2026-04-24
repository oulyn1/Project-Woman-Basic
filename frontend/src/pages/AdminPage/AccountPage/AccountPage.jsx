import { Box, Button, Typography, InputBase, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import React, { useState } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import SearchIcon from '@mui/icons-material/Search'
import TableAccount from '~/components/admin/TableAccount/TableAccount'
import AddAccount from './AddAccount/AddAccount'
import EditAccount from './EditAccount/EditAccount'

function AccountPage() {
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('ALL')

  const [fetchTrigger, setFetchTrigger] = useState(0)

  const handleAddClick = () => setOpenAddModal(true)

  const handleEditClick = (id) => {
    setSelectedId(id)
    setOpenEditModal(true)
  }

  const handleSuccess = () => {
    setOpenAddModal(false)
    setOpenEditModal(false)
    setFetchTrigger(prev => prev + 1)
  }

  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        mx: 5,
        my: 1,
        borderRadius: '8px',
        minHeight: '80vh',
        pb: 4
      }}
    >
      {/* Header with Search, Filter and Add Button */}
      <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
            placeholder="Tìm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: 'white', flex: 1 }}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            displayEmpty
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#66FF99' }
            }}
          >
            <MenuItem value="ALL">Tất cả vai trò</MenuItem>
            <MenuItem value="admin">Quản trị viên</MenuItem>
            <MenuItem value="employee">Nhân viên</MenuItem>
            <MenuItem value="customer">Khách hàng</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={handleAddClick}
          sx={{
            color: 'white',
            borderColor: '#333',
            textTransform: 'none',
            borderRadius: '8px',
            height: '40px',
            px: 3,
            '&:hover': { borderColor: '#444', backgroundColor: '#1a1a1a' }
          }}
        >
          Thêm tài khoản
        </Button>
      </Box>

      <Box sx={{ px: 5 }}>
        <TableAccount
          onEditAccount={handleEditClick}
          searchQuery={searchQuery}
          roleFilter={selectedRole}
          fetchTrigger={fetchTrigger}
        />
      </Box>

      <AddAccount
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={handleSuccess}
      />

      {selectedId && (
        <EditAccount
          open={openEditModal}
          accountId={selectedId}
          onClose={() => setOpenEditModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  )
}
export default AccountPage