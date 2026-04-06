import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';

import {
  AllUsersAPI,
  searchUserAPI,
  deleteUserAPI,
} from '~/apis/userAPIs';
import TablePageControls from '../TablePageControls/TablePageControls';
import TableRowsPerPage from '../TableRowsPerPage/TableRowsPerPage';
const TableAccount = ({ onEditAccount }) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('accessToken');

  // Hook debounce để giảm số lần gọi API
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!debouncedSearchQuery) {
          const data = await AllUsersAPI(token);
          setRows(data);
        } else {
          const data = await searchUserAPI(debouncedSearchQuery, token);
          setRows(data);
        }
      } catch {
        setRows([]);
        setSnackbarMessage(
          'Không thể tải dữ liệu Tài khoản. Vui lòng thử lại.'
        );
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    };
    fetchUsers();
  }, [debouncedSearchQuery]);

  const handleEdit = (id) => {
    onEditAccount(id);
  };

  const handleDelete = (id) => {
    setDeletingProductId(id);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUserAPI(deletingProductId);
      setRows(rows.filter((product) => product._id !== deletingProductId));

      setSnackbarMessage('Tài khoản đã được xóa thành công!');
      setSnackbarSeverity('success');
    } catch {
      setSnackbarMessage('Lỗi khi xóa tài khoản. Vui lòng thử lại.');
      setSnackbarSeverity('error');
    } finally {
      setOpenSnackbar(true);
      setOpenDeleteConfirm(false);
      setDeletingProductId(null);
    }
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setDeletingProductId(null);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') {
      setOpenSnackbar(false);
    }
  };
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <TableRowsPerPage
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 100]}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 1000 }} aria-label='user table'>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ width: '50px' }}>STT</TableCell>
              <TableCell sx={{ width: '200px' }}>HỌ VÀ TÊN</TableCell>
              <TableCell sx={{ width: '250px' }}>EMAIL</TableCell>
              <TableCell sx={{ width: '120px' }}>PHÂN QUYỀN</TableCell>
              <TableCell sx={{ width: '130px' }}>NGÀY TẠO</TableCell>
              <TableCell sx={{ width: '130px' }}>CẬP NHẬT</TableCell>
              <TableCell sx={{ width: '150px' }}>ĐIỆN THOẠI</TableCell>
              <TableCell sx={{ width: '200px' }}>ĐỊA CHỈ</TableCell>
              <TableCell sx={{ width: '120px' }}>Trạng thái</TableCell>
              <TableCell sx={{ width: '120px' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={row._id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#fafafa' },
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                  <TableCell>
                    <Typography variant='body2'>{row.name}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 150 }}>
                    <Typography variant='body2'>{row.email}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant='body2'>{row.role}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 150 }}>
                    <Typography variant='body2'>
                      {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>

                  <TableCell align='right'>
                    <Typography variant='body2'>
                      {new Date(row.updatedAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant='body2'>{row.phone}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant='body2'>{row.address}</Typography>
                  </TableCell>

                  <TableCell align='center'>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          row.status == 'online' ? '#e8f5e8' : '#ffe6e6',
                        color: row.status == 'online' ? '#2e7d32' : '#d32f2f',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {row.status == 'online' ? 'Online' : 'Offline'}
                    </Box>
                  </TableCell>
                  <TableCell align='center'>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}
                    >
                      <Tooltip title='Sửa tài khoản'>
                        <IconButton
                          color='primary'
                          size='small'
                          onClick={() => handleEdit(row._id)}
                          sx={{
                            width: 46,
                            height: 46,
                            minWidth: 32,
                            padding: 0,
                            borderRadius: 1,
                            backgroundColor: '#e8f5e8',
                            '&:hover': { backgroundColor: '#c8e6c9' },
                          }}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title='Xóa tài khoản'>
                        <IconButton
                          color='error'
                          size='small'
                          onClick={() => handleDelete(row._id)}
                          sx={{
                            width: 46,
                            height: 46,
                            minWidth: 32,
                            padding: 0,
                            borderRadius: 1,
                            backgroundColor: '#ffebee',
                            '&:hover': { backgroundColor: '#ffcdd2' },
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
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

      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa tài khoản này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color='primary'>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default TableAccount;
