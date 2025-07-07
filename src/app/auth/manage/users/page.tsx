'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Divider,
  Toolbar,
  Typography,
  CssBaseline,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  Modal,
  Skeleton,
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  LockReset as LockResetIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import {
  fetchUsers,
  suspendUser,
  updateUserPoints,
  getUserById,
} from '@/app/api/auth/users/actions'
import { User } from '@/types/api'
import { BankLabels, Bank } from '@/types/bank'

// Extended user type for detailed modal view
interface ExtendedUser extends User {
  address?: string
  addr_detail?: string
  bank?: string
  account_number?: string
  created_at?: string
  edited_at?: string
  full_name?: string
}

// Status translation helper
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Active':
      return '활성'
    case 'Suspended':
      return '정지됨'
    case 'Inactive':
      return '비활성'
    default:
      return '알 수 없음'
  }
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  overflow: 'hidden',
}

const userDetailsModalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  overflow: 'auto',
}

// --- Main Admin Panel Content ---
const UserManagementContent = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false)
  const [openSuspendModal, setOpenSuspendModal] = useState(false)
  const [openResetModal, setOpenResetModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // --- Fetch Users with pagination and search ---
  const loadUsers = async (searchTerm?: string, pageNum: number = 1) => {
    setLoading(true)
    try {
      const result = await fetchUsers({
        search: searchTerm,
        page: pageNum,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })

      setUsers(result.data)
      setTotalPages(result.totalPages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : '사용자 조회 실패',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(searchQuery, page)
  }, [page])

  // Handle DataGrid pagination changes
  useEffect(() => {
    const newPage = paginationModel.page + 1 // DataGrid uses 0-based indexing
    if (newPage !== page) {
      setPage(newPage)
    }
  }, [paginationModel.page])

  // --- Search handler ---
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
    loadUsers(searchQuery, 1)
  }

  // --- Handlers ---
  const handleViewDetails = async (user: User) => {
    setSelectedUser(user)
    setIsUserDetailsModalOpen(true)
    setUserDetailsLoading(true)

    // Try to fetch additional user profile data using client-side supabase
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Fetch complete profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && profile) {
        // Merge user data with profile data
        setSelectedUser({
          ...user,
          phone: profile.phone || '',
          address: profile.address,
          addr_detail: profile.addr_detail,
          bank: profile.bank,
          account_number: profile.account_number,
          created_at: profile.created_at,
          edited_at: profile.edited_at,
          full_name: profile.full_name,
        })
      }
    } catch (error) {
      console.log('Could not fetch additional user details:', error)
      // Continue with basic user data
    } finally {
      setUserDetailsLoading(false)
    }
  }

  const handleCloseUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false)
    setSelectedUser(null)
    setUserDetailsLoading(false)
  }

  const handleOpenSuspendModal = (user: User) => {
    setSelectedUser(user)
    setOpenSuspendModal(true)
  }

  const handleSuspendUser = async () => {
    if (!selectedUser) return
    try {
      await suspendUser(selectedUser.id)
      setSnackbar({
        open: true,
        message: '사용자가 성공적으로 정지되었습니다',
        severity: 'success',
      })
      loadUsers(searchQuery, page) // Refresh the list
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : '사용자 정지 실패',
        severity: 'error',
      })
    } finally {
      setOpenSuspendModal(false)
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
      const result = await findPassword(
        { error: null, message: null },
        formData
      )

      if (result.error) {
        setSnackbar({
          open: true,
          message: result.error,
          severity: 'error',
        })
      } else {
        setSnackbar({
          open: true,
          message: `비밀번호 재설정 링크가 ${selectedUser.email}로 전송되었습니다`,
          severity: 'success',
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : '비밀번호 재설정 전송 실패',
        severity: 'error',
      })
    } finally {
      setOpenResetModal(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // DataGrid columns definition
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: '사용자명',
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
            {params.value?.charAt(0)?.toUpperCase() || 'U'}
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
      field: 'status',
      headerName: '상태',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={
            params.value === 'Active'
              ? 'success'
              : params.value === 'Suspended'
                ? 'error'
                : 'warning'
          }
          size='small'
        />
      ),
    },
    {
      field: 'signupDate',
      headerName: '가입일',
      width: 120,
    },
    {
      field: 'actions',
      headerName: '기타',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}
        >
          <IconButton
            size='small'
            onClick={() => handleViewDetails(params.row)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => handleOpenSuspendModal(params.row)}
            disabled={params.row.status === 'Suspended'}
          >
            <BlockIcon />
          </IconButton>
        </Box>
      ),
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
          <Typography variant='h5'>사용자 관리</Typography>
          <Box
            component='form'
            onSubmit={handleSearch}
            sx={{ display: 'flex', gap: 1 }}
          >
            <TextField
              size='small'
              placeholder='사용자 검색...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type='submit' variant='outlined' size='small'>
              <SearchIcon />
            </Button>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            loading={loading}
            disableRowSelectionOnClick
          />
        </Box>
      </Box>

      {/* --- User Details Modal --- */}
      <Modal
        open={isUserDetailsModalOpen}
        onClose={handleCloseUserDetailsModal}
        aria-labelledby='user-details-modal-title'
        aria-describedby='user-details-modal-description'
      >
        <Box sx={userDetailsModalStyle}>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography id='user-details-modal-title' variant='h5'>
                사용자 상세정보
              </Typography>
              <IconButton onClick={handleCloseUserDetailsModal}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {selectedUser && (
              <>
                {userDetailsLoading ? (
                  // Loading Skeleton
                  <Box>
                    {/* User Header Skeleton */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Skeleton
                        variant='circular'
                        width={64}
                        height={64}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Skeleton variant='text' width={150} height={32} />
                        <Skeleton
                          variant='rounded'
                          width={80}
                          height={24}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    {/* Contact Information Skeleton */}
                    <Box sx={{ mb: 3 }}>
                      <Skeleton
                        variant='text'
                        width={100}
                        height={24}
                        sx={{ mb: 1 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Skeleton variant='text' width='100%' height={20} />
                        <Skeleton variant='text' width='80%' height={20} />
                      </Box>
                    </Box>

                    {/* Address Information Skeleton */}
                    <Box sx={{ mb: 3 }}>
                      <Skeleton
                        variant='text'
                        width={80}
                        height={24}
                        sx={{ mb: 1 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Skeleton variant='text' width='100%' height={20} />
                        <Skeleton variant='text' width='90%' height={20} />
                      </Box>
                    </Box>

                    {/* Banking Information Skeleton */}
                    <Box sx={{ mb: 3 }}>
                      <Skeleton
                        variant='text'
                        width={120}
                        height={24}
                        sx={{ mb: 1 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Skeleton variant='text' width='70%' height={20} />
                        <Skeleton variant='text' width='85%' height={20} />
                      </Box>
                    </Box>

                    {/* Account Information Skeleton */}
                    <Box sx={{ mb: 3 }}>
                      <Skeleton
                        variant='text'
                        width={80}
                        height={24}
                        sx={{ mb: 1 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Skeleton variant='text' width='60%' height={20} />
                        <Skeleton variant='text' width='65%' height={20} />
                      </Box>
                    </Box>

                    {/* Action Buttons Skeleton */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Skeleton variant='rounded' width={140} height={36} />
                      <Skeleton variant='rounded' width={100} height={36} />
                    </Box>
                  </Box>
                ) : (
                  // Actual Content
                  <>
                    {/* User Header with Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mr: 2,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                          {selectedUser.name || '미입력'}
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedUser.status || 'Unknown')}
                          color={
                            selectedUser.status === 'Active'
                              ? 'success'
                              : selectedUser.status === 'Suspended'
                                ? 'error'
                                : 'warning'
                          }
                          size='small'
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    {/* Contact Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        연락처 정보
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant='body2'
                            sx={{ minWidth: 80, fontWeight: 'medium' }}
                          >
                            이메일:
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {selectedUser.email || '미입력'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant='body2'
                            sx={{ minWidth: 80, fontWeight: 'medium' }}
                          >
                            전화번호:
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {selectedUser.phone || '미입력'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Address Information */}
                    {(selectedUser.address || selectedUser.addr_detail) && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 'bold', mb: 1 }}
                        >
                          주소 정보
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          {selectedUser.address && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant='body2'
                                sx={{ minWidth: 80, fontWeight: 'medium' }}
                              >
                                주소:
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {selectedUser.address}
                              </Typography>
                            </Box>
                          )}
                          {selectedUser.addr_detail && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant='body2'
                                sx={{ minWidth: 80, fontWeight: 'medium' }}
                              >
                                상세주소:
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {selectedUser.addr_detail}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Banking Information */}
                    {(selectedUser.bank || selectedUser.account_number) && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 'bold', mb: 1 }}
                        >
                          보증금 반환계좌
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          {selectedUser.bank && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant='body2'
                                sx={{ minWidth: 80, fontWeight: 'medium' }}
                              >
                                은행:
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {selectedUser.bank &&
                                BankLabels[selectedUser.bank as Bank]
                                  ? BankLabels[selectedUser.bank as Bank].ko
                                  : selectedUser.bank}
                              </Typography>
                            </Box>
                          )}
                          {selectedUser.account_number && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant='body2'
                                sx={{ minWidth: 80, fontWeight: 'medium' }}
                              >
                                계좌번호:
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {selectedUser.account_number}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Account Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        계정 정보
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant='body2'
                            sx={{ minWidth: 80, fontWeight: 'medium' }}
                          >
                            가입일:
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {new Date(
                              selectedUser.created_at || selectedUser.signupDate
                            ).toLocaleString('ko-KR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </Typography>
                        </Box>
                        {(selectedUser as any).edited_at && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant='body2'
                              sx={{ minWidth: 80, fontWeight: 'medium' }}
                            >
                              수정일:
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {new Date(
                                (selectedUser as any).edited_at
                              ).toLocaleString('ko-KR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<LockResetIcon />}
                        onClick={() => setOpenResetModal(true)}
                      >
                        비밀번호 재설정
                      </Button>
                      {selectedUser.status !== 'Suspended' && (
                        <Button
                          variant='outlined'
                          size='small'
                          color='warning'
                          startIcon={<BlockIcon />}
                          onClick={() => {
                            setSelectedUser(selectedUser)
                            setOpenSuspendModal(true)
                          }}
                        >
                          계정 정지
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Modal>

      {/* --- Suspend User Modal --- */}
      <Modal
        open={openSuspendModal}
        onClose={() => setOpenSuspendModal(false)}
        aria-labelledby='suspend-modal-title'
        aria-describedby='suspend-modal-description'
      >
        <Box sx={modalStyle}>
          <Box sx={{ p: 3 }}>
            <Typography
              id='suspend-modal-title'
              variant='h6'
              component='h2'
              sx={{ mb: 2 }}
            >
              정지 확인
            </Typography>
            <Typography id='suspend-modal-description' sx={{ mb: 3 }}>
              정말로 "{selectedUser?.name}" 사용자를 정지하시겠습니까?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setOpenSuspendModal(false)}>취소</Button>
              <Button
                onClick={handleSuspendUser}
                color='warning'
                variant='contained'
              >
                정지
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* --- Password Reset Modal --- */}
      <Modal
        open={openResetModal}
        onClose={() => setOpenResetModal(false)}
        aria-labelledby='reset-modal-title'
        aria-describedby='reset-modal-description'
      >
        <Box sx={modalStyle}>
          <Box sx={{ p: 3 }}>
            <Typography
              id='reset-modal-title'
              variant='h6'
              component='h2'
              sx={{ mb: 2 }}
            >
              비밀번호 재설정 확인
            </Typography>
            <Typography id='reset-modal-description' sx={{ mb: 3 }}>
              {selectedUser?.email}로 비밀번호 재설정 링크를 전송하시겠습니까?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setOpenResetModal(false)}>취소</Button>
              <Button onClick={handleTriggerPasswordReset} variant='contained'>
                링크 전송
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

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
    <>
      <UserManagementContent />
    </>
  )
}
