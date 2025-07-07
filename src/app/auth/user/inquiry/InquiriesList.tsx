'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import NewInquiryForm from './NewInquiryForm'

import { createClient } from '@/utils/supabase/client'

export default function InquiriesList() {
  const supabase = createClient()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const fetchInquiries = async () => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, title, status')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch inquiries:', error.message)
      return
    }

    setInquiries(data)
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) return console.error('User error:', error)
      if (user) setUserId(user.id)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (userId) fetchInquiries()
  }, [userId])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleView = async (inquiryId: number) => {
    const { data: messages, error } = await supabase
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('id, title, created_at')
      .eq('id', inquiryId)
      .single()

    setSelectedInquiry({
      ...inquiry,
      messages,
    })
    setViewDialogOpen(true)
  }

  const handleCloseView = () => {
    setViewDialogOpen(false)
    setSelectedInquiry(null)
  }

  return (
    <Box sx={{ my: 5, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        문의 내역
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          New Inquiry
        </Button>
      </Box>

      {inquiries.length === 0 ? (
        <Box textAlign="center" py={10}>
          <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            등록된 문의가 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            궁금한 내용을 문의하고 답변을 받아보세요.
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>문의 내용</TableCell>
                <TableCell>답변 상태</TableCell>
                <TableCell align="center">보기</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.map((inq, idx) => (
                <TableRow key={inq.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{inq.title}</TableCell>
                  <TableCell>{inq.status}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleView(inq.id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* New Inquiry Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>New Inquiry</DialogTitle>
        <DialogContent>
          {userId ? (
            <NewInquiryForm
              userId={userId}
              onSuccess={() => {
                handleClose()
                fetchInquiries()
              }}
            />
          ) : (
            <Typography>Loading user info...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Inquiry Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseView} maxWidth="sm" fullWidth>
        <DialogTitle>Inquiry Detail</DialogTitle>
        <DialogContent dividers>
          {selectedInquiry && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedInquiry.title}
              </Typography>

              {selectedInquiry.messages?.map((msg: any, idx: number) => (
                <Box key={idx} mb={2}>
                  <Typography
                    variant="subtitle2"
                    color={msg.sender_role === 'admin' ? 'primary' : 'text.secondary'}
                  >
                    {msg.sender_role === 'admin' ? 'Admin Reply' : 'User Question'}
                    {' • '}
                    {new Date(msg.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}