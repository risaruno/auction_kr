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
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'
import {
  fetchBiddingApplications,
  updateBiddingApplicationStatus,
  assignExpertToBid,
  updatePaymentStatus,
  updateDepositStatus,
  updateBidResult,
  getBiddingApplicationById
} from '@/app/bidding-applications/actions'
import { fetchExperts } from '@/app/experts/actions'
import { BiddingApplication, Expert } from '@/types/api'

// --- Sample Data ---
const initialBids = {
  newApplication: [
    {
      id: 'bid-001',
      caseNumber: '2025타경1001',
      userName: '김민준',
      bidDate: '2025-07-10',
      expert: null,
      paymentStatus: 'Paid',
      depositStatus: 'Pending',
    },
  ],
  expertAssigned: [
    {
      id: 'bid-002',
      caseNumber: '2025타경1002',
      userName: '이서연',
      bidDate: '2025-07-11',
      expert: '원유호',
      paymentStatus: 'Paid',
      depositStatus: 'Confirmed',
    },
  ],
  docsSubmitted: [
    {
      id: 'bid-003',
      caseNumber: '2025타경1003',
      userName: '박지훈',
      bidDate: '2025-07-12',
      expert: '오은석',
      paymentStatus: 'Paid',
      depositStatus: 'Confirmed',
    },
  ],
  bidComplete: [
    {
      id: 'bid-004',
      caseNumber: '2024타경9999',
      userName: '최유나',
      bidDate: '2025-06-15',
      expert: '김맹겸',
      paymentStatus: 'Paid',
      depositStatus: 'Refunded',
      result: 'Successful',
    },
    {
      id: 'bid-005',
      caseNumber: '2024타경8888',
      userName: '정태현',
      bidDate: '2025-06-14',
      expert: '원유호',
      paymentStatus: 'Paid',
      depositStatus: 'Refunded',
      result: 'Failed',
    },
  ],
}

const allExperts = ['원유호', '오은석', '이규호', '김맹겸']
const bidStatuses = [
  { value: 'pending', label: 'New Application' },
  { value: 'expert_assigned', label: 'Expert Assigned' },
  { value: 'documents_submitted', label: 'Docs Submitted' },
  { value: 'completed', label: 'Bid Complete' },
]

// --- Main Admin Panel Component ---
const BiddingManagementContent = () => {
  const [bids, setBids] = useState<{
    newApplication: BiddingApplication[]
    expertAssigned: BiddingApplication[]
    docsSubmitted: BiddingApplication[]
    bidComplete: BiddingApplication[]
  }>({
    newApplication: [],
    expertAssigned: [],
    docsSubmitted: [],
    bidComplete: []
  })
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedBid, setSelectedBid] = useState<BiddingApplication | null>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resultNotes, setResultNotes] = useState('')

  // Load bidding applications
  const loadBiddingApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchBiddingApplications({
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      // Group by status
      const grouped = {
        newApplication: result.data.filter(bid => bid.status === 'pending' || bid.status === 'new'),
        expertAssigned: result.data.filter(bid => bid.status === 'expert_assigned'),
        docsSubmitted: result.data.filter(bid => bid.status === 'documents_submitted' || bid.status === 'in_progress'),
        bidComplete: result.data.filter(bid => bid.status === 'completed' || bid.status === 'cancelled')
      }

      setBids(grouped)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch bidding applications')
    } finally {
      setLoading(false)
    }
  }

  // Load experts
  const loadExperts = async () => {
    try {
      const result = await fetchExperts({ limit: 100 })
      setExperts(result.data)
    } catch (error) {
      console.error('Failed to load experts:', error)
    }
  }

  useEffect(() => {
    loadBiddingApplications()
    loadExperts()
  }, [])

  const handleViewDetails = async (bid: BiddingApplication) => {
    try {
      const fullBidData = await getBiddingApplicationById(bid.id)
      setSelectedBid(fullBidData)
      setResultNotes(fullBidData.result_notes || '')
      setIsDetailsDrawerOpen(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch bid details')
    }
  }

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false)
    setSelectedBid(null)
    setResultNotes('')
  }

  const handleUpdateStatus = async (event: any) => {
    if (!selectedBid) return
    
    const newStatus = event.target.value
    setError(null)
    try {
      await updateBiddingApplicationStatus(selectedBid.id, newStatus)
      setSuccessMessage('Status updated successfully')
      await loadBiddingApplications() // Refresh the data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleAssignExpert = async (event: any) => {
    if (!selectedBid) return
    
    const expertId = event.target.value
    setError(null)
    try {
      await assignExpertToBid(selectedBid.id, expertId)
      setSuccessMessage('Expert assigned successfully')
      await loadBiddingApplications() // Refresh the data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign expert')
    }
  }

  const handleConfirmDeposit = async () => {
    if (!selectedBid) return
    
    setError(null)
    try {
      await updateDepositStatus(selectedBid.id, 'confirmed')
      setSuccessMessage('Deposit confirmed successfully')
      await loadBiddingApplications() // Refresh the data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to confirm deposit')
    }
  }

  const handleSaveResult = async () => {
    if (!selectedBid) return
    
    setError(null)
    try {
      await updateBidResult(selectedBid.id, resultNotes, 'completed')
      setSuccessMessage('Bid result saved successfully')
      await loadBiddingApplications() // Refresh the data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save result')
    }
  }

  // Close notifications
  const handleCloseError = () => {
    setError(null)
  }

  const handleCloseSuccess = () => {
    setSuccessMessage(null)
  }

  const KanbanColumn = ({
    title,
    bids,
    onCardClick,
  }: {
    title: string
    bids: any[]
    onCardClick: (bid: any) => void
  }) => (
    <Paper
      sx={{
        width: 300,
        minWidth: 300,
        p: 1,
        backgroundColor: 'grey.100',
        height: '100%',
      }}
    >
      <Typography variant='h6' sx={{ p: 1, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {bids.map((bid) => (
          <Card
            key={bid.id}
            onClick={() => onCardClick(bid)}
            sx={{ cursor: 'pointer' }}
          >
            <CardContent>
              <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                {bid.case_number || bid.id}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {bid.user?.full_name || 'N/A'}
              </Typography>
              <Typography variant='caption'>
                Date: {new Date(bid.created_at).toLocaleDateString()}
              </Typography>
              {bid.expert?.name && (
                <Typography variant='caption' sx={{ display: 'block' }}>
                  Expert: {bid.expert.name}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'grey.50',
          height: '100vh',
          overflowX: 'auto',
        }}
      >
        <Toolbar />
        <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 2 }}>
          Proxy Bidding Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <KanbanColumn
            title='New Application'
            bids={bids.newApplication}
            onCardClick={handleViewDetails}
          />
          <KanbanColumn
            title='Expert Assigned'
            bids={bids.expertAssigned}
            onCardClick={handleViewDetails}
          />
          <KanbanColumn
            title='Docs & Deposit Verified'
            bids={bids.docsSubmitted}
            onCardClick={handleViewDetails}
          />
          <KanbanColumn
            title='Bid Complete'
            bids={bids.bidComplete}
            onCardClick={handleViewDetails}
          />
        </Box>
      </Box>

      {/* --- Bid Details Side Drawer --- */}
      <Drawer
        anchor='right'
        open={isDetailsDrawerOpen}
        onClose={handleCloseDetailsDrawer}
      >
        <Box sx={{ width: { xs: '90vw', sm: 500 }, p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='h5'>Bid Details</Typography>
            <IconButton onClick={handleCloseDetailsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedBid && (
            <>
              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                {selectedBid.case_number || selectedBid.id}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                User: {selectedBid.user?.full_name || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Email: {selectedBid.user?.email || 'N/A'}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* --- Status Management --- */}
              <Box mb={3}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Current Status</InputLabel>
                  <Select
                    value={selectedBid?.status || 'pending'}
                    label='Current Status'
                    onChange={handleUpdateStatus}
                  >
                    {bidStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Assigned Expert</InputLabel>
                  <Select
                    value={selectedBid?.assigned_expert_id || ''}
                    label='Assigned Expert'
                    onChange={handleAssignExpert}
                  >
                    <MenuItem value=''>
                      <em>Assign an expert...</em>
                    </MenuItem>
                    {experts.map((expert) => (
                      <MenuItem key={expert.id} value={expert.id}>
                        {expert.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* --- Payment & Deposit --- */}
              <Box mb={3}>
                <Typography variant='h6'>Financials</Typography>
                <Chip
                  label={`Service Fee: ${selectedBid.payment_status || 'Pending'}`}
                  color={
                    selectedBid.payment_status === 'paid' ? 'success' : 'warning'
                  }
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Deposit: ${selectedBid.deposit_status || 'Pending'}`}
                  color={
                    selectedBid.deposit_status === 'confirmed'
                      ? 'success'
                      : selectedBid.deposit_status === 'refunded'
                      ? 'info'
                      : 'warning'
                  }
                />
                <Button
                  size='small'
                  variant='contained'
                  sx={{ display: 'block', mt: 2 }}
                  onClick={handleConfirmDeposit}
                >
                  Confirm Deposit Received
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* --- Document Management --- */}
              <Box>
                <Typography variant='h6'>Documents</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    my: 1,
                  }}
                >
                  <Typography>User Signature Certificate</Typography>
                  <Button size='small' startIcon={<DownloadIcon />}>
                    Download
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    my: 1,
                  }}
                >
                  <Typography>Official Bid Result</Typography>
                  <Button
                    size='small'
                    component='label'
                    startIcon={<UploadIcon />}
                  >
                    Upload
                    <input type='file' hidden />
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  label='Bid Result Memo (e.g., successful bid amount, notes)'
                  multiline
                  rows={3}
                  margin='normal'
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                />
                <Button 
                  variant='contained' 
                  sx={{ mt: 1 }}
                  onClick={handleSaveResult}
                >
                  Save Result
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Snackbar Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function BiddingManagementPanel() {
  return (
    <AdminLayout>
      <BiddingManagementContent />
    </AdminLayout>
  )
}
