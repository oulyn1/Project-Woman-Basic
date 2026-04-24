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
    <Box sx={{ width: '100%' }}>
      <Typography
        sx={{
          mb: 1,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          ...(required && {
            '&::after': {
              content: '" *"',
              color: 'red',
              ml: 0.5
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
          width: '100%',

          '& .MuiOutlinedInput-root': {
            color: 'white',

            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.7)'
            },

            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white'
            },

            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white'
            },

            '&.Mui-disabled': {
              color: 'white',

              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)'
              }
            }
          },

          // 🔥 INPUT TEXT
          '& .MuiInputBase-input': {
            color: 'white',

            '&::placeholder': {
              color: 'rgba(255,255,255,0.5)',
              opacity: 1
            }
          },

          // 🔥 DISABLED TEXT (QUAN TRỌNG)
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: 'white !important',
            color: 'white !important'
          },

          // 🔥 MULTILINE DISABLED
          '& .MuiInputBase-inputMultiline.Mui-disabled': {
            WebkitTextFillColor: 'white !important'
          },

          // 🔥 SELECT DISABLED
          '& .MuiSelect-select.Mui-disabled': {
            WebkitTextFillColor: 'white !important',
            color: 'white !important'
          },

          // LABEL
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.7)'
          },

          '& .MuiInputLabel-root.Mui-focused': {
            color: 'white'
          },

          '& .MuiInputLabel-root.Mui-disabled': {
            color: 'rgba(255,255,255,0.4)'
          },

          // ICON
          '& .MuiSvgIcon-root': {
            color: 'white'
          },

          '& .MuiSvgIcon-root.Mui-disabled': {
            color: 'rgba(255,255,255,0.3)'
          }
        }}
      >
        {isSelect &&
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
      </TextField>
    </Box>
  )
}

export default FieldCustom