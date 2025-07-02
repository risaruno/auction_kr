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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import {
  Edit as EditIcon,
  PersonOff as PersonOffIcon,
  AddModerator as AddModeratorIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import {
  fetchAdminUsers,
  inviteAdminUser,
  updateAdminRole,
  deactivateAdminUser,
  AdminUser
} from '@/app/api/admin-users/actions'

// --- Sample Data ---
const initialAdmins = [
  {
    id: 'admin-01',
    name: '최고관리자',
    email: 'super@certo.com',
    role: 'Super Admin',
    lastActive: '2025-06-19',
    status: 'Active',
  },
  {
    id: 'admin-02',
    name: '박서준',
    email: 'content@certo.com',
    role: 'Content Manager',
    lastActive: '2025-06-18',
    status: 'Active',
  },
  {
    id: 'admin-03',
    name: '이하나',
    email: 'support@certo.com',
    role: 'Customer Support',
    lastActive: '2025-06-19',
    status: 'Active',
  },
  {
    id: 'admin-04',
    name: '김유진',
    email: 'deactivated@certo.com',
    role: 'Customer Support',
    lastActive: '2025-03-10',
    status: 'Deactivated',
  },
]

const adminRoles = [
  'Super Admin',
  'Content Manager',
  'Customer Support',
  'Finance',
]

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
}

// --- Main Admin Panel Component ---
const AdminManagementContent = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Partial<AdminUser> | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Load admin users
  const loadAdminUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const adminUsers = await fetchAdminUsers()
      setAdmins(adminUsers)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch admin users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminUsers()
  }, [])

  // --- Handlers for Form Modal ---
  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedAdmin({ name: '', email: '', role: 'Customer Support' })
    setOpenFormModal(true)
  }

  const handleOpenEditModal = (admin: AdminUser) => {
    setIsEditing(true)
    setSelectedAdmin(admin)
    setOpenFormModal(true)
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
    setSelectedAdmin(null)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSelectedAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveAdmin = async () => {
    if (!selectedAdmin) return
    
    setError(null)
    try {
      if (isEditing && selectedAdmin.id) {
        // Update logic
        await updateAdminRole(selectedAdmin.id, selectedAdmin.role || '')
        setSuccessMessage('Admin role updated successfully')
      } else {
        // Create logic (Invite)
        const newAdmin = await inviteAdminUser(
          selectedAdmin.email || '',
          selectedAdmin.name || '',
          selectedAdmin.role || 'Customer Support'
        )
        setAdmins([...admins, newAdmin])
        setSuccessMessage('Admin invited successfully')
      }
      await loadAdminUsers() // Refresh the list
      handleCloseFormModal()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save admin')
    }
  }

  // --- Handlers for Deactivate Dialog ---
  const handleOpenDeactivateDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setOpenDeactivateDialog(true)
  }

  const handleCloseDeactivateDialog = () => {
    setOpenDeactivateDialog(false)
    setSelectedAdmin(null)
  }

  const handleDeactivateAdmin = async () => {
    if (!selectedAdmin?.id) return
    
    setError(null)
    try {
      await deactivateAdminUser(selectedAdmin.id)
      setSuccessMessage('Admin deactivated successfully')
      await loadAdminUsers() // Refresh the list
      handleCloseDeactivateDialog()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to deactivate admin')
    }
  }

  // Close notifications
  const handleCloseError = () => {
    setError(null)
  }

  const handleCloseSuccess = () => {
    setSuccessMessage(null)
  }

  const getRoleChipColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'error'
      case 'Content Manager':
        return 'primary'
      case 'Customer Support':
        return 'info'
      case 'Finance':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
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
                Administrator Management
              </Typography>
              <Button
                variant='contained'
                startIcon={<AddModeratorIcon />}
                onClick={handleOpenCreateModal}
              >
                Invite New Admin
              </Button>
            </Box>

            {/* View - Data Table */}
            <TableContainer component={Paper} variant='outlined'>
              <Table sx={{ minWidth: 650 }} aria-label='admins table'>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Admin Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell>Status</TableCell>
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
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography color="text.secondary">
                          No admin users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={admin.role}
                          color={getRoleChipColor(admin.role)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{admin.lastActive}</TableCell>
                      <TableCell>
                        <Chip
                          label={admin.status}
                          color={
                            admin.status === 'Active' ? 'success' : 'default'
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenEditModal(admin)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenDeactivateDialog(admin)}
                        >
                          <PersonOffIcon />
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

      {/* --- Invite/Update Form Modal --- */}
      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            {isEditing ? 'Edit Admin Role' : 'Invite New Admin'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <TextField
            name='name'
            label='Admin Name'
            value={selectedAdmin?.name || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={isEditing}
          />
          <TextField
            name='email'
            label='Admin Email'
            value={selectedAdmin?.email || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={isEditing}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name='role'
              value={selectedAdmin?.role || ''}
              label='Role'
              onChange={handleFormChange as any}
            >
              {adminRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}
          >
            <Button variant='outlined' onClick={handleCloseFormModal}>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleSaveAdmin}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- Deactivate Confirmation Dialog --- */}
      <Dialog open={openDeactivateDialog} onClose={handleCloseDeactivateDialog}>
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate the admin "{selectedAdmin?.name}
            "? They will lose access to the admin panel.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeactivateDialog}>Cancel</Button>
          <Button onClick={handleDeactivateAdmin} color='warning'>
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error/Success Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function AdminManagementPanel() {
  return (
    <>
      <AdminManagementContent />
    </>
  )
}
