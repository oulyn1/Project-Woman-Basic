import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useNavigate } from 'react-router-dom'

import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import ImageUpload from '~/components/admin/ImageUpload/ImageUpload'
import {
  createProductAPI,
  uploadImageToCloudinaryAPI
} from '~/apis/productAPIs'
import { fetchAllCategorysAPI } from '~/apis/categoryAPIs'

function AddProduct() {
  const navigate = useNavigate()

  const [productCategories, setProductCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategorysAPI()

        // Build map để tra cứu cha
        const map = {}
        data.forEach(cat => (map[cat._id] = { ...cat }))

        const level3Options = []

        data.forEach(cat => {
          // Lọc ra các category tầng 3
          if (cat.parentId && map[cat.parentId]?.parentId) {
            const parent = map[cat.parentId]
            const grandParent = map[parent.parentId]

            const label = `${cat.name} - ${parent.name} - ${grandParent.name}`
            level3Options.push({ value: cat._id, label })
          }
        })

        setProductCategories(level3Options)
      } catch {
        //
      }
    }

    fetchCategories()
  }, [])


  // State dữ liệu form
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    price: '',
    material: '',
    quantity: '',
    description: '',
    image: null
  })

  // State lỗi validation
  const [errors, setErrors] = useState({})

  // State Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Hàm đóng Snackbar
  const handleCloseSnackbar = (_, reason) => {
    if (reason !== 'clickaway') {
      setSnackbar((prev) => ({ ...prev, open: false }))
    }
  }

  // Xử lý thay đổi input text
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Xử lý thay đổi ảnh
  const handleImageChange = (file) => {
    setFormData((prev) => ({ ...prev, image: file }))
    setErrors((prev) => ({ ...prev, image: '' }))
  }

  // Validate dữ liệu
  const validate = () => {
    const tempErrors = {
      category: formData.category ? '' : 'Vui lòng chọn danh mục.',
      name: formData.name ? '' : 'Vui lòng nhập tên sản phẩm.',
      price:
        /^[0-9]+$/.test(formData.price) && formData.price
          ? ''
          : 'Giá phải là số và không được để trống.',
      material: formData.material ? '' : 'Vui lòng nhập chất liệu.',
      quantity:
        /^[0-9]+$/.test(formData.quantity) && formData.quantity
          ? ''
          : 'Số lượng phải là số và không được để trống.',
      description: formData.description ? '' : 'Vui lòng nhập mô tả.',
      image: formData.image ? '' : 'Vui lòng chọn một ảnh.'
    }

    setErrors(tempErrors)
    return Object.values(tempErrors).every((x) => x === '')
  }

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      let imageUrl = null
      if (formData.image) {
        const uploadResponse = await uploadImageToCloudinaryAPI(formData.image)
        imageUrl = uploadResponse.secure_url
      }

      const productData = {
        categoryId: formData.category,
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price, 10),
        stock: parseInt(formData.quantity, 10),
        material: formData.material,
        image: imageUrl
      }

      await createProductAPI(productData)

      setSnackbar({
        open: true,
        message: 'Sản phẩm đã được thêm thành công!',
        severity: 'success'
      })

      setTimeout(() => navigate('/admin/product'), 500)
      setErrors({})
    } catch {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại!',
        severity: 'error'
      })
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: '#343a40',
        mx: 5,
        my: 1,
        borderRadius: '8px',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          color: 'white',
          m: '16px 48px 16px 16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h5">Thêm sản phẩm</Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ px: 6 }}>
        <FieldCustom
          label="Danh mục sản phẩm"
          required={true}
          options={productCategories}
          value={formData.category}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            category: e.target.value
          }))}
          name="category"
          error={!!errors.category}
          helperText={errors.category}
        />
        <FieldCustom
          label="Tên sản phẩm"
          required
          placeholder="Nhập tên sản phẩm..."
          value={formData.name}
          onChange={handleChange}
          name="name"
          error={!!errors.name}
          helperText={errors.name}
        />
        <FieldCustom
          label="Giá sản phẩm"
          required
          placeholder="Nhập giá sản phẩm..."
          value={formData.price}
          onChange={handleChange}
          name="price"
          error={!!errors.price}
          helperText={errors.price}
        />
        <FieldCustom
          label="Chất liệu sản phẩm"
          required
          placeholder="Nhập chất liệu sản phẩm..."
          value={formData.material}
          onChange={handleChange}
          name="material"
          error={!!errors.material}
          helperText={errors.material}
        />
        <FieldCustom
          label="Số lượng sản phẩm"
          required
          placeholder="Nhập số lượng sản phẩm..."
          value={formData.quantity}
          onChange={handleChange}
          name="quantity"
          error={!!errors.quantity}
          helperText={errors.quantity}
        />
        <FieldCustom
          label="Mô tả sản phẩm"
          required
          multiline
          rows={3}
          placeholder="Nhập mô tả sản phẩm..."
          value={formData.description}
          onChange={handleChange}
          name="description"
          error={!!errors.description}
          helperText={errors.description}
        />
        <ImageUpload
          label="Ảnh sản phẩm"
          required
          onImageChange={handleImageChange}
          error={!!errors.image}
          helperText={errors.image}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            sx={{
              my: 2,
              gap: 1,
              textTransform: 'none',
              fontSize: '18px'
            }}
          >
            Thêm sản phẩm
          </Button>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '46px' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AddProduct
