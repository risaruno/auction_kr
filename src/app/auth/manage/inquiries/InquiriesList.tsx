'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import ReplyIcon from '@mui/icons-material/Reply'
import AdminReplyForm from './AdminReplyForm'

import { createClient } from '@/utils/supabase/client'

export default function InquiriesList() {
  const supabase = createClient()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // State baru untuk menangani input balasan dan status loading
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const getStatusChip = (status: string) => {
    const statusConfig = {
      Unanswered: { color: 'warning' as const, label: '대기중' },
      Answered: { color: 'success' as const, label: '답변완료' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'default' as const,
      label: status,
    }

    return <Chip label={config.label} color={config.color} size='small' />
  }

  // Define DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: '문의 내용',
      width: 400,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
            {params.row.title}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: '답변 상태',
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        getStatusChip(params.row.status),
    },
    {
      field: 'created_at',
      headerName: '작성일',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant='body2' color='text.secondary'>
            {params.row.created_at
              ? new Date(params.row.created_at).toLocaleDateString('ko-KR')
              : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '보기/답변',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          color='primary'
          onClick={() => handleView(params.row.id)}
          title={params.row.status === 'Answered' ? '보기' : '답변하기'}
        >
          {params.row.status === 'Answered' ? (
            <VisibilityIcon />
          ) : (
            <ReplyIcon />
          )}
        </IconButton>
      ),
    },
  ]

  const fetchInquiries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch inquiries:', error.message)
      setLoading(false)
      return
    }

    setInquiries(data)
    setLoading(false)
  }

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (userId) fetchInquiries()
  }, [userId])

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

  return (
    <Box sx={{ my: 5, px: { xs: 2, md: 4 } }}>
      <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 3 }}>
        문의 내역
      </Typography>

      {inquiries.length === 0 ? (
        <Box textAlign='center' py={10}>
          <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
          <Typography variant='h6' sx={{ mt: 2 }}>
            등록된 문의가 없습니다.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={inquiries}
            columns={columns}
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f9fafb',
                fontWeight: 'bold',
              },
            }}
          />
        </Box>
      )}

      {/* MODIFIKASI BESAR: Dialog untuk Melihat dan Membalas Pertanyaan */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseView}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>문의 상세 정보</DialogTitle>
        <DialogContent dividers>
          {selectedInquiry && (
            <>
              {/* Riwayat Pesan (tidak berubah) */}
              {selectedInquiry.messages?.map((msg: any, idx: number) => (
                <Box
                  key={idx}
                  p={2}
                  mb={2}
                  sx={{
                    borderRadius: 2,
                    backgroundColor:
                      msg.sender_role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    color={
                      msg.sender_role === 'admin'
                        ? 'primary.main'
                        : 'text.secondary'
                    }
                    sx={{ fontWeight: 'bold' }}
                  >
                    {msg.sender_role === 'admin'
                      ? '답변 내용'
                      : selectedInquiry.title}
                    {msg.sender_id && (
                      <Typography
                        component='span'
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                      >
                        ({msg.sender_id})
                      </Typography>
                    )}
                    {' • '}
                    <Typography
                      component='span'
                      variant='caption'
                      color='text.secondary'
                    >
                      {new Date(msg.created_at).toLocaleString('ko-KR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ whiteSpace: 'pre-wrap', mt: 1 }}
                  >
                    {msg.content}
                  </Typography>
                </Box>
              ))}

              {/* MODIFIKASI: Gunakan komponen AdminReplyForm di sini */}
              {selectedInquiry.status !== 'Answered' && userId && (
                <Box borderTop={1} borderColor='grey.300'>
                  <AdminReplyForm
                    inquiryId={selectedInquiry.id}
                    adminId={userId}
                    onSuccess={() => {
                      handleCloseView() // Tutup dialog
                      fetchInquiries() // Refresh daftar pertanyaan
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView} color='inherit'>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
