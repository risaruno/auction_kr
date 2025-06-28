'use client' // Required at the top of the file to use hooks like usePathname

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Gavel as GavelIcon,
  QuestionAnswer as QuestionAnswerIcon,
  LiveHelp as LiveHelpIcon,
} from '@mui/icons-material'
import { usePermissions } from '@/components/auth/RequireAuth'

interface MenuItem {
  text: string
  href: string
  icon: React.ReactNode
  requiredPermission?: keyof ReturnType<typeof usePermissions>
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', href: '/auth/manage/dashboard', icon: <DashboardIcon /> },
  { 
    text: 'User Management', 
    href: '/auth/manage/users', 
    icon: <PeopleIcon />,
    requiredPermission: 'canManageUsers'
  },
  { 
    text: 'Experts Management', 
    href: '/auth/manage/experts', 
    icon: <PeopleIcon />,
    requiredPermission: 'canManageExperts'
  },
  { 
    text: 'Bidding Management', 
    href: '/auth/manage/bids', 
    icon: <GavelIcon />,
    requiredPermission: 'canViewBiddings'
  },
  {
    text: '1:1 Inquiries',
    href: '/auth/manage/inquiries',
    icon: <QuestionAnswerIcon />,
    requiredPermission: 'canHandleSupport'
  },
  { 
    text: 'FAQ Management', 
    href: '/auth/manage/faqs', 
    icon: <LiveHelpIcon />,
    requiredPermission: 'canManageFAQs'
  },
  {
    text: 'Admin Management',
    href: '/auth/manage/managers',
    icon: <AdminPanelSettingsIcon />,
    requiredPermission: 'canManageUsers'
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const permissions = usePermissions()

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (!item.requiredPermission) return true
    return permissions[item.requiredPermission]
  })

  return (
    <List>
      {visibleMenuItems.map((item) => (
        <Link
          href={item.href}
          key={item.text}
          passHref
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <ListItem disablePadding>
            <ListItemButton selected={pathname === item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        </Link>
      ))}
    </List>
  )
}
