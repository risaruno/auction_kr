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
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'

// Define a proper interface for the FAQ data
interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

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
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<Partial<FAQ> | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // --- Fetch FAQs on Load ---
  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/faqs')
      if (!response.ok) throw new Error('Failed to fetch FAQs')
      const data = await response.json()
      setFaqs(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

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

  // --- CRUD API Handlers ---
  const handleSaveFaq = async () => {
    if (!selectedFaq) return
    const method = isEditing ? 'PUT' : 'POST'
    try {
      const response = await fetch('/api/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedFaq),
      })
      if (!response.ok) throw new Error('Failed to save FAQ')
      await fetchFaqs() // Refresh the list with the latest data
    } catch (error) {
      console.error(error)
    } finally {
      handleCloseFormModal()
    }
  }

  const handleDeleteFaq = async () => {
    if (!selectedFaq?.id) return
    try {
      const response = await fetch('/api/faqs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedFaq.id }),
      })
      if (!response.ok) throw new Error('Failed to delete FAQ')
      // Update UI optimistically
      setFaqs((prev) => prev.filter((faq) => faq.id !== selectedFaq.id))
    } catch (error) {
      console.error(error)
    } finally {
      handleCloseDeleteDialog()
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
