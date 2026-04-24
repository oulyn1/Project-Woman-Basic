import React, { useState, useRef, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'

function ImageUpload({ label, required, onImageChange, error, helperText, currentImageUrl, multiple }) {
  const [previews, setPreviews] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (currentImageUrl) {
      setPreviews(Array.isArray(currentImageUrl) ? currentImageUrl : [currentImageUrl])
    }
  }, [currentImageUrl])

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files)
    if (selectedFiles.length > 0) {
      const newFiles = multiple ? selectedFiles : [selectedFiles[0]]
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))

      setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews)
      onImageChange(multiple ? [...newFiles] : newFiles[0])
    }
  }

  const handleClearImages = () => {
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    onImageChange(multiple ? [] : null)
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, color: 'white', display: 'flex', alignItems: 'center', gap: '2px' }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} multiple={multiple} onChange={handleFileChange} />

      <Button variant="contained" onClick={() => fileInputRef.current && fileInputRef.current.click()} sx={{ mr: 2 }}>
        {multiple ? 'Thêm ảnh' : 'Chọn ảnh'}
      </Button>

      {previews.length > 0 && (
        <Button variant="outlined" color="error" onClick={handleClearImages}>Xóa tất cả</Button>
      )}

      {previews.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {previews.map((src, idx) => (
            <img key={idx} src={src} alt={`Preview ${idx}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
          ))}
        </Box>
      )}

      {error && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{helperText}</Typography>}
    </Box>
  )
}

export default ImageUpload
