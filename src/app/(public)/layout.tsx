'use client'
import { ReactNode } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import Footer from '@/components/marketing-page/components/Footer'
import AppAppBar from '@/components/marketing-page/components/AppAppBar'

export default function Layout(props: { children: ReactNode }) {
  return (
    <>
      <CssBaseline />
      <AppAppBar />
      {props.children}
      <Divider />
      <Footer />
    </>
  )
}
