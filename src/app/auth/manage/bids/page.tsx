'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  CssBaseline,
  Toolbar,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Modal,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  TablePagination,
  Drawer,
  Divider,
  SelectChangeEvent,
  Avatar,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
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

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'approved', label: 'Approved', color: 'info' as const },
  { value: 'in_progress', label: 'In Progress', color: 'primary' as const },
  { value: 'completed', label: 'Completed', color: 'success' as const },
  { value: 'rejected', label: 'Rejected', color: 'error' as const },
]

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'paid', label: 'Paid', color: 'success' as const },
  { value: 'failed', label: 'Failed', color: 'error' as const },
]

const depositStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'confirmed', label: 'Confirmed', color: 'success' as const },
  { value: 'refunded', label: 'Refunded', color: 'info' as const },
]

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
}

// --- Main Admin Panel Component ---
const BiddingManagementContent = () => {
  const [applications, setApplications] = useState<BiddingApplication[]>([])
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Pagination and filtering
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Detail drawer
  const [selectedApplication, setSelectedApplication] = useState<BiddingApplication | null>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [resultNotes, setResultNotes] = useState('')

  // Load bidding applications
  const loadBiddingApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchBiddingApplications({
        page: page + 1, // API expects 1-based pagination
        limit: rowsPerPage,
        status: statusFilter || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      setApplications(result.data)
      setTotalCount(result.total)
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
  }, [page, rowsPerPage, statusFilter])

  // Search handlers
  const handleSearch = () => {
    setPage(0) // Reset to first page on new search
    loadBiddingApplications()
  }

  const handleStatusFilter = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value)
    setPage(0) // Reset to first page on filter change
  }

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewDetails = async (application: BiddingApplication) => {
    try {
      const fullApplicationData = await getBiddingApplicationById(application.id)
      setSelectedApplication(fullApplicationData)
      setResultNotes(fullApplicationData.result_notes || '')
      setIsDetailsDrawerOpen(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch application details')
    }
  }

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false)
    setSelectedApplication(null)
    setResultNotes('')
  }

  const handleUpdateStatus = async (event: any) => {
    if (!selectedApplication) return
    
    const newStatus = event.target.value
    setError(null)
    try {
      await updateBiddingApplicationStatus(selectedApplication.id, newStatus)
      setSuccessMessage('Status updated successfully')
      await loadBiddingApplications() // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id)
      setSelectedApplication(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleAssignExpert = async (event: any) => {
    if (!selectedApplication) return
    
    const expertId = event.target.value
    setError(null)
    try {
      await assignExpertToBid(selectedApplication.id, expertId)
      setSuccessMessage('Expert assigned successfully')
      await loadBiddingApplications() // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id)
      setSelectedApplication(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign expert')
    }
  }

  const handleConfirmDeposit = async () => {
    if (!selectedApplication) return
    
    setError(null)
    try {
      await updateDepositStatus(selectedApplication.id, 'confirmed')
      setSuccessMessage('Deposit confirmed successfully')
      await loadBiddingApplications() // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id)
      setSelectedApplication(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to confirm deposit')
    }
  }

  const handleSaveResult = async () => {
    if (!selectedApplication) return
    
    setError(null)
    try {
      await updateBidResult(selectedApplication.id, resultNotes, 'completed')
      setSuccessMessage('Bid result saved successfully')
      await loadBiddingApplications() // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id)
      setSelectedApplication(updated)
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

  const getStatusChip = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return (
      <Chip 
        label={statusOption?.label || status} 
        color={statusOption?.color || 'default'}
        size="small"
      />
    )
  }

  const getPaymentStatusChip = (status: string) => {
    const statusOption = paymentStatusOptions.find(opt => opt.value === status)
    return (
      <Chip 
        label={statusOption?.label || status} 
        color={statusOption?.color || 'default'}
        size="small"
        variant="outlined"
      />
    )
  }

  const getDepositStatusChip = (status: string) => {
    const statusOption = depositStatusOptions.find(opt => opt.value === status)
    return (
      <Chip 
        label={statusOption?.label || status} 
        color={statusOption?.color || 'default'}
        size="small"
        variant="filled"
      />
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant='h5' component='h2'>
                Bidding Applications Management
              </Typography>
            </Box>

            {/* Search and Filter Controls */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 250 }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilter}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Application</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Expert</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Deposit</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align='center'>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align='center'>
                        No bidding applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {application.case_number || `App #${application.id}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {application.court_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 1,
                                bgcolor: 'primary.light',
                                fontSize: '0.8rem'
                              }}
                            >
                              {application.user?.full_name?.charAt(0) || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {application.user?.full_name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {application.user?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {application.expert ? (
                            <Box>
                              <Typography variant="body2">
                                {application.expert.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Expert assigned
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(application.status)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusChip(application.payment_status || 'pending')}
                        </TableCell>
                        <TableCell>
                          {getDepositStatusChip(application.deposit_status || 'pending')}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(application.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={() => handleViewDetails(application)}
                            title="View Details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
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
            <Typography variant='h5'>Application Details</Typography>
            <IconButton onClick={handleCloseDetailsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedApplication && (
            <>
              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                {selectedApplication.case_number || `Application #${selectedApplication.id}`}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                User: {selectedApplication.user?.full_name || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Email: {selectedApplication.user?.email || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Court: {selectedApplication.court_name || 'N/A'}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* --- Status Management --- */}
              <Box mb={3}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Current Status</InputLabel>
                  <Select
                    value={selectedApplication?.status || 'pending'}
                    label='Current Status'
                    onChange={handleUpdateStatus}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Assigned Expert</InputLabel>
                  <Select
                    value={selectedApplication?.expert_id || ''}
                    label='Assigned Expert'
                    onChange={handleAssignExpert}
                  >
                    <MenuItem value=''>
                      <em>Assign an expert...</em>
                    </MenuItem>
                    {experts.map((expert) => (
                      <MenuItem key={expert.id} value={expert.id}>
                        {expert.name} ({expert.location})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* --- Payment & Deposit --- */}
              <Box mb={3}>
                <Typography variant='h6'>Financials</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  {getPaymentStatusChip(selectedApplication.payment_status || 'pending')}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Service Fee
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  {getDepositStatusChip(selectedApplication.deposit_status || 'pending')}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Deposit
                  </Typography>
                </Box>
                {selectedApplication.deposit_status !== 'confirmed' && (
                  <Button
                    size='small'
                    variant='contained'
                    onClick={handleConfirmDeposit}
                  >
                    Confirm Deposit Received
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* --- Document Management --- */}
              <Box>
                <Typography variant='h6'>Bid Result</Typography>
                <TextField
                  fullWidth
                  label='Bid Result Notes (e.g., successful bid amount, outcome)'
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
