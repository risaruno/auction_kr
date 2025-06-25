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
} from '@mui/material'
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  LockReset as LockResetIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'

// Define a proper interface for the User data
interface User {
  id: string
  name: string
  email: string
  phone: string
  signupDate: string
  status: 'Active' | 'Suspended' | 'Pending'
  points: number
  // serviceHistory would be fetched separately when needed
}

// --- Main Admin Panel Content ---
const UserManagementContent = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false)
  const [openResetDialog, setOpenResetDialog] = useState(false)

  // --- Fetch Users on Load ---
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, status: 'Suspended' }),
      })
      // Refresh the user list to show the change
      fetchUsers()
    } catch (error) {
      console.error('Failed to suspend user', error)
    } finally {
      setOpenSuspendDialog(false)
    }
  }

  const handleTriggerPasswordReset = async () => {
    if (!selectedUser) return
    try {
      // This uses the same API as the public "find password" page
      await fetch('/api/auth/find-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email }),
      })
      alert(`Password reset link sent to ${selectedUser.email}`)
    } catch (error) {
      console.error('Failed to send reset link', error)
    } finally {
      setOpenResetDialog(false)
    }
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
              <TextField
                size='small'
                placeholder='Search...'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Signup Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        <CircularProgress />
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
                              user.status === 'Active' ? 'success' : 'warning'
                            }
                            size='small'
                          />
                        </TableCell>
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
