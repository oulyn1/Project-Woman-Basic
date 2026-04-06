import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

const TablePageControls = ({ page, rowsPerPage, count, onChangePage }) => {
  const isFirstPage = page === 0
  const isLastPage = (page + 1) * rowsPerPage >= count

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 2, gap: 2 }}>
      <Typography variant="body2" sx={{ color: 'white' }}>
        {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, count)} của {count}
      </Typography>
      <IconButton onClick={() => onChangePage(null, page - 1)} disabled={isFirstPage} sx={{ color: 'white' }}>
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton onClick={() => onChangePage(null, page + 1)} disabled={isLastPage} sx={{ color: 'white' }}>
        <KeyboardArrowRightIcon />
      </IconButton>
    </Box>
  )
}

export default TablePageControls