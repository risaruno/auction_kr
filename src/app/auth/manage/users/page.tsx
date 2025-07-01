'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Drawer,
  Divider,
  Toolbar,
  Typography,
  CssBaseline,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  LockReset as LockResetIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'
import { 
  fetchUsers,
  suspendUser,
  updateUserPoints,
  getUserById 
} from '@/app/api/auth/users/actions'
import { User } from '@/types/api'

// --- Main Admin Panel Content ---
const UserManagementContent = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false)
  const [openResetDialog, setOpenResetDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // --- Fetch Users with pagination and search ---
  const loadUsers = async (searchTerm?: string, pageNum: number = 1) => {
    setLoading(true)
    try {
      const result = await fetchUsers({
        search: searchTerm,
        page: pageNum,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      setUsers(result.data)
      setTotalPages(result.totalPages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(searchQuery, page)
  }, [page])

  // --- Search handler ---
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
    loadUsers(searchQuery, 1)
  }

  // --- Handlers ---
  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsDrawerOpen(true)
  }

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false)
    setSelectedUser(null)
  }

  const handleOpenSuspendDialog = (user: User) => {
    setSelectedUser(user)
    setOpenSuspendDialog(true)
  }

  const handleSuspendUser = async () => {
    if (!selectedUser) return
    try {
      await suspendUser(selectedUser.id)
      setSnackbar({
        open: true,
        message: 'User suspended successfully',
        severity: 'success'
      })
      loadUsers(searchQuery, page) // Refresh the list
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to suspend user',
        severity: 'error'
      })
    } finally {
      setOpenSuspendDialog(false)
    }
  }

  const handleTriggerPasswordReset = async () => {
    if (!selectedUser) return
    try {
      // Create FormData for the findPassword action
      const formData = new FormData()
      formData.append('email', selectedUser.email)
      
      // Import and use the findPassword action
      const { findPassword } = await import('@/app/api/auth/sign/actions')
      const result = await findPassword({ error: null, message: null }, formData)
      
      if (result.error) {
        setSnackbar({
          open: true,
          message: result.error,
          severity: 'error'
        })
      } else {
        setSnackbar({
          open: true,
          message: `Password reset link sent to ${selectedUser.email}`,
          severity: 'success'
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to send password reset',
        severity: 'error'
      })
    } finally {
      setOpenResetDialog(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
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
              <Typography variant='h5'>User Management</Typography>
              <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size='small'
                  placeholder='Search users...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" variant="contained" size="small">
                  Search
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Signup Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.signupDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={
                              user.status === 'Active' 
                                ? 'success' 
                                : user.status === 'Suspended' 
                                ? 'error' 
                                : 'warning'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={() => handleViewDetails(user)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenSuspendDialog(user)}
                            disabled={user.status === 'Suspended'}
                          >
                            <BlockIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  sx={{ mr: 1 }}
                >
                  Previous
                </Button>
                <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  sx={{ ml: 1 }}
                >
                  Next
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* --- User Details Side Drawer --- */}
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
            <Typography variant='h5'>User Details</Typography>
            <IconButton onClick={handleCloseDetailsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedUser && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}
                >
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {selectedUser.email}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {selectedUser.phone}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant='outlined'
                size='small'
                startIcon={<LockResetIcon />}
                onClick={() => setOpenResetDialog(true)}
                sx={{ my: 2 }}
              >
                Trigger Password Reset
              </Button>
              {/* Tabs for more details can be added here */}
            </>
          )}
        </Box>
      </Drawer>

      {/* --- Confirmation Dialogs --- */}
      <Dialog
        open={openSuspendDialog}
        onClose={() => setOpenSuspendDialog(false)}
      >
        <DialogTitle>Confirm Suspension</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to suspend "{selectedUser?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuspendDialog(false)}>Cancel</Button>
          <Button onClick={handleSuspendUser} color='warning'>
            Suspend
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Confirm Password Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send a password reset link to {selectedUser?.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button onClick={handleTriggerPasswordReset}>Send Link</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// Wrapper component to include the main layout
export default function UserManagementPanel() {
  return (
    <AdminLayout>
      <UserManagementContent />
    </AdminLayout>
  )
}
