'use client'
import React from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Card,
  CardContent,
  Grid,
  Paper,
  Link,
} from '@mui/material'

export default function AdminBar() {
  return (
    <AppBar
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography variant='h6' noWrap>
          Certo Admin Panel
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
