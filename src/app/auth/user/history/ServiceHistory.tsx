'use client'
import React, { useState } from 'react'
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
  // Dummy data - in a real app, this would come from an API
  const applications: any[] = [] // Empty array to show the "empty state"
  const activeStep = 1 // Example: The user is on the 2nd step

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

  return (
    <Container maxWidth='lg' sx={{ my: 5 }}>
      <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 3 }}>
        내 신청 내역
      </Typography>

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
              activeStep={activeStep}
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
                {/* Conditional Rendering: Show either the empty state or the application rows */}
                {applications.length === 0 ? (
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
                  applications.map((row) => (
                    <TableRow key={row.caseNumber}>
                      <TableCell>{row.caseNumber}</TableCell>
                      <TableCell>{row.bidAmount}</TableCell>
                      <TableCell>{row.bidDate}</TableCell>
                      <TableCell>{row.requestDate}</TableCell>
                      <TableCell>{row.agent}</TableCell>
                      <TableCell>
                        <Chip label={row.status} color='primary' />
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
