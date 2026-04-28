import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL']
const COLOR_PALETTE = [
  { name: 'Đen', hex: '#000000' },
  { name: 'Trắng', hex: '#ffffff' },
  { name: 'Đỏ', hex: '#ff0000' },
  { name: 'Xanh dương', hex: '#0000ff' },
  { name: 'Xanh lá', hex: '#00ff00' },
  { name: 'Vàng', hex: '#ffff00' },
  { name: 'Cam', hex: '#ff8c00' },
  { name: 'Hồng', hex: '#ffc0cb' },
  { name: 'Tím', hex: '#800080' },
  { name: 'Xám', hex: '#808080' },
]

import FieldCustom from '~/components/admin/FieldCustom/FieldCustom'
import ImageUpload from '~/components/admin/ImageUpload/ImageUpload'
import {
  createProductAPI,
  uploadImageToCloudinaryAPI,
} from '~/apis/productAPIs'
import { fetchAllCategoriesAPI } from '~/apis/categoryAPIs'
import { analyzeProductWithAIAPI } from '~/apis/aiAnalyzeAPIs'

// Giới hạn kích thước ảnh tối đa cho AI: 4MB
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024

/**
 * Convert a File object to base64 string (without data URI prefix)
 */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * Wrapper quanh FieldCustom để hiển thị AI highlight (viền xanh + Chip "AI")
 */
function AIField({ aiHighlight, label, children, ...props }) {
  return (
    <Box sx={{ position: 'relative', flex: 1 }}>
      {aiHighlight && (
        <Chip
          label="AI"
          size="small"
          icon={<AutoAwesomeIcon sx={{ fontSize: '12px !important' }} />}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1,
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 'bold',
            backgroundColor: '#1b5e20',
            color: '#a5d6a7',
            border: '1px solid #2e7d32',
            '& .MuiChip-icon': { color: '#a5d6a7' },
          }}
        />
      )}
      <Box
        sx={
          aiHighlight
            ? {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#2e7d32', borderWidth: 2 },
                  '&:hover fieldset': { borderColor: '#43a047' },
                },
                transition: 'all 0.3s ease',
              }
            : {}
        }
      >
        <FieldCustom label={label} {...props} />
      </Box>
    </Box>
  )
}

function AddProduct({ open, onClose, onSuccess }) {
  const [productCategories, setProductCategories] = useState([])
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    price: '',
    description: '',
    material: '',
    tags: '',
    files: [],
  })

  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [variantsMatrix, setVariantsMatrix] = useState({})

  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: '' })
  const [inlineError, setInlineError] = useState('') // lỗi hiện trực tiếp trong dialog
  const [submitting, setSubmitting] = useState(false)

  // ── AI state ──────────────────────────────────────────────────────────────
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFilledFields, setAiFilledFields] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchAllCategoriesAPI()
        const options = data.map((cat) => ({
          value: cat._id,
          label: cat.name,
        }))
        setProductCategories(options)
      } catch {
        /* ... */
      }
    }
    if (open) fetchCategories()
  }, [open])

  // Reset state khi dialog đóng
  useEffect(() => {
    if (!open) {
      setAiFilledFields([])
      setAiLoading(false)
      setInlineError('')
    }
  }, [open])

  const handleSizeChange = (event, newSizes) => {
    setSelectedSizes(newSizes)
  }

  const handleColorToggle = (color) => {
    setSelectedColors((prev) => {
      const isSelected = prev.find((c) => c.hex === color.hex)
      if (isSelected) return prev.filter((c) => c.hex !== color.hex)
      return [...prev, color]
    })
  }

  const currentVariants = useMemo(() => {
    const matrix = []
    selectedSizes.forEach((size) => {
      selectedColors.forEach((color) => {
        matrix.push({ size, color })
      })
    })
    return matrix
  }, [selectedSizes, selectedColors])

  const handleStockChange = (size, colorHex, value) => {
    setVariantsMatrix((prev) => ({
      ...prev,
      [`${size}-${colorHex}`]: value,
    }))
  }

  const generateSkuPrefix = (name) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 3)
      .toUpperCase()
  }

  const generateObjectId = () => {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16)
    return (
      timestamp +
      'xxxxxxxxxxxxxxxx'
        .replace(/[x]/g, () => {
          return ((Math.random() * 16) | 0).toString(16)
        })
        .toLowerCase()
    )
  }

  // ── AI Analyze Handler ────────────────────────────────────────────────────
  const handleAIAnalyze = async () => {
    if (!formData.files || formData.files.length === 0) {
      setInlineError('Vui lòng upload ảnh sản phẩm trước khi phân tích bằng AI.')
      return
    }

    const imageFile = formData.files[0]

    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      setInlineError(`Ảnh quá lớn (${(imageFile.size / 1024 / 1024).toFixed(1)}MB). Giới hạn tối đa là 4MB.`)
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setInlineError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      return
    }

    setAiLoading(true)
    setAiFilledFields([])
    setInlineError('')

    try {
      const base64Image = await fileToBase64(imageFile)
      const response = await analyzeProductWithAIAPI(base64Image, token)
      const { name, category, description, tags } = response.data

      let matchedCategoryId = ''
      if (category && productCategories.length > 0) {
        const aiCategoryLower = category.toLowerCase().trim()
        const match = productCategories.find(
          (cat) =>
            cat.label.toLowerCase().includes(aiCategoryLower) ||
            aiCategoryLower.includes(cat.label.toLowerCase()),
        )
        if (match) matchedCategoryId = match.value
      }

      setFormData((prev) => ({
        ...prev,
        name: name || prev.name,
        categoryId: matchedCategoryId || prev.categoryId,
        description: description || prev.description,
        tags: Array.isArray(tags)
          ? tags.join(', ')
          : tags || prev.tags,
      }))

      const filled = []
      if (name) filled.push('name')
      if (matchedCategoryId) filled.push('categoryId')
      if (description) filled.push('description')
      if (tags && tags.length > 0) filled.push('tags')
      setAiFilledFields(filled)

      setSuccessSnackbar({
        open: true,
        message: '✨ AI đã phân tích và điền thông tin sản phẩm thành công!',
      })
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra khi phân tích ảnh bằng AI.'
      setInlineError(`Lỗi AI: ${errorMsg}`)
    } finally {
      setAiLoading(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.categoryId) {
      setInlineError('Vui lòng điền các trường bắt buộc (Tên, Giá, Danh mục).')
      return
    }
    setInlineError('')

    setSubmitting(true)
    try {
      const imageUrls = await Promise.all(
        formData.files.map((file) =>
          uploadImageToCloudinaryAPI(file).then((res) => res.secure_url),
        ),
      )

      const skuPrefix = generateSkuPrefix(formData.name)

      const payload = {
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        material: formData.material.trim(),
        slug: formData.name
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, ''),
        price: Number(formData.price),
        images: imageUrls,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((t) => t),
        variants: currentVariants.map((v) => ({
          _id: generateObjectId(),
          size: v.size,
          color: v.color,
          stock: Number(variantsMatrix[`${v.size}-${v.color.hex}`] || 0),
          sku: `${skuPrefix}-${v.size}-${v.color.name.toUpperCase().substring(0, 3)}`,
        })),
      }

      const createdProduct = await createProductAPI(payload)
      setSuccessSnackbar({ open: true, message: 'Thêm sản phẩm thành công!' })
      try {
        window.dispatchEvent(
          new CustomEvent('PRODUCT_ADDED', { detail: createdProduct }),
        )
      } catch {
        // ignore
      }
      onSuccess()
    } catch (err) {
      setInlineError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={aiLoading ? undefined : onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderRadius: '12px',
            border: '1px solid #333',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography component="div" variant="h6" fontWeight="bold">
            Thêm sản phẩm mới
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: '#888' }}
            disabled={aiLoading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* ── Loading Overlay khi AI đang phân tích ── */}
        {aiLoading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              borderRadius: '12px',
            }}
          >
            <CircularProgress size={52} sx={{ color: '#4caf50' }} />
            <Typography
              variant="body1"
              sx={{ color: '#a5d6a7', fontWeight: 500 }}
            >
              AI đang phân tích ảnh sản phẩm...
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Quá trình này có thể mất 10–30 giây
            </Typography>
          </Box>
        )}

        <DialogContent sx={{ p: 4 }}>

          {/* ── Inline Error Alert ── */}
          {inlineError && (
            <Alert
              severity="error"
              variant="filled"
              onClose={() => setInlineError('')}
              sx={{
                mb: 2,
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}
            >
              {inlineError}
            </Alert>
          )}

          {/* ── Image Upload + AI Button (ĐẦU FORM) ── */}
          <Box sx={{ mb: 3 }}>
            <ImageUpload
              multiple
              onImageChange={(files) => {
                setFormData((p) => ({ ...p, files }))
                if (aiFilledFields.length > 0) setAiFilledFields([])
              }}
              label="Ảnh sản phẩm"
            />

            {formData.files.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip
                  title="AI sẽ phân tích ảnh và tự động điền Tên, Danh mục, Mô tả, Tags"
                  placement="top"
                  arrow
                >
                  <span>
                    <Button
                      onClick={handleAIAnalyze}
                      disabled={aiLoading}
                      startIcon={
                        aiLoading ? (
                          <CircularProgress size={16} sx={{ color: 'inherit' }} />
                        ) : (
                          <AutoAwesomeIcon />
                        )
                      }
                      variant="outlined"
                      sx={{
                        borderColor: '#2e7d32',
                        color: '#a5d6a7',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: '8px',
                        background:
                          'linear-gradient(135deg, rgba(46,125,50,0.12) 0%, rgba(27,94,32,0.06) 100%)',
                        '&:hover': {
                          borderColor: '#43a047',
                          backgroundColor: 'rgba(46,125,50,0.2)',
                          boxShadow: '0 0 12px rgba(76,175,80,0.3)',
                        },
                        '&:disabled': {
                          borderColor: '#333',
                          color: '#555',
                        },
                        transition: 'all 0.25s ease',
                      }}
                    >
                      {aiLoading ? 'Đang phân tích...' : '✨ Phân tích bằng AI'}
                    </Button>
                  </span>
                </Tooltip>

                {aiFilledFields.length > 0 && (
                  <Typography variant="caption" sx={{ color: '#66bb6a' }}>
                    AI đã điền: {aiFilledFields.join(', ')}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Row 1: Name and Category */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2}>
            <AIField
              aiHighlight={aiFilledFields.includes('name')}
              label="Tên sản phẩm"
              required
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nhập tên sản phẩm..."
            />
            <AIField
              aiHighlight={aiFilledFields.includes('categoryId')}
              label="Danh mục"
              required
              select
              options={productCategories}
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            />
          </Stack>

          {/* Row 2: Price and Slug */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <FieldCustom
              label="Giá (VNĐ)"
              required
              type="number"
              name="price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0"
            />
            <FieldCustom
              label="Slug"
              disabled
              value={formData.name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')}
              placeholder="auto-generated-slug"
            />
          </Stack>

          {/* Row 3: Material */}
          <Box sx={{ mt: 1 }}>
            <FieldCustom
              label="Chất liệu"
              name="material"
              value={formData.material}
              onChange={(e) =>
                setFormData({ ...formData, material: e.target.value })
              }
              placeholder="VD: Tuyết mưa, Cotton, Denim..."
            />
          </Box>

          {/* Row 4: Description */}
          <Box sx={{ mt: 1 }}>
            <AIField
              aiHighlight={aiFilledFields.includes('description')}
              label="Mô tả sản phẩm"
              required
              multiline
              rows={4}
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả chi tiết sản phẩm..."
            />
          </Box>

          {/* Row 4: Tags */}
          <Box sx={{ mt: 1 }}>
            <AIField
              aiHighlight={aiFilledFields.includes('tags')}
              label="Tags (phân cách bởi dấu phẩy)"
              name="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="áo thun, mùa hè, mới"
            />
          </Box>

          {/* Size Selection */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#ccc' }}>
              Size hỗ trợ
            </Typography>
            <ToggleButtonGroup
              value={selectedSizes}
              onChange={handleSizeChange}
              aria-label="device"
              sx={{ gap: 1, flexWrap: 'wrap' }}
            >
              {SIZE_OPTIONS.map((size) => (
                <ToggleButton
                  key={size}
                  value={size}
                  sx={{
                    borderRadius: '50px !important',
                    border: '1px solid #333 !important',
                    color: 'white',
                    px: 3,
                    py: 0.5,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      backgroundColor: '#e8f5e9 !important',
                      color: '#2e7d32 !important',
                      borderColor: '#2e7d32 !important',
                    },
                  }}
                >
                  {size}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Color Selection */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#ccc' }}>
              Màu sắc
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 2 }}
            >
              {COLOR_PALETTE.map((color) => (
                <Box
                  key={color.hex}
                  onClick={() => handleColorToggle(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color.hex,
                    borderRadius: '50%',
                    border: selectedColors.find((c) => c.hex === color.hex)
                      ? '2px solid #2e7d32'
                      : '2px solid transparent',
                    boxShadow: '0 0 0 1px #444',
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedColors.map((color) => (
                <Chip
                  key={color.hex}
                  label={color.name}
                  onDelete={() => handleColorToggle(color)}
                  size="small"
                  sx={{
                    backgroundColor: '#333',
                    color: 'white',
                    borderRadius: '4px',
                    '& .MuiChip-deleteIcon': { color: '#888' },
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: color.hex,
                        ml: 1,
                      }}
                    />
                  }
                />
              ))}
            </Stack>
          </Box>

          {/* Variant Matrix */}
          <Box sx={{ mt: 5 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#ccc' }}>
              Tồn kho theo biến thể (size × màu)
            </Typography>
            {currentVariants.length > 0 ? (
              <Box
                sx={{
                  border: '1px solid #333',
                  borderRadius: '8px',
                  overflowX: 'auto',
                }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#252525' }}>
                    <TableRow>
                      <TableCell
                        sx={{ color: '#888', borderBottom: '1px solid #333' }}
                      >
                        Size \ Màu
                      </TableCell>
                      {selectedColors.map((c) => (
                        <TableCell
                          key={c.hex}
                          align="center"
                          sx={{ color: '#888', borderBottom: '1px solid #333' }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: c.hex,
                              }}
                            />
                            <Typography variant="caption">{c.name}</Typography>
                          </Stack>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSizes.map((size) => (
                      <TableRow key={size}>
                        <TableCell
                          sx={{
                            color: 'white',
                            borderBottom: '1px solid #333',
                            fontWeight: 'bold',
                          }}
                        >
                          {size}
                        </TableCell>
                        {selectedColors.map((color) => (
                          <TableCell
                            key={color.hex}
                            align="center"
                            sx={{ borderBottom: '1px solid #333' }}
                          >
                            <Box
                              component="input"
                              type="number"
                              value={
                                variantsMatrix[`${size}-${color.hex}`] || ''
                              }
                              onChange={(e) =>
                                handleStockChange(
                                  size,
                                  color.hex,
                                  e.target.value,
                                )
                              }
                              sx={{
                                width: 50,
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: 'white',
                                textAlign: 'center',
                                py: 0.5,
                                '&:focus': {
                                  outline: 'none',
                                  borderColor: '#2e7d32',
                                },
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ fontStyle: 'italic', color: '#666' }}
              >
                Chọn ít nhất một size và một màu để nhập tồn kho.
              </Typography>
            )}
          </Box>

        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button
            onClick={onClose}
            disabled={aiLoading}
            sx={{ color: '#888', textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || aiLoading}
            sx={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 4,
              '&:hover': { backgroundColor: '#c8e6c9' },
            }}
          >
            {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {successSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AddProduct
