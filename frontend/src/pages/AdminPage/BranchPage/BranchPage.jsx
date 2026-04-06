// frontend/src/pages/branch/BranchPage.jsx
import React, { useState } from 'react'
import {
  Box, Button, Typography, Snackbar, Alert, Tooltip
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import AddBranch from './AddBranch/AddBranch'
import EditBranch from './EditBranch/EditBranch'
import TableBranch from '~/components/admin/TableBranch/TableBranch'

function BranchPage() {
  const [openAdd, setOpenAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })
  const [reload, setReload] = useState(0)

  // ✅ Hàm reload chung
  const doReload = () => setReload((x) => x + 1)

  // ✅ Thêm xong → thông báo + đóng dialog + reload
  const onCreated = (msg = 'Tạo chi nhánh thành công') => {
    setToast({ open: true, message: msg, severity: 'success' })
    setOpenAdd(false)
    doReload()
  }

  // ✅ Sửa xong → thông báo + đóng dialog + reload
  const onUpdated = (msg = 'Cập nhật chi nhánh thành công') => {
    setToast({ open: true, message: msg, severity: 'success' })
    setEditId(null)
    doReload()
  }

  // ✅ Lỗi chung
  const onError = (msg = 'Có lỗi xảy ra') => {
    setToast({ open: true, message: msg, severity: 'error' })
  }

  // ✅ Thành công chung (cho các action từ TableBranch: xoá / toggle / v.v.)
  const onRowSuccess = (msg = 'Thao tác thành công') => {
    setToast({ open: true, message: msg, severity: 'success' })
    doReload()
  }

  return (
    <Box sx={{ bgcolor: '#bcbcbc', minHeight: '100vh', px: 3, py: 2 }}>
      <Box
        sx={{
          bgcolor: '#2f3136',
          color: '#fff',
          borderRadius: '10px',
          ml: '32px',
          mr: '32px',
          pt: 3,
          pb: 2,
          px: 4
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Quản Lý Chi Nhánh
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Thêm chi nhánh">
              <Button
                onClick={() => setOpenAdd(true)}
                sx={{
                  minWidth: 46,
                  height: 46,
                  p: 0,
                  borderRadius: '8px',
                  bgcolor: '#2EE383',
                  '&:hover': { bgcolor: '#26c873' }
                }}
              >
                <AddOutlinedIcon sx={{ color: '#fff' }} />
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ px: 2 }}>
          <TableBranch
            // 🔁 Table sẽ useEffect theo reloadKey để gọi API lại
            reloadKey={reload}
            onEdit={(id) => setEditId(id)}
            onError={onError}

            // ⬇️ quan trọng: mọi thao tác thành công trong bảng (xoá / toggle / …)
            // gọi onSuccess sẽ hiển thị toast + reload danh sách
            onSuccess={onRowSuccess}
          />
        </Box>
      </Box>

      {/* Dialog Thêm */}
      <AddBranch
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={onCreated} // sẽ toast + reload + đóng dialog
        onError={onError}
      />

      {/* Dialog Sửa */}
      {editId && (
        <EditBranch
          id={editId}
          open={Boolean(editId)}
          onClose={() => setEditId(null)}
          onSuccess={onUpdated}// sẽ toast + reload + đóng dialog
          onError={onError}
        />
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BranchPage
