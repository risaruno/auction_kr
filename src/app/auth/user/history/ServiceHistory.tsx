'use client'
import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ScreenSearchDesktopOutlinedIcon from '@mui/icons-material/ScreenSearchDesktopOutlined'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector'
import { StepIconProps } from '@mui/material/StepIcon'
import { fetchUserApplications } from '../actions'
import { useAuth } from '@/contexts/AuthContext'

// --- Styled Components for a Custom Stepper Look ---
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}))

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean }
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    background: theme.palette.primary.main,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    background: theme.palette.primary.main,
  }),
}))

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props

  const icons: { [index: string]: React.ReactElement } = {
    1: <HomeOutlinedIcon />,
    2: <ScreenSearchDesktopOutlinedIcon />,
    3: <PersonSearchOutlinedIcon />,
    4: <DescriptionOutlinedIcon />,
    5: <PlaylistAddCheckOutlinedIcon />,
  }

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  )
}

// --- Main Page Component ---
const serviceHistory = () => {
  const [currentTab, setCurrentTab] = useState('proxyBidding')
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true)
        const result = await fetchUserApplications()
        
        if (result.success) {
          setApplications(result.data)
          setError(null)
        } else {
          setError(result.error || '신청 내역을 불러오는데 실패했습니다.')
          setApplications([])
        }
      } catch (err) {
        console.error('Error loading applications:', err)
        setError('신청 내역을 불러오는 중 오류가 발생했습니다.')
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [user])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue)
  }

  const steps = [
    '대리입찰 신청',
    '신청내역 확인',
    '바토너 배정',
    '서류등록 및 보증금 입금',
    '입찰준비 완료',
  ]

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case '대기':
        return 'warning'
      case 'approved':
      case '승인':
        return 'success'
      case 'rejected':
      case '거절':
        return 'error'
      case 'in_progress':
      case '진행중':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR')
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number | string) => {
    try {
      const num = typeof amount === 'string' ? parseInt(amount) : amount
      return new Intl.NumberFormat('ko-KR').format(num) + '원'
    } catch {
      return amount + '원'
    }
  }

  return (
    <Container maxWidth='lg' sx={{ my: 5 }}>
      <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 3 }}>
        내 신청 내역
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label='service history tabs'
        >
          <Tab label='대리입찰 서비스' value='proxyBidding' />
          <Tab label='전문가 서비스' value='expertService' />
        </Tabs>
      </Box>

      {currentTab === 'proxyBidding' && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              backgroundColor: '#f9fafb',
              borderRadius: 4,
              mb: 4,
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}
            >
              입찰신청 이후 절차안내
            </Typography>
            <Stepper
              alternativeLabel
              activeStep={1}
              connector={<ColorlibConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorlibStepIcon}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <TableContainer component={Paper} elevation={0} variant='outlined'>
            <Table
              sx={{ minWidth: 650 }}
              aria-label='application history table'
            >
              <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                <TableRow>
                  <TableCell>사건번호</TableCell>
                  <TableCell>입찰금액</TableCell>
                  <TableCell>입찰기일</TableCell>
                  <TableCell>요청일자</TableCell>
                  <TableCell>대리인</TableCell>
                  <TableCell>처리상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 10, textAlign: 'center' }}>
                      <CircularProgress />
                      <Typography variant='body2' sx={{ mt: 2 }}>
                        신청 내역을 불러오는 중...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 10, textAlign: 'center' }}>
                      <Box>
                        <InboxOutlinedIcon
                          sx={{ fontSize: 60, color: 'grey.400' }}
                        />
                        <Typography variant='h6' sx={{ mt: 2 }}>
                          입찰신청 내역이 없습니다.
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          서비스를 신청하고 진행상황을 확인해보세요.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>{application.case_number || application.court_case_number || '-'}</TableCell>
                      <TableCell>{application.bid_amount ? formatCurrency(application.bid_amount) : '-'}</TableCell>
                      <TableCell>{application.bid_date ? formatDate(application.bid_date) : '-'}</TableCell>
                      <TableCell>{formatDate(application.created_at)}</TableCell>
                      <TableCell>{application.experts?.name || '미배정'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={application.status || '대기중'} 
                          color={getStatusColor(application.status) as any}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {currentTab === 'expertService' && (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
          <Typography variant='h6' sx={{ mt: 2 }}>
            전문가 서비스 신청 내역이 없습니다.
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default serviceHistory
