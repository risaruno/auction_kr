'use client'
import React from 'react'
import { Box, Drawer, CssBaseline, Toolbar } from '@mui/material'
import AdminBar from './AdminBar'
import AdminSidebar from './AdminSidebar'
import { RequireAdmin } from '@/components/auth/RequireAuth'

const drawerWidth = 240

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAdmin>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AdminBar />

        <Drawer
          variant='permanent'
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <AdminSidebar />
          </Box>
        </Drawer>

        <Box
          component='main'
          sx={{ flexGrow: 1, p: 3, backgroundColor: 'grey.50' }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </RequireAdmin>
  )
}
