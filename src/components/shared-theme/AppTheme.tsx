'use client'
import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import theme from '@/theme'

interface AppThemeProps {
  children: React.ReactNode
  disableCustomTheme?: boolean
  themeComponents?: ThemeOptions['components']
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme } = props

  // This correctly ensures only light mode is ever used.
  // React.useEffect(() => {
  //   document.documentElement.setAttribute('data-mui-color-scheme', 'light')
  // }, [])

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>
  }
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
