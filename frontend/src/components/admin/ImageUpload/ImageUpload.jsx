import React, { useState, useRef, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'

function ImageUpload({ label, required, onImageChange, error, helperText, currentImageUrl, multiple }) {
  const [previews, setPreviews] = useState([])
  const [fileList, setFileList] = useState([]) // Lưu trữ tất cả File objects
  const fileInputRef = useRef(null)

  // Chỉ đồng bộ ảnh cũ từ server vào preview khi component mount hoặc khi ảnh cũ thực sự thay đổi
  useEffect(() => {
    if (currentImageUrl && currentImageUrl.length > 0) {
      const initialImages = Array.isArray(currentImageUrl) ? currentImageUrl : [currentImageUrl]
      setPreviews(initialImages)
    }
  }, [currentImageUrl])

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files)
    if (selectedFiles.length > 0) {
      if (multiple) {
        // Tích lũy file mới vào danh sách hiện tại
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
        const updatedFiles = [...fileList, ...selectedFiles]
        setPreviews(prev => [...prev, ...newPreviews])
        setFileList(updatedFiles)
        onImageChange(updatedFiles)
      } else {
        const newPreviews = [URL.createObjectURL(selectedFiles[0])]
        setPreviews(newPreviews)
        setFileList([selectedFiles[0]])
        onImageChange(selectedFiles[0])
      }
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClearImages = () => {
    setPreviews([])
    setFileList([])
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
