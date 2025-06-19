'use client'
import React, { useState } from 'react'
import {
  Box,
  Drawer,
  Divider,
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
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  LockReset as LockResetIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'

// --- Sample Data ---
const initialUsers = [
  {
    id: 'user-001',
    name: '김민준',
    email: 'k**@example.com',
    phone: '010-****-1234',
    signupDate: '2024-05-20',
    status: 'Active',
    points: 15000,
    serviceHistory: [
      {
        id: 'service-a1',
        type: '대리입찰',
        caseNumber: '2024타경110861',
        status: '입찰완료',
      },
      {
        id: 'service-a2',
        type: '전문가 서비스',
        caseNumber: '2024타경987654',
        status: '상담완료',
      },
    ],
  },
  {
    id: 'user-002',
    name: '이서연',
    email: 'l**@example.com',
    phone: '010-****-5678',
    signupDate: '2024-05-18',
    status: 'Suspended',
    points: 0,
    serviceHistory: [],
  },
]

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@')
  if (localPart.length > 2) {
    return `${localPart.substring(0, 2)}${'*'.repeat(
      localPart.length - 2
    )}@${domain}`
  }
  return email
}

// --- Main Admin Panel Component ---
const UserManagementContent = () => {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false)
  const [openResetDialog, setOpenResetDialog] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [pointsToAdd, setPointsToAdd] = useState(0)
  const [pointReason, setPointReason] = useState('')

  // --- Handlers for User Details Drawer ---
  const handleViewDetails = (user: any) => {
    // In a real app, you would fetch the full, unmasked data here
    const fullUserData = {
      ...user,
      email: 'kminjun@example.com',
      phone: '010-1234-1234',
    }
    setSelectedUser(fullUserData)
    setIsDetailsDrawerOpen(true)
  }

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false)
    setSelectedUser(null)
    setActiveTab(0)
  }

  // --- Handlers for Dialogs ---
  const handleOpenSuspendDialog = (user: any) => {
    setSelectedUser(user)
    setOpenSuspendDialog(true)
  }

  const handleCloseSuspendDialog = () => {
    setOpenSuspendDialog(false)
    setSelectedUser(null)
  }

  const handleSuspendUser = () => {
    // Logic to suspend the user would go here
    console.log(`Suspending user: ${selectedUser?.name}`)
    handleCloseSuspendDialog()
  }

  const handleOpenResetDialog = () => setOpenResetDialog(true)
  const handleCloseResetDialog = () => setOpenResetDialog(false)
  const handleTriggerPasswordReset = () => {
    // Logic to send reset link would go here
    console.log(`Sending password reset to ${selectedUser?.email}`)
    handleCloseResetDialog()
  }

  const handleAddPoints = () => {
    // Logic to add points would go here
    console.log(
      `Adding ${pointsToAdd} points to ${selectedUser?.name} for: ${pointReason}`
    )
    setPointsToAdd(0)
    setPointReason('')
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* --- Main Content --- */}
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
                User Management
              </Typography>
              <TextField
                size='small'
                variant='outlined'
                placeholder='Search by name or email...'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* View - Data Table */}
            <TableContainer component={Paper} variant='outlined'>
              <Table sx={{ minWidth: 650 }} aria-label='users table'>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email (Masked)</TableCell>
                    <TableCell>Phone (Masked)</TableCell>
                    <TableCell>Signup Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
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
                  ))}
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
                onClick={handleOpenResetDialog}
                sx={{ my: 2 }}
              >
                Trigger Password Reset
              </Button>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label='Service History' />
                <Tab label='Points Management' />
              </Tabs>
              <Box sx={{ pt: 2 }}>
                {activeTab === 0 && (
                  <TableContainer>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Service</TableCell>
                          <TableCell>Case Number</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedUser.serviceHistory.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{item.caseNumber}</TableCell>
                            <TableCell>
                              <Chip label={item.status} size='small' />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {activeTab === 1 && (
                  <Box>
                    <Typography variant='h6'>
                      Current Points: {selectedUser.points.toLocaleString()} P
                    </Typography>
                    <TextField
                      type='number'
                      label='Points to Add/Subtract'
                      value={pointsToAdd}
                      onChange={(e) => setPointsToAdd(parseInt(e.target.value))}
                      fullWidth
                      margin='normal'
                    />
                    <TextField
                      label='Reason'
                      value={pointReason}
                      onChange={(e) => setPointReason(e.target.value)}
                      fullWidth
                      margin='normal'
                    />
                    <Button variant='contained' onClick={handleAddPoints}>
                      Update Points
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* --- Confirmation Dialogs --- */}
      <Dialog open={openSuspendDialog} onClose={handleCloseSuspendDialog}>
        <DialogTitle>Confirm Suspension</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to suspend the user "{selectedUser?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuspendDialog}>Cancel</Button>
          <Button onClick={handleSuspendUser} color='warning'>
            Suspend
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>Confirm Password Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will send a password reset link to {selectedUser?.email}. Are
            you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Cancel</Button>
          <Button onClick={handleTriggerPasswordReset} color='primary'>
            Send Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function UserManagementPanel() {
  return (
    <AdminLayout>
      <UserManagementContent />
    </AdminLayout>
  )
}
