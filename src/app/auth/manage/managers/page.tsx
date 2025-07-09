'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
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
  Avatar,
  SelectChangeEvent,
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
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
  AdminUser,
} from '@/app/api/admin-users/actions'
import { useAuth } from '@/contexts/AuthContext'
import { 
  canModifyUserRole, 
  getAllowedRoles, 
  canDeactivateUser 
} from '@/utils/admin-permissions'

// Role translation helper
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'super_admin':
      return '슈퍼 관리자'
    case 'admin':
      return '관리자'
    case 'content_manager':
      return '콘텐츠 관리자'
    case 'customer_support':
      return '고객 지원'
    case 'expert':
      return '전문가'
    case 'user':
      return '사용자'
    default:
      return role
  }
}

// Status translation helper
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Active':
      return '활성'
    case 'Pending':
      return '대기중'
    case 'Inactive':
      return '비활성'
    default:
      return status
  }
}

const modalStyle = {
  position: 'absolute',
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
  const { user } = useAuth()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Partial<AdminUser> | null>(
    null
  )
  const [isEditing, setIsEditing] = useState(false)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [allowedRoles, setAllowedRoles] = useState<string[]>([])

  // Get current user's allowed roles
  useEffect(() => {
    if (user?.admin_role) {
      const roles = getAllowedRoles(user.admin_role)
      setAllowedRoles(roles)
    }
  }, [user])

  // Load admin users
  const loadAdminUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const adminUsers = await fetchAdminUsers()
      setAdmins(adminUsers)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : '관리자 사용자 조회 실패'
      )
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
    setSelectedAdmin({ name: '', email: '', role: allowedRoles[0] || 'customer_support' })
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

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    setSelectedAdmin((prev) => ({ ...prev, role: value }))
  }

  const handleSaveAdmin = async () => {
    if (!selectedAdmin || !user) return

    setError(null)
    try {
      if (isEditing && selectedAdmin.id) {
        // Check if current user can modify this admin's role
        const targetCurrentRole = admins.find(a => a.id === selectedAdmin.id)?.role || 'user'
        if (!canModifyUserRole(user.admin_role, targetCurrentRole, selectedAdmin.role || '')) {
          setError('이 사용자의 역할을 수정할 권한이 없습니다.')
          return
        }
        
        // Update logic
        await updateAdminRole(selectedAdmin.id, selectedAdmin.role || '', user.id)
        setSuccessMessage('관리자 역할이 성공적으로 업데이트되었습니다')
      } else {
        // Create logic (Invite)
        const newAdmin = await inviteAdminUser(
          selectedAdmin.email || '',
          selectedAdmin.name || '',
          selectedAdmin.role || 'customer_support',
          user.id
        )
        setAdmins([...admins, newAdmin])
        setSuccessMessage('관리자가 성공적으로 초대되었습니다')
      }
      await loadAdminUsers() // Refresh the list
      handleCloseFormModal()
    } catch (error) {
      setError(error instanceof Error ? error.message : '관리자 저장 실패')
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
      setSuccessMessage('관리자가 성공적으로 비활성화되었습니다')
      await loadAdminUsers() // Refresh the list
      handleCloseDeactivateDialog()
    } catch (error) {
      setError(error instanceof Error ? error.message : '관리자 비활성화 실패')
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
      case 'super_admin':
        return 'error'
      case 'admin':
        return 'secondary'
      case 'content_manager':
        return 'primary'
      case 'customer_support':
        return 'info'
      case 'expert':
        return 'success'
      case 'user':
        return 'warning'
      default:
        return 'default'
    }
  }

  // DataGrid columns definition
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '관리자명',
      width: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            height: '100%',
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.value?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Typography variant='body2' fontWeight='medium'>
            {params.value || '미입력'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: '이메일',
      width: 250,
    },
    {
      field: 'role',
      headerName: '역할',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getRoleLabel(params.value)}
          color={getRoleChipColor(params.value)}
          size='small'
        />
      ),
    },
    {
      field: 'lastActive',
      headerName: '마지막 활동',
      width: 150,
    },
    {
      field: 'status',
      headerName: '상태',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={
            params.value === 'Active'
              ? 'success'
              : params.value === 'Pending'
                ? 'warning'
                : 'default'
          }
          size='small'
        />
      ),
    },
    {
      field: 'actions',
      headerName: '기타',
      width: 120,
      renderCell: (params) => {
        const canEdit = user?.admin_role && canModifyUserRole(user.admin_role, params.row.role, params.row.role)
        const canDeactivate = user?.admin_role && canDeactivateUser(user.admin_role, params.row.role)
        if (params.row.role === 'super_admin') return null
        return (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}
          >
            {canEdit && (
              <IconButton
                size='small'
                onClick={() => handleOpenEditModal(params.row)}
              >
                <EditIcon />
              </IconButton>
            )}
            {canDeactivate && (
              <IconButton
                size='small'
                onClick={() => handleOpenDeactivateDialog(params.row)}
              >
                <PersonOffIcon />
              </IconButton>
            )}
          </Box>
        )
      },
      sortable: false,
      filterable: false,
    },
  ]

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h5' component='h2'>
            관리자 관리
          </Typography>
          {allowedRoles.length > 0 && (
            <Button
              variant='contained'
              startIcon={<AddModeratorIcon />}
              onClick={handleOpenCreateModal}
            >
              새 관리자 초대
            </Button>
          )}
        </Box>

        {/* View - DataGrid */}
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={admins}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            loading={loading}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            localeText={{
              noRowsLabel: '관리자 사용자가 없습니다',
              footerRowSelected: (count) => `${count}개 행이 선택됨`,
              footerTotalRows: '총 행 수:',
              footerTotalVisibleRows: (visibleCount, totalCount) =>
                `${visibleCount.toLocaleString()} / ${totalCount.toLocaleString()}`,
            }}
          />
        </Box>
      </Box>

      {/* --- Invite/Update Form Modal --- */}
      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            {isEditing ? '관리자 역할 수정' : '새 관리자 초대'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <TextField
            name='name'
            label='관리자명'
            value={selectedAdmin?.name || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={isEditing}
          />
          <TextField
            name='email'
            label='관리자 이메일'
            value={selectedAdmin?.email || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={isEditing}
          />
          <FormControl fullWidth>
            <InputLabel>역할</InputLabel>
            <Select
              name='role'
              value={selectedAdmin?.role || ''}
              label='역할'
              onChange={handleRoleChange}
            >
              {(isEditing ? allowedRoles : allowedRoles).map((role) => {
                if (role === 'super_admin') return null
                return (
                  <MenuItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}
          >
            <Button variant='outlined' onClick={handleCloseFormModal}>
              취소
            </Button>
            <Button variant='contained' onClick={handleSaveAdmin}>
              저장
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- Deactivate Confirmation Dialog --- */}
      <Dialog open={openDeactivateDialog} onClose={handleCloseDeactivateDialog}>
        <DialogTitle>비활성화 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 관리자 &quot;{selectedAdmin?.name}&quot;을 비활성화하시겠습니까? 해당
            관리자는 관리자 패널에 대한 접근 권한을 잃게 됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeactivateDialog}>취소</Button>
          <Button onClick={handleDeactivateAdmin} color='warning'>
            비활성화
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
        <Alert
          onClose={handleCloseError}
          severity='error'
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity='success'
          sx={{ width: '100%' }}
        >
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
