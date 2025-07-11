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
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import {
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '@/app/api/faq/actions'
import { FAQ, FAQCreateRequest, FAQUpdateRequest } from '@/types/api'

const faqTypes = ['전문가 서비스', '기타', '결제', '계정']

const modalStyle = {
  position: 'absolute',
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

  // --- Fetch FAQs with pagination and search ---
  const loadFaqs = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFaqs({
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })

      setFaqs(result.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch FAQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
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
      setSelectedFaq((prev) => prev ? { ...prev, [name]: value } : null)
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

  // Close notifications
  const handleCloseError = () => {
    setError(null)
  }

  const handleCloseSuccess = () => {
    setSuccessMessage(null)
  }

  return (
    <>
      <Box component='main'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h5'>자주하는 질문 관리</Typography>
          <Button
            variant='contained'
            startIcon={<AddCircleIcon />}
            onClick={handleOpenCreateModal}
          >
            새 항목 추가
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
      </Box>

      {/* --- Create/Update Form Modal --- */}
      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            {isEditing ? '항목 수정' : '새 항목 추가'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <TextField
            name='question'
            label='질문 (제목)'
            value={selectedFaq?.question || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>카테고리</InputLabel>
            <Select
              name='category'
              value={selectedFaq?.category || '기타'}
              label='카테고리'
              onChange={(event) => handleFormChange({ target: { name: 'category', value: event.target.value } } as React.ChangeEvent<HTMLInputElement>)}
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
            label='답변 (내용)'
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
              취소
            </Button>
            <Button variant='contained' onClick={handleSaveFaq}>
              저장
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &quot;{selectedFaq?.question}&quot; 항목을 삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>취소</Button>
          <Button onClick={handleDeleteFaq} color='error'>
            삭제
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
    </>
  )
}

// Wrapper component to include the main layout
export default function FAQManagementPanel() {
  return (
    <>
      <FAQManagementContent />
    </>
  )
}
