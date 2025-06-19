'use client'
import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  People as PeopleIcon,
  Gavel as GavelIcon,
  NotificationsActive as NotificationsActiveIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import AdminLayout from '../AdminLayout'

// --- Sample Data ---
const kpiData = {
  totalUsers: 1324,
  activeBids: 18,
  newInquiries: 5,
  monthlyRevenue: 2800000,
}

const chartData = [
  { name: 'Mon', revenue: 400000 },
  { name: 'Tue', revenue: 300000 },
  { name: 'Wed', revenue: 500000 },
  { name: 'Thu', revenue: 450000 },
  { name: 'Fri', revenue: 600000 },
  { name: 'Sat', revenue: 350000 },
  { name: 'Sun', revenue: 200000 },
]

const pendingBids = [
  { id: 'bid-001', caseNumber: '2025타경1001', userName: '김민준' },
  { id: 'bid-002', caseNumber: '2025타경1002', userName: '이서연' },
]

const recentInquiries = [
  {
    id: 'inq-001',
    title: '보증금 환불 절차가 궁금합니다.',
    userName: '김민준',
  },
  { id: 'inq-002', title: '전문가 변경 가능한가요?', userName: '이서연' },
]

// --- The content part of the dashboard ---
const DashboardContent = () => {
  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string
    value: string
    icon: React.ReactElement
    color: string
  }) => (
    <Paper
      elevation={2}
      sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 2 }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography color='text.secondary'>{title}</Typography>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      <ListItemIcon sx={{ color: color, fontSize: 40, minWidth: 0 }}>
        {icon}
      </ListItemIcon>
    </Paper>
  )

  return (
    <>
      <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard
      </Typography>

      {/* KPI Stat Cards with corrected Grid syntax */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Total Users'
            value={kpiData.totalUsers.toLocaleString()}
            icon={<PeopleIcon fontSize='large' />}
            color='primary.main'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Active Bids'
            value={kpiData.activeBids.toLocaleString()}
            icon={<GavelIcon fontSize='large' />}
            color='warning.main'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='New Inquiries'
            value={kpiData.newInquiries.toLocaleString()}
            icon={<NotificationsActiveIcon fontSize='large' />}
            color='error.main'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="This Month's Revenue"
            value={`₩${kpiData.monthlyRevenue.toLocaleString()}`}
            icon={<AttachMoneyIcon fontSize='large' />}
            color='success.main'
          />
        </Grid>
      </Grid>

      {/* Charts and Quick Lists with corrected Grid syntax */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: 350 }}>
            <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 2 }}>
              Weekly Revenue
            </Typography>
            <ResponsiveContainer width='100%' height='90%'>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis
                  tickFormatter={(value) => `₩${Number(value) / 10000}만`}
                />
                <Tooltip
                  formatter={(value) => [
                    `₩${Number(value).toLocaleString()}`,
                    'Revenue',
                  ]}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='#8884d8'
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              height: 350,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
              Pending Actions
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <List>
                <ListItemText primary='Bidding Actions' sx={{ pl: 2 }} />
                {pendingBids.map((bid) => (
                  <ListItem
                    key={bid.id}
                    secondaryAction={<Link href='#'>View</Link>}
                  >
                    <ListItemText
                      primary={bid.caseNumber}
                      secondary={bid.userName}
                    />
                  </ListItem>
                ))}
                <ListItemText
                  primary='Recent Inquiries'
                  sx={{ pl: 2, pt: 2 }}
                />
                {recentInquiries.map((inq) => (
                  <ListItem
                    key={inq.id}
                    secondaryAction={<Link href='#'>Reply</Link>}
                  >
                    <ListItemText
                      primary={inq.title}
                      secondary={inq.userName}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

// --- The final export wraps the content in the layout ---
export default function DashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  )
}
