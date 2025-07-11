'use client'

import * as React from 'react'
import { NextAppProvider } from '@toolpad/core/nextjs'
import {
  Dashboard as DashboardIcon,
  AssignmentInd as ExpertIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  History as HistoryIcon,
  AccountCircle as AccountCircleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Quiz as QuizIcon,
  ArrowBack,
} from '@mui/icons-material'
import type { Navigation } from '@toolpad/core/AppProvider'
import theme from '@/theme'

import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout'
import Copyright from '@/components/dashboard/Copyright'
import Sitemark from '@/components/marketing-page/components/SitemarkIcon'
import SidebarFooterAccount, {
  ToolbarAccountOverride,
} from './SidebarFooterAccount'
import { useAuth } from '@/contexts/AuthContext'
import {
  isAdmin,
  isSuperAdmin,
  canManageContent,
  canHandleSupport,
  isUser,
} from '@/utils/auth/roles-client'
import { useRouter, usePathname } from 'next/navigation'

function CustomActions() {
  return (
    <Stack direction='row' alignItems='center'>
      <ThemeSwitcher />
      <ToolbarAccountOverride />
    </Stack>
  )
}

function useNavigation(): Navigation {
  const { user } = useAuth()
  const userRole = user?.admin_role

  const baseNavigation: Navigation = [
    {
      segment: '/',
      title: '홈으로',
      icon: <ArrowBack />,
    },
    {
      kind: 'divider',
    },
  ]

  if (isAdmin(userRole)) {
    if (isSuperAdmin(userRole)) {
      baseNavigation.push(
        { kind: 'header', title: '콘텐츠 관리' },
        { segment: 'auth/manage', title: '대시보드', icon: <DashboardIcon /> },
        {
          segment: 'auth/manage/bids',
          title: '입찰 신청 관리',
          icon: <GavelIcon />,
        },
        {
          segment: 'auth/manage/experts',
          title: '전문가 관리',
          icon: <ExpertIcon />,
        },
        {
          segment: 'auth/manage/faqs',
          title: '자주하는 질문 관리',
          icon: <QuizIcon />,
        },
        { kind: 'divider' },
        { kind: 'header', title: '고객 지원' },
        {
          segment: 'auth/manage/inquiries',
          title: '문의 관리',
          icon: <QuestionAnswerIcon />,
        },
        { kind: 'divider' },
        { kind: 'header', title: '관리자 메뉴' },
        {
          segment: 'auth/manage/users',
          title: '사용자 관리',
          icon: <PersonIcon />,
        },
        {
          segment: 'auth/manage/managers',
          title: '관리자 관리',
          icon: <SupervisorAccountIcon />,
        },
        { kind: 'divider' }
      )
    }

    if (canManageContent(userRole)) {
      baseNavigation.push(
        { kind: 'header', title: '콘텐츠 관리' },
        {
          segment: 'auth/manage/dashboard',
          title: '대시보드',
          icon: <DashboardIcon />,
        },
        {
          segment: 'auth/manage/experts',
          title: '전문가 관리',
          icon: <ExpertIcon />,
        },
        {
          segment: 'auth/manage/faqs',
          title: '자주하는 질문 관리',
          icon: <QuizIcon />,
        },
        { kind: 'divider' },
        { kind: 'header', title: '고객 지원' },
        {
          segment: 'auth/manage/inquiries',
          title: '문의 관리',
          icon: <QuestionAnswerIcon />,
        },
        { kind: 'divider' }
      )
    }

    if (canHandleSupport(userRole)) {
      baseNavigation.push(
        { kind: 'header', title: '고객 지원' },
        {
          segment: 'auth/manage/inquiries',
          title: '문의 관리',
          icon: <QuestionAnswerIcon />,
        },
        { kind: 'divider' }
      )
    }
  }

  if (isUser(userRole)) {
    baseNavigation.push(
      { kind: 'header', title: '마이페이지' },
      {
        segment: 'auth/user/history',
        title: '서비스 내역',
        icon: <HistoryIcon />,
      },
      {
        segment: 'auth/user/info',
        title: '입찰 정보',
        icon: <AccountCircleIcon />,
      },
      {
        segment: 'auth/user/inquiry',
        title: '문의 내역',
        icon: <QuestionAnswerIcon />,
      },
      { kind: 'divider' }
    )
  }
  return baseNavigation
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, session, loading, signOut, isInitialized, refreshUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname() || '/'
  const navigation = useNavigation()
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  // Refresh user data when the layout mounts (especially after login redirects)
  React.useEffect(() => {
    // If we're on an auth route and don't have user data yet, 
    // but we're initialized, try to refresh
    if (isInitialized && !loading && !user && pathname.startsWith('/auth')) {
      refreshUser()
    }
  }, [isInitialized, loading, user, pathname, refreshUser])

  // Handle redirect to login when no user (moved to top level to avoid conditional hooks)
  React.useEffect(() => {
    if (!user && isInitialized && !loading) {
      const timer = setTimeout(() => {
        if (!user && isInitialized && !loading) {
          router.push(`/sign/in?redirectTo=${encodeURIComponent(pathname)}`)
        }
      }, 1000) // Give 1 second for auth state to settle
      
      return () => clearTimeout(timer)
    }
  }, [user, isInitialized, loading, router, pathname])

  // Handle timeout for loading/initialization state
  React.useEffect(() => {
    if (loading || !isInitialized) {
      const timer = setTimeout(() => {
        refreshUser()
      }, 3000) // Give 3 seconds for auth to initialize
      
      return () => clearTimeout(timer)
    }
  }, [loading, isInitialized, refreshUser])

  const toolpadSession = React.useMemo(() => {
    if (!session || !user) return null
    return {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        image: session.user.user_metadata?.avatar_url || null,
      },
    }
  }, [session, user])

  const authentication = React.useMemo(() => {
    return {
      signIn: async () => {
        router.push(`/sign/in`)
      },
      signOut: async () => {
        setIsSigningOut(true)
        try {
          await signOut()
        } catch (error) {
          console.error('Sign out error:', error)
          setIsSigningOut(false)
        }
      },
    }
  }, [signOut, router, pathname])

  // Show loading while authentication is being determined
  if (loading || !isInitialized) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        height='100vh'
        gap={2}
      >
        <CircularProgress />
        <Typography>인증 정보를 확인하고 있습니다...</Typography>
      </Box>
    )
  }

  // Show signing out state
  if (isSigningOut) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        height='100vh'
        gap={2}
      >
        <CircularProgress />
        <Typography>로그아웃 중...</Typography>
      </Box>
    )
  }

  // If authentication is complete but no user, redirect to login
  if (!user && isInitialized && !loading) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        height='100vh'
        gap={2}
      >
        <CircularProgress />
        <Typography>사용자 정보를 확인하고 있습니다...</Typography>
      </Box>
    )
  }

  return (
    <NextAppProvider
      theme={theme}
      navigation={navigation}
      authentication={authentication}
      session={toolpadSession}
    >
      <DashboardLayout
        branding={{
          logo: <Sitemark />,
          title: '',
          homeUrl: '/',
        }}
        slots={{
          toolbarActions: CustomActions,
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        {children}
        <Copyright sx={{ my: 4 }} />
      </DashboardLayout>
    </NextAppProvider>
  )
}
