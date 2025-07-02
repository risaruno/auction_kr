'use client'
import * as React from 'react'
import { NextAppProvider } from '@toolpad/core/nextjs'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
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
  } from '@mui/icons-material'
import type { Navigation } from '@toolpad/core/AppProvider'
import theme from '@/theme'
import Stack from '@mui/material/Stack'
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
import { ArrowBack, Home, Redo, Undo } from '@mui/icons-material'

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

  // Base navigation for all authenticated users
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

  // Admin/Management navigation
  if (isAdmin(userRole)) {
    // Super admin only features
    if (isSuperAdmin(userRole)) {
      baseNavigation.push(
        {
          kind: 'header',
          title: '콘텐츠 관리',
        },
        {
          segment: 'auth/manage',
          title: '대시보드',
          icon: <DashboardIcon />,
        },
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
        {
          kind: 'divider',
        },
        {
          kind: 'header',
          title: '고객 지원',
        },
        {
          segment: 'auth/manage/inquiries',
          title: '문의 관리',
          icon: <QuestionAnswerIcon />,
        },
        {
          kind: 'divider',
        },
        {
          kind: 'header',
          title: '관리자 메뉴',
        },
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
        {
          kind: 'divider',
        }
      )
    }

    // Content management (for super admin and content managers)
    if (canManageContent(userRole)) {
      baseNavigation.push(
        {
          kind: 'header',
          title: '콘텐츠 관리',
        },
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
        {
          kind: 'divider',
        },
        {
          kind: 'header',
          title: '고객 지원',
        },
        {
          segment: 'auth/manage/inquiries',
          title: '문의 관리',
          icon: <QuestionAnswerIcon />,
        },
        {
          kind: 'divider',
        }
      )
    }

    // Content management (for super admin and content managers)
    if (canHandleSupport(userRole)) {
      baseNavigation.push(
        {
          kind: 'header',
          title: '고객 지원',
        },
        {
          segment: 'auth/manage/inquiries',
          title: '문의 관리',
          icon: <QuestionAnswerIcon />,
        },
        {
          kind: 'divider',
        }
      )
    }
  }

  if (isUser(userRole)) {
    baseNavigation.push(
      {
        kind: 'header',
        title: 'My Page',
      },
      {
        segment: 'auth/user/profile',
        title: '내 정보',
        icon: <AccountCircleIcon />,
      },
      {
        segment: 'auth/user/history',
        title: '서비스 내역',
        icon: <HistoryIcon />,
      },
      {
        kind: 'divider',
      }
    )
  }

  return baseNavigation
}

export default function Layout(props: { children: React.ReactNode }) {
  const navigation = useNavigation()

  return (
    <NextAppProvider theme={theme} navigation={navigation}>
      <DashboardLayout
        branding={{
          logo: <Sitemark />,
          title: '',
          homeUrl: '/auth',
        }}
        slots={{
          toolbarActions: CustomActions,
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        {props.children}
        <Copyright sx={{ my: 4 }} />
      </DashboardLayout>
    </NextAppProvider>
  )
}
