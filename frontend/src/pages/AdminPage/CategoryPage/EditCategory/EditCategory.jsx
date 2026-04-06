import React, { useState, useEffect } from 'react'
import { Box, Button, Typography, Snackbar, Alert, CircularProgress } from '@mui/material'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import { fetchAllCategorysAPI, getCategoryDetailAPI, updateCategoryAPI } from '~/apis/categoryAPIs'
import { useNavigate, useParams } from 'react-router-dom'
import SaveIcon from '@mui/icons-material/Save'

function EditCategory() {
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [loading, setLoading] = useState(false)
  const [productCategories, setProductCategories] = useState([])

  const navigate = useNavigate()
  const { categoryId } = useParams()

  const [formData, setFormData] = useState({
    name: '',
    parentId: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategorysAPI()

        // Build tree
        const map = {}
        data.forEach(cat => (map[cat._id] = { ...cat, children: [] }))
        data.forEach(cat => {
          if (cat.parentId) {
            map[cat.parentId]?.children.push(map[cat._id])
          }
        })

        const options = []

        // Chỉ cho phép tầng 1 và tầng 2 làm parent
        data.forEach(cat => {
          if (!cat.parentId) {
            options.push({ value: cat._id, label: cat.name }) // tầng 1
            map[cat._id].children.forEach(child => {
              options.push({ value: child._id, label: `${child.name} - ${cat.name}` }) // tầng 2
              // Tầng 3 sẽ không được thêm vào options
            })
          }
        })

        setProductCategories(options)
      } catch {
        //
      }
    }

    fetchCategories()
  }, [])


  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true)
      try {
        const category = await getCategoryDetailAPI(categoryId)
        setFormData({
          name: category.name || '',
          parentId: category.parentId || ''
        })
      } catch {
        setSnackbarMessage('Không thể lấy thông tin danh mục. Vui lòng thử lại!')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      } finally {
        setLoading(false)
      }
    }
    if (categoryId) {
      fetchCategoryData()
    }
  }, [categoryId])

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbar(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const tempErrors = {
      name: formData.name ? '' : 'Vui lòng nhập tên danh mục.',
    }

    setErrors(tempErrors)
    return Object.values(tempErrors).every((x) => x === '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const categoryDataToUpdate = {
        name: formData.name.trim(),
        parentId: formData.parentId || null
      }

      await updateCategoryAPI(categoryId, categoryDataToUpdate)

      setSnackbarMessage('Sản phẩm đã được cập nhật thành công!')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      setTimeout(() => {
        navigate('/admin/category')
      }, 800)

      setErrors({})
    } catch {
      setSnackbarMessage('Có lỗi xảy ra khi cập nhật danh mục. Vui lòng thử lại!')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
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
      <Box
        sx={{
          color: 'white',
          m: '16px 48px 16px 16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h5">Chỉnh sửa danh mục</Typography>
      </Box>
      <Box sx={{ px: 6 }} component="form" onSubmit={handleSubmit}>
        <FieldCustom
          label="Danh mục cha"
          required={true}
          options={productCategories}
          value={productCategories.some(cat => cat.value === formData.parentId) ? formData.parentId : ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            parentId: e.target.value
          }))}
          name="parentId"
          error={!!errors.parentId}
          helperText={errors.parentId}
        />
        <FieldCustom
          label="Tên danh mục"
          required
          placeholder="Nhập tên danh mục..."
          value={formData.name}
          onChange={handleChange}
          name="name"
          error={!!errors.name}
          helperText={errors.name}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              my: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'none',
              fontSize: '18px'
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : <SaveIcon />}
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '46px' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EditCategory
