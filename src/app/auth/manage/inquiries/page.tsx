'use client'
import React, { useState, useEffect } from 'react'
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
  Alert,
  Snackbar,
  CircularProgress,
  TablePagination,
} from '@mui/material'
import AdminLayout from '../AdminLayout'
import { inquiriesApi } from '@/utils/api-client'
import { Inquiry, InquiryMessage } from '@/types/api'

const inquiryStatuses = ['new', 'in_progress', 'resolved', 'closed']
const inquiryPriorities = ['low', 'medium', 'high']

// --- Main Admin Panel Component ---
const InquiryManagementContent = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [messages, setMessages] = useState<InquiryMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Pagination and filters
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Fetch inquiries
  const fetchInquiries = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inquiriesApi.getInquiries({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      
      if (response.success && response.data) {
        setInquiries(response.data as Inquiry[])
        setTotalCount(response.pagination?.total || 0)
        if (response.data.length > 0 && !selectedInquiry) {
          setSelectedInquiry(response.data[0] as Inquiry)
        }
      } else {
        setError(response.error || 'Failed to fetch inquiries')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch inquiries')
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for selected inquiry
  const fetchMessages = async (inquiryId: string) => {
    setMessagesLoading(true)
    try {
      const response = await inquiriesApi.getMessages(inquiryId, { page: 1, limit: 100 })
      
      if (response.success && response.data) {
        setMessages(response.data as InquiryMessage[])
      } else {
        setError(response.error || 'Failed to fetch messages')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [page, rowsPerPage, statusFilter, priorityFilter])

  useEffect(() => {
    if (selectedInquiry) {
      fetchMessages(selectedInquiry.id)
    }
  }, [selectedInquiry])

  const handleSelectInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
  }

  const handleStatusChange = async (event: any) => {
    if (!selectedInquiry) return
    
    const newStatus = event.target.value
    setError(null)
    
    try {
      const response = await inquiriesApi.updateInquiry(selectedInquiry.id, {
        status: newStatus,
      })

      if (response.success) {
        setSuccessMessage('Inquiry status updated successfully')
        setSelectedInquiry({ ...selectedInquiry, status: newStatus })
        // Update the inquiry in the list
        setInquiries(inquiries.map(inq => 
          inq.id === selectedInquiry.id ? { ...inq, status: newStatus } : inq
        ))
      } else {
        setError(response.error || 'Failed to update inquiry status')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update inquiry status')
    }
  }

  // Close snackbars
  const handleCloseError = () => {
    setError(null)
  }

  const handleCloseSuccess = () => {
    setSuccessMessage(null)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        
        {/* Error/Success Messages */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSuccess}>
          <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Typography variant='h4' gutterBottom>
          고객 문의 관리
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={statusFilter}
              label="상태"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              {inquiryStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>우선순위</InputLabel>
            <Select
              value={priorityFilter}
              label="우선순위"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              {inquiryPriorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Inquiries List */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ height: '600px', overflow: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {inquiries.map((inquiry) => (
                    <ListItem key={inquiry.id}>
                      <ListItemButton
                        selected={selectedInquiry?.id === inquiry.id}
                        onClick={() => handleSelectInquiry(inquiry)}
                      >
                        <ListItemText
                          primary={inquiry.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {new Date(inquiry.created_at).toLocaleDateString()}
                              </Typography>
                              <Chip
                                label={inquiry.status}
                                size="small"
                                color={
                                  inquiry.status === 'new' ? 'error' :
                                  inquiry.status === 'in_progress' ? 'warning' :
                                  inquiry.status === 'resolved' ? 'success' : 'default'
                                }
                              />
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {/* Pagination */}
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
              />
            </Paper>
          </Grid>

          {/* Inquiry Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            {selectedInquiry ? (
              <Paper sx={{ p: 3, height: '600px', overflow: 'auto' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{selectedInquiry.title}</Typography>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>상태 변경</InputLabel>
                    <Select
                      value={selectedInquiry.status}
                      label="상태 변경"
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
                
                <Divider sx={{ mb: 2 }} />
                
                {/* Messages */}
                {messagesLoading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box>
                    {messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: message.sender_type === 'admin' ? 'primary.light' : 'grey.100',
                          borderRadius: 1,
                          ml: message.sender_type === 'admin' ? 0 : 4,
                          mr: message.sender_type === 'admin' ? 4 : 0,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {message.sender_type === 'admin' ? '관리자' : '사용자'} • {new Date(message.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {message.message}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  문의를 선택해주세요
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

// --- Main Page Export ---
export default function InquiryManagementPage() {
  return (
    <AdminLayout>
      <InquiryManagementContent />
    </AdminLayout>
  )
}
