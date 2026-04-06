import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material'
import TablePageControls from '../TablePageControls/TablePageControls'
import { getShiftsByEmployeeAndMonthAPI } from '~/apis/workshiftAPIs'
import WorkShiftCpn from '../WorkShiftCpn/WorkShiftCpn'

const TableWorkShift = () => {
  const [rows, setRows] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { id } = useParams()

  const fetchWorkShifts = async (monthDate) => {
    try {
      const month = monthDate.getMonth() + 1
      const year = monthDate.getFullYear()
      const data = await getShiftsByEmployeeAndMonthAPI( id, year, month)
      setRows(data)
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setRows([])
      setSnackbarMessage('Không có dữ liệu trong tháng này hoặc lỗi. Vui lòng thử lại.')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    if (selectedMonth) fetchWorkShifts(selectedMonth)
  }, [selectedMonth])

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') setOpenSnackbar(false)
  }

  const handleChangePage = (_, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <>
      <WorkShiftCpn
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        selectedMonth={selectedMonth}
        onMonthChange={(newMonth) => {
          if (newMonth) {
            setSelectedMonth(newMonth)
            fetchWorkShifts(newMonth)
          }
        }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000 }} aria-label='workshift table'>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>STT</TableCell>
              <TableCell>Ngày làm</TableCell>
              <TableCell>Giờ bắt đầu</TableCell>
              <TableCell>Giờ kết thúc</TableCell>
              <TableCell>Tổng giờ</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((shift, index) => (
                <TableRow key={shift._id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{new Date(shift.workDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(shift.startTime).toLocaleTimeString()}</TableCell>
                  <TableCell>{new Date(shift.endTime).toLocaleTimeString()}</TableCell>
                  <TableCell>{shift.totalHours.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: shift.shiftStatus === 'Completed' ? '#e8f5e8' : '#ffe6e6',
                        color: shift.shiftStatus === 'Completed' ? '#2e7d32' : '#d32f2f',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {shift.shiftStatus}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePageControls
        page={page}
        rowsPerPage={rowsPerPage}
        count={rows.length}
        onChangePage={handleChangePage}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '46px' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TableWorkShift
