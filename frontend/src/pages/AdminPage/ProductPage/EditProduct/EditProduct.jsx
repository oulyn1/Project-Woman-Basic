import React, { useState, useEffect } from 'react'
import { Box, Button, Typography, Snackbar, Alert, CircularProgress } from '@mui/material'
import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import ImageUpload from '~/components/admin/ImageUpload/ImageUpload'
import { getProductDetailAPI, uploadImageToCloudinaryAPI, updateProductAPI } from '~/apis/productAPIs'
import { useNavigate, useParams } from 'react-router-dom'
import SaveIcon from '@mui/icons-material/Save'
import { fetchAllCategorysAPI } from '~/apis/categoryAPIs'

function EditProduct() {
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { productId } = useParams()

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    price: '',
    material: '',
    quantity: '',
    description: '',
    image: null,
    currentImageUrl: null
  })
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])

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

        setCategories(level3Options)
      } catch {
        //
      }
    }

    fetchCategories()
  }, [])


  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true)
      try {
        const product = await getProductDetailAPI(productId)
        setFormData({
          category: product.categoryId || '',
          name: product.name || '',
          price: product.price?.toString() || '',
          material: product.material || '',
          quantity: product.stock?.toString() || '',
          description: product.description || '',
          image: null,
          currentImageUrl: product.image || null
        })
      } catch {
        setSnackbarMessage('Không thể lấy thông tin sản phẩm. Vui lòng thử lại!')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      } finally {
        setLoading(false)
      }
    }
    if (productId) {
      fetchProductData()
    }
  }, [productId])

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbar(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (file) => {
    setFormData((prev) => ({ ...prev, image: file }))
    setErrors((prev) => ({ ...prev, image: '' }))
  }

  const validate = () => {
    const tempErrors = {
      category: formData.category ? '' : 'Vui lòng chọn danh mục.',
      name: formData.name ? '' : 'Vui lòng nhập tên sản phẩm.',
      price: /^[0-9]+$/.test(formData.price) ? '' : 'Giá phải là số và không được để trống.',
      material: formData.material ? '' : 'Vui lòng nhập chất liệu.',
      quantity: /^[0-9]+$/.test(formData.quantity) ? '' : 'Số lượng phải là số và không được để trống.',
      description: formData.description ? '' : 'Vui lòng nhập mô tả.',
      image: !formData.image && !formData.currentImageUrl ? 'Vui lòng chọn một ảnh.' : ''
    }

    setErrors(tempErrors)
    return Object.values(tempErrors).every((x) => x === '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      let imageUrl = formData.currentImageUrl
      if (formData.image) {
        const uploadResponse = await uploadImageToCloudinaryAPI(formData.image)
        imageUrl = uploadResponse.secure_url
      }

      const productDataToUpdate = {
        categoryId: formData.category,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price, 10),
        stock: parseInt(formData.quantity, 10),
        material: formData.material.trim(),
        image: imageUrl
      }

      await updateProductAPI(productId, productDataToUpdate)

      setSnackbarMessage('Sản phẩm đã được cập nhật thành công!')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      setTimeout(() => {
        navigate('/admin/product')
      }, 800)

      setErrors({})
    } catch {
      setSnackbarMessage('Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại!')
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
        <Typography variant="h5">Chỉnh sửa sản phẩm</Typography>
      </Box>
      <Box sx={{ px: 6 }} component="form" onSubmit={handleSubmit}>
        <FieldCustom
          label="Danh mục sản phẩm"
          required
          options={categories}
          value={formData.category}
          onChange={handleChange}
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
          currentImageUrl={formData.currentImageUrl}
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

export default EditProduct
