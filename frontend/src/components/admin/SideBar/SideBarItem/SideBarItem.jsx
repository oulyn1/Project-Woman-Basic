import { Button } from '@mui/material'
import React from 'react'
import { useLocation } from 'react-router-dom'

function SideBarItem({ icon: Icon, title, handleSideBarCllick, to }) {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Button
      sx={{
        width: '100%',
        height: '50px',
        ml: '10px',
        fontSize: '18px',
        color: 'white',
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-start',
        textTransform: 'none',
        backgroundColor: isActive ? (theme) => theme.admin.focusColor : 'transparent',
        transform: isActive ? 'scale(1.02)' : 'none',
        '&:hover': {
          backgroundColor: (theme) => theme.admin.focusColor,
          transform: 'scale(1.02)',
        }
      }}
      onClick={handleSideBarCllick}
    >
      {Icon && <Icon sx={{ fontSize: 28 }} />}
      {title}
    </Button>
  )
}

export default SideBarItem
