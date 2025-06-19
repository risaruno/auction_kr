'use client'
import React, { useState } from 'react'
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
  OutlinedInput,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Grid, // Make sure Grid is imported if not already
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'

// --- Sample Data ---
const initialExperts = [
  {
    id: 1,
    name: '원유호 공인중개사',
    location: '인천',
    description:
      '경매 경력 10년 낙찰횟수 다수. 권리분석 심가 / 다가구 / 법정지상권/유치권/지분경매 등',
    photo: '',
    services: ['권리분석', '임장', '예상낙찰가산정'],
  },
  {
    id: 2,
    name: '오은석 공인중개사',
    location: '광주',
    description:
      '개업공인중개사로서 고객의 니즈를 이해하고 니즈에 맞는 결과를 만들어왔습니다.',
    photo: '',
    services: ['권리분석', '사건기록열람', '부동산 관리'],
  },
]

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
  const [experts, setExperts] = useState(initialExperts)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedExpert, setSelectedExpert] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // --- Handlers for Form Modal ---
  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedExpert({
      name: '',
      location: '',
      description: '',
      photo: '',
      services: [],
    })
    setOpenFormModal(true)
  }

  const handleOpenEditModal = (expert: any) => {
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
    setSelectedExpert((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event
    setSelectedExpert((prev: any) => ({
      ...prev,
      services: typeof value === 'string' ? value.split(',') : value,
    }))
  }

  const handleSaveExpert = () => {
    if (isEditing) {
      // Update logic
      setExperts(
        experts.map((exp) =>
          exp.id === selectedExpert.id ? selectedExpert : exp
        )
      )
    } else {
      // Create logic
      const newExpert = { ...selectedExpert, id: Date.now() } // Simple ID generation
      setExperts([...experts, newExpert])
    }
    handleCloseFormModal()
  }

  // --- Handlers for Delete Dialog ---
  const handleOpenDeleteDialog = (expert: any) => {
    setSelectedExpert(expert)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedExpert(null)
  }

  const handleDeleteExpert = () => {
    setExperts(experts.filter((exp) => exp.id !== selectedExpert.id))
    handleCloseDeleteDialog()
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

            {/* View (Read) - Data Table */}
            <TableContainer component={Paper} variant='outlined'>
              <Table sx={{ minWidth: 650 }} aria-label='experts table'>
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {experts.map((expert) => (
                    <TableRow
                      key={expert.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component='th' scope='row'>
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
                            <Chip key={service} label={service} size='small' />
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* --- Create/Update Form Modal --- */}
      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            {isEditing ? 'Edit Expert' : 'Add New Expert'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {/* Grid components updated to use size prop */}
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

      {/* --- Delete Confirmation Dialog --- */}
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
