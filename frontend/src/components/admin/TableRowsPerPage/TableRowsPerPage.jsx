import React from 'react'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { InputBase } from '@mui/material'

const TableRowsPerPage = ({ rowsPerPage, rowsPerPageOptions, onChangeRowsPerPage, onChange }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'white', whiteSpace: 'nowrap' }}>
        Số hàng mỗi trang:
        </Typography>
        <Select
          variant="standard"
          value={rowsPerPage}
          onChange={onChangeRowsPerPage}
          sx={{
            color: 'white',
            '& .MuiSvgIcon-root': { color: 'white' }
          }}
        >
          {rowsPerPageOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
        <Typography variant="body1" sx={{ color: 'white' }}>
          Search:
        </Typography>
        <InputBase
          onChange={onChange}
          sx={{
            color: 'white',
            borderBottom: '1px solid white',
            minWidth: 300,
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '&:after': {
              borderBottom: '2px solid white',
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default TableRowsPerPage