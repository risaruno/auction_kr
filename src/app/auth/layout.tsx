'use client'
import * as React from 'react'
import { NextAppProvider } from '@toolpad/core/nextjs'
import PersonIcon from '@mui/icons-material/Person'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import GavelIcon from '@mui/icons-material/Gavel'
import ExpertIcon from '@mui/icons-material/Psychology'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import HistoryIcon from '@mui/icons-material/History'
import InfoIcon from '@mui/icons-material/Info'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import type { Navigation } from '@toolpad/core/AppProvider'
import theme from '../../theme'
import Stack from '@mui/material/Stack'
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout'
import Copyright from '../components/Copyright'
import SidebarFooterAccount, {
  ToolbarAccountOverride,
} from './SidebarFooterAccount'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin, isSuperAdmin, canManageContent } from '@/utils/auth/roles-client'

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
      kind: 'header',
      title: 'Dashboard',
    },
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      segment: '',
    },
  ]

  // Admin/Management navigation
  if (isAdmin(userRole)) {
    baseNavigation.push(
      {
        kind: 'header',
        title: 'Management',
      },
      {
        segment: 'manage/dashboard',
        title: 'Admin Dashboard',
        icon: <DashboardIcon />,
      },
      {
        segment: 'manage/bids',
        title: 'Bid Management',
        icon: <GavelIcon />,
      },
      {
        segment: 'manage/experts',
        title: 'Expert Management',
        icon: <ExpertIcon />,
      },
      {
        segment: 'manage/users',
        title: 'User Management',
        icon: <PersonIcon />,
      }
    )

    // Content management (for super admin and content managers)
    if (canManageContent(userRole)) {
      baseNavigation.push({
        segment: 'manage/faqs',
        title: 'FAQ Management',
        icon: <QuestionAnswerIcon />,
      })
    }

    // Super admin only features
    if (isSuperAdmin(userRole)) {
      baseNavigation.push({
        segment: 'manage/managers',
        title: 'Manager Management',
        icon: <SupervisorAccountIcon />,
      })
    }
  }

  // User-specific navigation (for users and experts)
  if (userRole === 'user' || userRole === 'expert') {
    baseNavigation.push(
      {
        kind: 'header',
        title: 'My Account',
      },
      {
        segment: 'user/profile',
        title: 'Profile',
        icon: <AccountCircleIcon />,
      },
      {
        segment: 'user/info',
        title: 'My Information',
        icon: <InfoIcon />,
      },
      {
        segment: 'user/history',
        title: 'Service History',
        icon: <HistoryIcon />,
      }
    )
  }

  // Legacy navigation items (keeping for backward compatibility)
  if (!userRole || userRole === 'user') {
    baseNavigation.push(
      {
        kind: 'header',
        title: 'Legacy Items',
      },
      {
        segment: 'orders',
        title: 'Orders',
        icon: <ShoppingCartIcon />,
      },
      {
        segment: 'employees',
        title: 'Employees',
        icon: <PersonIcon />,
        pattern: 'employees{/:employeeId}*',
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
