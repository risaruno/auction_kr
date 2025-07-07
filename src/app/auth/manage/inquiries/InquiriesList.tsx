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
  TextField, // Ditambahkan untuk input balasan
  CircularProgress, // Ditambahkan untuk indikator loading
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import NewInquiryForm from './NewInquiryForm'
import ReplyIcon from '@mui/icons-material/Reply'
import AdminReplyForm from './AdminReplyForm'

import { createClient } from '@/utils/supabase/client'

export default function InquiriesList() {
  const supabase = createClient()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // State baru untuk menangani input balasan dan status loading
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)


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
      const { data: { user } } = await supabase.auth.getUser()
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
    // Logika untuk mengambil data tetap sama
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
      .select('id, title, created_at, status') // Ambil juga status untuk logika dialog
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
    setReplyContent('') // Reset isi balasan saat dialog ditutup
  }
  
  // Fungsi baru untuk menangani pengiriman balasan
  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !selectedInquiry || !userId) return;
    
    setIsReplying(true);

    // 1. Kirim pesan balasan baru
    const { error: messageError } = await supabase
      .from('inquiry_messages')
      .insert({
          inquiry_id: selectedInquiry.id,
          sender_id: userId, // ID Admin/User yang sedang login
          content: replyContent,
          sender_role: 'admin', // Tandai sebagai balasan dari admin
      });

    if (messageError) {
        console.error('Error sending reply:', messageError);
        setIsReplying(false);
        return;
    }

    // 2. Update status pertanyaan menjadi "Answered"
    const { error: inquiryError } = await supabase
        .from('inquiries')
        .update({ status: 'Answered' })
        .eq('id', selectedInquiry.id);

    if (inquiryError) {
        console.error('Error updating inquiry status:', inquiryError);
        // Pertimbangkan untuk menangani kasus ini (misalnya, pesan balasan terkirim tapi status gagal diupdate)
    }
    
    // 3. Refresh data dan tutup dialog
    await fetchInquiries(); // Ambil ulang daftar pertanyaan untuk update status di tabel
    handleCloseView();
    setIsReplying(false);
  }


  return (
    <Box sx={{ my: 5, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        문의 내역 (Admin)
      </Typography>

      {inquiries.length === 0 ? (
        <Box textAlign="center" py={10}>
          <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            등록된 문의가 없습니다.
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
                <TableCell align="center">보기/답변</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.map((inq, idx) => (
                <TableRow key={inq.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{inq.title}</TableCell>
                  <TableCell>{inq.status}</TableCell>
                  <TableCell align="center">
                    {/* MODIFIKASI: Ikon berubah berdasarkan status */}
                    <IconButton color="primary" onClick={() => handleView(inq.id)}>
                      {inq.status === 'Answered' ? <VisibilityIcon /> : <ReplyIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* MODIFIKASI BESAR: Dialog untuk Melihat dan Membalas Pertanyaan */}
      <Dialog open={viewDialogOpen} onClose={handleCloseView} maxWidth="sm" fullWidth>
        <DialogTitle>Inquiry Detail</DialogTitle>
        <DialogContent dividers>
          {selectedInquiry && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedInquiry.title}
              </Typography>

              {/* Riwayat Pesan (tidak berubah) */}
              {selectedInquiry.messages?.map((msg: any, idx: number) => (
                <Box key={idx} mb={2} p={2} sx={{ borderRadius: 2, backgroundColor: msg.sender_role === 'admin' ? '#e3f2fd' : '#f5f5f5' }}>
                  <Typography
                    variant="subtitle2"
                    color={msg.sender_role === 'admin' ? 'primary.main' : 'text.secondary'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {msg.sender_role === 'admin' ? 'Admin Reply' : 'User Question'}
                    {' • '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {new Date(msg.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    {msg.content}
                  </Typography>
                </Box>
              ))}

              {/* MODIFIKASI: Gunakan komponen AdminReplyForm di sini */}
              {selectedInquiry.status !== 'Answered' && userId && (
                <Box mt={3} pt={3} borderTop={1} borderColor="grey.300">
                    <AdminReplyForm
                      inquiryId={selectedInquiry.id}
                      adminId={userId}
                      onSuccess={() => {
                          handleCloseView(); // Tutup dialog
                          fetchInquiries(); // Refresh daftar pertanyaan
                      }}
                    />
                </Box>
              )}
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