'use client'
import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import AppTheme from '@/components/shared-theme/AppTheme'
import AppAppBar from '@/components/marketing-page/components/AppAppBar'
import Footer from '@/components/marketing-page/components/Footer'
import Headline from '@/components/marketing-page/components/Headline'
import { Button, Container, Typography } from '@mui/material'
import Timeline from '@/components/marketing-page/components/Timeline'

export default function InfoPage() {
  return (
    <Container maxWidth='lg' sx={{ my: 5 }}>
      <Headline
        headline={
          <Typography
            variant='h3'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            <Typography
              component='span'
              variant='h3'
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              체르토
            </Typography>
            &nbsp;대리입찰&nbsp;이용안내
          </Typography>
        }
      />
      <Divider />
      <Timeline />
    </Container>
  )
}
