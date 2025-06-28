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
  Avatar,
  Chip,
  IconButton,
  Modal,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  TablePagination,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'
import { 
  fetchExperts,
  createExpert,
  updateExpert,
  deleteExpert 
} from '@/app/experts/actions'
import { Expert, ExpertCreateRequest, ExpertUpdateRequest } from '@/types/api'

const allLocations = [
  '서울',
  '인천',
  '수원',
  '의정부',
  '광주',
  '대전',
  '청주',
  '대구',
  '창원',
  '울산',
  '부산',
  '전주',
]
const allServices = [
  '대리입찰',
  '권리분석',
  '사건기록열람',
  '등기',
  '명도',
  '임장',
  '예상낙찰가산정',
  '특수물건분석',
  '부동산 관리',
  '올인원서비스',
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
const ExpertsContent = () => {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedExpert, setSelectedExpert] = useState<Partial<Expert> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Pagination and search states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  // --- Fetch Experts with pagination and search ---
  const loadExperts = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchExperts({
        page: page + 1, // API expects 1-based pagination
        limit: rowsPerPage,
        search: searchQuery || undefined,
        location: selectedLocation || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      
      setExperts(result.data)
      setTotalCount(result.total)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch experts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperts()
  }, [page, rowsPerPage, searchQuery, selectedLocation])

  // Search handlers
  const handleSearch = () => {
    setPage(0) // Reset to first page on new search
    loadExperts()
  }

  const handleLocationFilter = (event: SelectChangeEvent<string>) => {
    setSelectedLocation(event.target.value)
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

  // --- Modal & Form Handlers ---
  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedExpert({ name: '', location: '', description: '', services: [] })
    setOpenFormModal(true)
  }

  const handleOpenEditModal = (expert: Expert) => {
    setIsEditing(true)
    setSelectedExpert(expert)
    setOpenFormModal(true)
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
    setSelectedExpert(null)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSelectedExpert((prev) => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event
    setSelectedExpert((prev) => ({
      ...prev,
      services: typeof value === 'string' ? value.split(',') : value,
    }))
  }

  // --- CRUD Action Handlers ---
  const handleSaveExpert = async () => {
    if (!selectedExpert) return

    setError(null)
    try {
      if (isEditing && selectedExpert.id) {
        await updateExpert(selectedExpert as ExpertUpdateRequest)
        setSuccessMessage('Expert updated successfully')
      } else {
        await createExpert(selectedExpert as ExpertCreateRequest)
        setSuccessMessage('Expert created successfully')
      }
      
      await loadExperts() // Refresh the list
      handleCloseFormModal()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save expert')
    }
  }

  const handleDeleteExpert = async () => {
    if (!selectedExpert || !selectedExpert.id) return

    setError(null)
    try {
      await deleteExpert(selectedExpert.id)
      setSuccessMessage('Expert deleted successfully')
      await loadExperts() // Refresh the list
      handleCloseDeleteDialog()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete expert')
    }
  }

  const handleOpenDeleteDialog = (expert: Expert) => {
    setSelectedExpert(expert)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedExpert(null)
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
                Expert Services Management
              </Typography>
              <Button
                variant='contained'
                startIcon={<AddCircleIcon />}
                onClick={handleOpenCreateModal}
              >
                Add New Expert
              </Button>
            </Box>

            {/* Search and Filter Controls */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search experts..."
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
                <InputLabel>Location</InputLabel>
                <Select
                  value={selectedLocation}
                  label="Location"
                  onChange={handleLocationFilter}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {allLocations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center'>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    experts.map((expert) => (
                      <TableRow key={expert.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                bgcolor: 'primary.light',
                              }}
                            >
                              {expert.name.charAt(0)}
                            </Avatar>
                            {expert.name}
                          </Box>
                        </TableCell>
                        <TableCell>{expert.location}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {expert.services.map((service) => (
                              <Chip
                                key={service}
                                label={service}
                                size='small'
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditModal(expert)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenDeleteDialog(expert)}
                          >
                            <DeleteIcon />
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

      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            {isEditing ? 'Edit Expert' : 'Add New Expert'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                name='name'
                label='Expert Name'
                value={selectedExpert?.name || ''}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name='location'
                  value={selectedExpert?.location || ''}
                  label='Location'
                  onChange={handleFormChange as any}
                >
                  {allLocations.map((loc) => (
                    <MenuItem key={loc} value={loc}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name='description'
                label='Description'
                value={selectedExpert?.description || ''}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={selectedExpert?.services || []}
                  onChange={handleMultiSelectChange}
                  input={<OutlinedInput label='Services' />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {allServices.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{ xs: 12 }}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
                mt: 2,
              }}
            >
              <Button variant='outlined' onClick={handleCloseFormModal}>
                Cancel
              </Button>
              <Button variant='contained' onClick={handleSaveExpert}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the expert "{selectedExpert?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteExpert} color='error'>
            Delete
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

export default function ExpertsAdminPanel() {
  return (
    <AdminLayout>
      <ExpertsContent />
    </AdminLayout>
  )
}
