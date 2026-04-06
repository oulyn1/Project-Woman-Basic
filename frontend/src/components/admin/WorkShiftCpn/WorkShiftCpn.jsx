import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const WorkShiftCpn = ({
  rowsPerPage,
  rowsPerPageOptions,
  onChangeRowsPerPage,
  selectedMonth,
  onMonthChange
}) => {
  // State tạm lưu tháng được chọn
  const [tempMonth, setTempMonth] = useState(selectedMonth || new Date());

  const handleConfirm = () => {
    onMonthChange(tempMonth); // gọi callback khi nhấn xác nhận
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      
      {/* Rows per page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

      {/* Chọn tháng */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'white', borderRadius: 1, p: '4px 12px' }}>
        <Typography variant="body2" sx={{ color: 'black' }}>Chọn tháng:</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year', 'month']}
            value={tempMonth}
            onChange={(newValue) => setTempMonth(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>

        {/* Nút xác nhận */}
        <Button 
          variant="contained" 
          size="small" 
          onClick={handleConfirm}
        >
          Xác nhận
        </Button>
      </Box>
    </Box>
  );
};

export default WorkShiftCpn;
