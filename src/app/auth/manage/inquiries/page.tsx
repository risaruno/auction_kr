'use client'
import React, { useState } from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Paper,
  Button,
  Chip,
  Avatar,
  TextField,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import AdminLayout from '../AdminLayout'

// --- Sample Data ---
const initialInquiries = [
  {
    id: 'inq-001',
    title: '보증금 환불 절차가 궁금합니다.',
    userName: '김민준',
    date: '2025-06-20',
    status: 'New',
    messages: [
      {
        from: 'user',
        text: '안녕하세요. 얼마 전 낙찰받지 못한 사건의 보증금은 언제쯤 환불되는지 궁금합니다. 사건번호는 2024타경9999입니다.',
      },
    ],
  },
  {
    id: 'inq-002',
    title: '전문가 변경 가능한가요?',
    userName: '이서연',
    date: '2025-06-19',
    status: 'Awaiting Reply',
    messages: [
      {
        from: 'user',
        text: '배정된 전문가님과 일정이 맞지 않아 그런데, 다른 전문가님으로 변경이 가능할까요?',
      },
      {
        from: 'admin',
        text: '안녕하세요, 이서연님. 네, 담당자 확인 후 변경 가능한 다른 전문가님 목록과 함께 다시 연락드리겠습니다.',
      },
    ],
  },
  {
    id: 'inq-003',
    title: '전자본인서명확인서 발급 문의',
    userName: '박지훈',
    date: '2025-06-18',
    status: 'Completed',
    messages: [
      { from: 'user', text: '전자본인서명확인서가 무엇인가요? 꼭 필요한가요?' },
      {
        from: 'admin',
        text: '안녕하세요, 박지훈님. 대리입찰을 위해서는 법원에 대리인 위임장을 제출해야 하며, 이때 본인 인감을 증명하기 위해 필수적인 서류입니다. 최초 1회 가까운 주민센터에 방문하여 발급 신청을 하시면, 이후에는 온라인으로 편리하게 이용 가능합니다.',
      },
      { from: 'user', text: '아하, 감사합니다. 이해했습니다!' },
      {
        from: 'admin',
        text: '네, 궁금한 점 있으시면 언제든지 다시 문의해주세요.',
      },
    ],
  },
]

const inquiryStatuses = ['New', 'Awaiting Reply', 'Completed']

// --- Main Admin Panel Component ---
const InquiryManagementContent = () => {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(inquiries[0])

  const handleSelectInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry)
  }

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value
    setSelectedInquiry((prev: any) => ({ ...prev, status: newStatus }))
    // Also update the main list
    setInquiries(
      inquiries.map((inq) =>
        inq.id === selectedInquiry.id ? { ...inq, status: newStatus } : inq
      )
    )
  }

  const handleSendReply = (event: React.FormEvent) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const replyText = (form.elements.namedItem('replyText') as HTMLInputElement)
      .value

    if (!replyText.trim()) return

    const newReply = { from: 'admin', text: replyText }
    const updatedMessages = [...selectedInquiry.messages, newReply]

    const updatedInquiry = {
      ...selectedInquiry,
      messages: updatedMessages,
      status: 'Awaiting Reply',
    }
    setSelectedInquiry(updatedInquiry)
    setInquiries(
      inquiries.map((inq) =>
        inq.id === selectedInquiry.id ? updatedInquiry : inq
      )
    )

    form.reset()
  }

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'error'
      case 'Awaiting Reply':
        return 'warning'
      case 'Completed':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        {/* --- Main Content using Grid --- */}
        <Grid container sx={{ flexGrow: 1, height: 'calc(100% - 64px)' }}>
          {/* Inquiry List Panel */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              borderRight: { md: '1px solid #ddd' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
              <Typography variant='h6'>1:1 Inquiries</Typography>
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {inquiries.map((inquiry) => (
                <ListItemButton
                  key={inquiry.id}
                  onClick={() => handleSelectInquiry(inquiry)}
                  selected={selectedInquiry?.id === inquiry.id}
                >
                  <ListItemText
                    primary={inquiry.title}
                    secondary={
                      <Box
                        component='span'
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          component='span'
                          variant='body2'
                          color='text.primary'
                        >
                          {inquiry.userName}
                        </Typography>
                        <Chip
                          label={inquiry.status}
                          color={getStatusChipColor(inquiry.status)}
                          size='small'
                        />
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Grid>

          {/* Conversation View Panel */}
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            {selectedInquiry ? (
              <>
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='h6'>
                      {selectedInquiry.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      From: {selectedInquiry.userName} | Date:{' '}
                      {selectedInquiry.date}
                    </Typography>
                  </Box>
                  <FormControl size='small' sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedInquiry.status}
                      label='Status'
                      onChange={handleStatusChange}
                    >
                      {inquiryStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {selectedInquiry.messages.map((msg: any, index: number) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        alignSelf:
                          msg.from === 'admin' ? 'flex-end' : 'flex-start',
                        backgroundColor:
                          msg.from === 'admin' ? 'primary.main' : 'grey.200',
                        color: msg.from === 'admin' ? 'white' : 'black',
                        borderRadius: 2,
                        maxWidth: '80%',
                      }}
                    >
                      {msg.text}
                    </Paper>
                  ))}
                </Box>

                <Box
                  component='form'
                  onSubmit={handleSendReply}
                  sx={{ p: 2, borderTop: '1px solid #ddd' }}
                >
                  <TextField
                    name='replyText'
                    fullWidth
                    multiline
                    rows={4}
                    placeholder='Write your reply here...'
                    variant='outlined'
                  />
                  <Button type='submit' variant='contained' sx={{ mt: 1 }}>
                    Send Reply
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color='text.secondary'>
                  Select an inquiry to view the conversation.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default function InquiryManagementPanel() {
  return (
    <AdminLayout>
      <InquiryManagementContent />
    </AdminLayout>
  )
}
