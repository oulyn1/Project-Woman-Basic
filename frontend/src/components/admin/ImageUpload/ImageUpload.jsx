import React, { useState, useRef, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'

function ImageUpload({ label, required, onImageChange, error, helperText, currentImageUrl }) {
  const [preview, setPreview] = useState(currentImageUrl || null)
  const fileInputRef = useRef(null)

  // ✅ Cập nhật preview khi currentImageUrl thay đổi (khi fetch xong product)
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl)
    }
  }, [currentImageUrl])

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPreview(URL.createObjectURL(file)) // hiện ảnh vừa chọn
      onImageChange(file) // báo file lên EditProduct
    }
  }

  const handleClearImage = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onImageChange(null) // clear trong EditProduct
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ mb: 1, color: 'white', display: 'flex', alignItems: 'center', gap: '2px' }}
      >
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      {/* input file ẩn */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* nút chọn ảnh */}
      <Button
        variant="contained"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        sx={{ mr: 2 }}
      >
        Chọn ảnh
      </Button>

      {/* nút xóa ảnh */}
      {preview && (
        <Button variant="outlined" color="error" onClick={handleClearImage}>
          Xóa ảnh
        </Button>
      )}

      {/* hiển thị ảnh preview */}
      {preview && (
        <Box sx={{ mt: 2 }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '200px', borderRadius: '8px' }}
          />
        </Box>
      )}

      {/* báo lỗi */}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

export default ImageUpload
