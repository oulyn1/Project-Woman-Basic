import React, { useRef } from 'react'
import { Box, TextField } from '@mui/material'

function OtpInput({ otp, setOtp, length = 6 }) {
  const inputsRef = useRef([])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // chỉ cho số
    if (!value) return

    let newOtp = otp.split('')
    newOtp[index] = value[0]
    setOtp(newOtp.join(''))

    // focus sang ô tiếp theo
    if (index < length - 1) {
      inputsRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      let newOtp = otp.split('')
      newOtp[index] = ''
      setOtp(newOtp.join(''))

      if (index > 0 && !otp[index]) {
        inputsRef.current[index - 1].focus()
      }
    }
  }

  return (
    <Box display="flex" justifyContent="center" gap={1}>
      {Array.from({ length }).map((_, i) => (
        <TextField
          key={i}
          inputRef={(el) => (inputsRef.current[i] = el)}
          value={otp[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center', fontSize: '20px', width: '40px' }
          }}
        />
      ))}
    </Box>
  )
}

export default OtpInput
