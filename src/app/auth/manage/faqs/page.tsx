'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Toolbar,
  Typography,
  CssBaseline,
  Card,
  CardContent,
  Button,
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'
import { 
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq 
} from '@/app/api/faq/actions'
import { FAQ, FAQCreateRequest, FAQUpdateRequest } from '@/types/api'

const faqTypes = ['전문가 서비스', '기타', '결제', '계정']

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 700,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
}

// --- Main Admin Panel Content ---
const FAQManagementContent = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<Partial<FAQ> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Pagination and search states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // --- Fetch FAQs with pagination and search ---
  const loadFaqs = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFaqs({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      
      setFaqs(result.data)
      setTotalCount(result.total)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch FAQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
  }, [page, rowsPerPage, searchQuery, selectedCategory])

  // --- Modal & Form Handlers ---
  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedFaq({ question: '', answer: '', category: '기타' })
    setOpenFormModal(true)
  }

  const handleOpenEditModal = (faq: FAQ) => {
    setIsEditing(true)
    setSelectedFaq(faq)
    setOpenFormModal(true)
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
    setSelectedFaq(null)
  }

  const handleFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target
    if (name) {
      setSelectedFaq((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  // --- CRUD Action Handlers ---
  const handleSaveFaq = async () => {
    if (!selectedFaq) return
    
    setError(null)
    try {
      if (isEditing && selectedFaq.id) {
        await updateFaq(selectedFaq as FAQUpdateRequest)
        setSuccessMessage('FAQ updated successfully')
      } else {
        await createFaq(selectedFaq as FAQCreateRequest)
        setSuccessMessage('FAQ created successfully')
      }

      await loadFaqs() // Refresh the list
      handleCloseFormModal()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save FAQ')
    }
  }

  const handleDeleteFaq = async () => {
    if (!selectedFaq?.id) return
    
    setError(null)
    try {
      await deleteFaq(selectedFaq.id)
      setSuccessMessage('FAQ deleted successfully')
      await loadFaqs() // Refresh the list
      handleCloseDeleteDialog()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete FAQ')
    }
  }

  const handleOpenDeleteDialog = (faq: FAQ) => {
    setSelectedFaq(faq)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedFaq(null)
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
              <Typography variant='h5'>FAQ Management</Typography>
              <Button
                variant='contained'
                startIcon={<AddCircleIcon />}
                onClick={handleOpenCreateModal}
              >
                Add New FAQ
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {faqs.map((faq) => (
                  <Accordion key={faq.id} sx={{ my: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Typography
                          sx={{ flexShrink: 0, color: 'text.secondary', mr: 2 }}
                        >
                          [{faq.category}]
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {faq.question}
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditModal(faq)
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDeleteDialog(faq)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* --- Create/Update Form Modal --- */}
      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <TextField
            name='question'
            label='Question (Title)'
            value={selectedFaq?.question || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name='category'
              value={selectedFaq?.category || '기타'}
              label='Category'
              onChange={handleFormChange as any}
            >
              {faqTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name='answer'
            label='Answer (Content)'
            value={selectedFaq?.answer || ''}
            onChange={handleFormChange}
            multiline
            rows={8}
            fullWidth
          />

          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}
          >
            <Button variant='outlined' onClick={handleCloseFormModal}>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleSaveFaq}>
              Save FAQ
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the FAQ: "{selectedFaq?.question}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteFaq} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Wrapper component to include the main layout
export default function FAQManagementPanel() {
  return (
    <AdminLayout>
      <FAQManagementContent />
    </AdminLayout>
  )
}
