'use client'
import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import AppTheme from '@/components/shared-theme/AppTheme'
import Footer from '@/components/marketing-page/components/Footer'
import AppAppBar from '@/components/marketing-page/components/AppAppBar'

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <AppTheme>
      <CssBaseline />
      <AppAppBar />
      {props.children}
      <Divider />
      <Footer />
    </AppTheme>
  )
}
