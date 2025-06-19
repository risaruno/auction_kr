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

const menuItems = [
  { text: 'Dashboard', href: '/auth/manage/dashboard', icon: <DashboardIcon /> },
  { text: 'User Management', href: '/auth/manage/users', icon: <PeopleIcon /> },
  { text: 'Experts Management', href: '/auth/manage/experts', icon: <PeopleIcon /> },
  { text: 'Bidding Management', href: '/auth/manage/bids', icon: <GavelIcon /> },
  {
    text: '1:1 Inquiries',
    href: '/auth/manage/inquiries',
    icon: <QuestionAnswerIcon />,
  },
  { text: 'FAQ Management', href: '/auth/manage/faqs', icon: <LiveHelpIcon /> },
  {
    text: 'Admin Management',
    href: '/auth/manage/managers',
    icon: <AdminPanelSettingsIcon />,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <List>
      {menuItems.map((item) => (
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
