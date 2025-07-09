import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import ModeSwitch from '@/components/ModeSwitch'
import { AuthProvider } from '@/contexts/AuthContext'
import AppTheme from '@/components/shared-theme/AppTheme'

export const metadata: Metadata = {
  // This is the default title if a specific page doesn't set one.
  title: '체르또 - 대리입찰 전문가 서비스',
  description:
    '부동산 경매 전문가들이 고객님의 성공적인 투자를 위해 맞춤형 입찰 전략을 제공해 드립니다.',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute='class' />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppTheme>
            <AuthProvider>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <ModeSwitch />
              {children}
            </AuthProvider>
          </AppTheme>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
