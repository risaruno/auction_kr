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
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Gavel as GavelIcon,
  QuestionAnswer as QuestionAnswerIcon,
  LiveHelp as LiveHelpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'

const drawerWidth = 240

// --- Sample Data (from your FAQ component) ---
const initialFaqs = [
  {
    id: 'faq-1',
    title: '서비스 이용료',
    type: '전문가 서비스',
    content:
      '전문가가 서비스에 게시한 이용료를 확인해 주세요.\n체르토는 전문가 서비스 이용료에 일체 관여 하지 않으며, 전문가 서비스의 이용료는 의뢰인이 전문가에게 직접 결제합니다.\n(주)체르토는 전문가 서비스에서 일체의 수수료를 받지 않습니다.',
  },
  {
    id: 'faq-2',
    title: '전문가는 믿을수 있나요?',
    type: '전문가 서비스',
    content:
      '체르토는 안전하고 신뢰할 수 있는 거래 환경을 제공하기 위해 노력하고 있습니다.\n전문가의 자격을 입증하는 증빙 자료를 검토하고, 공인중개사협회 또는 대한법무사협회를 통해 자격 상실여부등을 확인 후 서비스 승인절차를 진행합니다.',
  },
  {
    id: 'faq-3',
    title: '결제는 되었는데 신청 내역이 보이지 않아요',
    type: '기타',
    content:
      '신청 내역이 확인이 안되는 경우는 두가지 경우입니다.\n\n📌 입찰 접수 알림을 받은 경우\n가입 계정을 확인해주세요\n\n📌 입찰 접수 알림을 못 받은 경우\n지연 결제로 인해 접수 정보가 삭제된 경우로\n①사건번호,\n②법원명\n③의뢰인 성함\n상담톡에 남겨주시면 확인 후 처리도와드리겠습니다.',
  },
]

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

// --- Main Admin Panel Component ---
const FAQManagementContent = () => {
  const [faqs, setFaqs] = useState(initialFaqs)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // --- Handlers for Form Modal ---
  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedFaq({ title: '', type: '기타', content: '' })
    setOpenFormModal(true)
  }

  const handleOpenEditModal = (faq: any) => {
    setIsEditing(true)
    setSelectedFaq(faq)
    setOpenFormModal(true)
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
    setSelectedFaq(null)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSelectedFaq((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSaveFaq = () => {
    if (isEditing) {
      // Update logic
      setFaqs(
        faqs.map((faq) => (faq.id === selectedFaq.id ? selectedFaq : faq))
      )
    } else {
      // Create logic
      const newFaq = { ...selectedFaq, id: `faq-${Date.now()}` }
      setFaqs([...faqs, newFaq])
    }
    handleCloseFormModal()
  }

  // --- Handlers for Delete Dialog ---
  const handleOpenDeleteDialog = (faq: any) => {
    setSelectedFaq(faq)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedFaq(null)
  }

  const handleDeleteFaq = () => {
    setFaqs(faqs.filter((faq) => faq.id !== selectedFaq.id))
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
                FAQ Management
              </Typography>
              <Button
                variant='contained'
                startIcon={<AddCircleIcon />}
                onClick={handleOpenCreateModal}
              >
                Add New FAQ
              </Button>
            </Box>

            {/* View (Read) - Accordion List */}
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
                        [{faq.type}]
                      </Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {faq.title}
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
                      {faq.content}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* --- Create/Update Form Modal --- */}
      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' component='h2' sx={{ mb: 2 }}>
            {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <TextField
            name='title'
            label='Question (Title)'
            value={selectedFaq?.title || ''}
            onChange={handleFormChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category (Type)</InputLabel>
            <Select
              name='type'
              value={selectedFaq?.type || '기타'}
              label='Category (Type)'
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
            name='content'
            label='Answer (Content)'
            value={selectedFaq?.content || ''}
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
            Are you sure you want to delete the FAQ: "{selectedFaq?.title}"?
            This action cannot be undone.
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

export default function FAQManagementPanel() {
  return (
    <AdminLayout>
      <FAQManagementContent />
    </AdminLayout>
  )
}
