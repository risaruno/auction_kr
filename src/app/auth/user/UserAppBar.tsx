'use client'
import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function UserAppBar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleHome = () => {
    router.push('/')
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'primary.main'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleHome}
        >
          체르토 - 마이페이지
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2">
              {user?.full_name || user?.email || '사용자'}
            </Typography>
          </Box>
          
          <Button 
            color="inherit" 
            onClick={handleLogout}
            variant="outlined"
            size="small"
          >
            로그아웃
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
