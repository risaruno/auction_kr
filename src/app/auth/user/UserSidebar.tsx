'use client'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from '@mui/material'
import {
  History as HistoryIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

const drawerWidth = 240

const menuItems = [
  { text: '홈으로', href: '/', icon: <HomeIcon /> },
  { text: '입찰 내역', href: '/auth/user/history', icon: <HistoryIcon /> },
  { text: '프로필 관리', href: '/auth/user/profile', icon: <PersonIcon /> },
  { text: '대리입찰 신청', href: '/apply-bid', icon: <GavelIcon /> },
  { text: 'Inquiries', href: '/inquiries', icon: <HistoryIcon /> },
]

export default function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <Drawer
      variant="permanent"
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
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={pathname === item.href}
                onClick={() => handleNavigation(item.href)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
