import React from 'react'
import { Box, Typography, TextField, MenuItem } from '@mui/material'

function FieldCustom({
  label,
  required,
  multiline,
  rows,
  placeholder,
  options,
  ...rest
}) {
  const isSelect = !!options

  const inputProps = isSelect ? {} : { multiline, rows }
  return (
    <Box sx={{ maxWidth: '100%', my: 2 }}>
      <Typography
        sx={{
          mb: 1,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          ...(required && {
            '&::after': {
              content: '"*"',
              color: 'red',
              ml: 0.5,
              mt: -0.5
            }
          })
        }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        select={isSelect}
        placeholder={placeholder}
        {...inputProps}
        {...rest}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.7)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
              opacity: 1,
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: 'white',
          },
          '& .MuiSvgIcon-root': {
            color: 'white',
          },
          '& .MuiMenu-paper': {
            backgroundColor: '#343a40'
          },
          '& .MuiMenuItem-root': {
            color: 'white'
          }
        }}
      >
        {isSelect && options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

export default FieldCustom