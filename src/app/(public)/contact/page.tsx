'use client'
import * as React from 'react'
import CancelPolicy from '@/components/marketing-page/components/CancelPolicy'
import { Container } from '@mui/material'

export default function ContactPage() {
  return (
    <Container maxWidth='lg' sx={{ my: 5 }}>
      {/* <LogoCollection /> */}
      <CancelPolicy />
    </Container>
  )
}
