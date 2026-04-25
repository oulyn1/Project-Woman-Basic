import { Button } from '@mui/material'
import React from 'react'
import { useLocation } from 'react-router-dom'

function SideBarItem({ icon: Icon, title, handleSideBarCllick, to }) {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Button
      sx={{
        width: 'calc(100% - 32px)',
        height: '50px',
        mx: '16px',
        px: '20px',
        fontSize: '16px',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#00FF87' : '#94A3B8',
        display: 'flex',
        gap: 1.5,
        justifyContent: 'flex-start',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        borderRadius: '12px',
        backgroundColor: isActive ? 'rgba(0, 255, 135, 0.1)' : 'transparent',
        boxShadow: isActive ? '0 0 16px rgba(0,255,135,0.1)' : 'none',
        border: isActive ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'white',
          transform: 'translateX(4px)',
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
