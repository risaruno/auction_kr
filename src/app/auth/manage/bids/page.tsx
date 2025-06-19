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
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material'
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material'
import AdminLayout from '../AdminLayout'

// --- Sample Data ---
const initialBids = {
  newApplication: [
    {
      id: 'bid-001',
      caseNumber: '2025타경1001',
      userName: '김민준',
      bidDate: '2025-07-10',
      expert: null,
      paymentStatus: 'Paid',
      depositStatus: 'Pending',
    },
  ],
  expertAssigned: [
    {
      id: 'bid-002',
      caseNumber: '2025타경1002',
      userName: '이서연',
      bidDate: '2025-07-11',
      expert: '원유호',
      paymentStatus: 'Paid',
      depositStatus: 'Confirmed',
    },
  ],
  docsSubmitted: [
    {
      id: 'bid-003',
      caseNumber: '2025타경1003',
      userName: '박지훈',
      bidDate: '2025-07-12',
      expert: '오은석',
      paymentStatus: 'Paid',
      depositStatus: 'Confirmed',
    },
  ],
  bidComplete: [
    {
      id: 'bid-004',
      caseNumber: '2024타경9999',
      userName: '최유나',
      bidDate: '2025-06-15',
      expert: '김맹겸',
      paymentStatus: 'Paid',
      depositStatus: 'Refunded',
      result: 'Successful',
    },
    {
      id: 'bid-005',
      caseNumber: '2024타경8888',
      userName: '정태현',
      bidDate: '2025-06-14',
      expert: '원유호',
      paymentStatus: 'Paid',
      depositStatus: 'Refunded',
      result: 'Failed',
    },
  ],
}

const allExperts = ['원유호', '오은석', '이규호', '김맹겸']
const bidStatuses = [
  'New Application',
  'Expert Assigned',
  'Docs Submitted',
  'Bid Complete',
]

// --- Main Admin Panel Component ---
const BiddingManagementContent = () => {
  const [bids, setBids] = useState(initialBids)
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)

  const handleViewDetails = (bid: any) => {
    // In a real app, fetch the full data for the bid
    setSelectedBid(bid)
    setIsDetailsDrawerOpen(true)
  }

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false)
    setSelectedBid(null)
  }

  const handleUpdateStatus = (event: any) => {
    const newStatus = event.target.value
    // Here you would implement logic to move the bid card to the correct column
    console.log(`Updating status for bid ${selectedBid.id} to ${newStatus}`)
    setSelectedBid((prev: any) => ({ ...prev, status: newStatus }))
  }

  const handleAssignExpert = (event: any) => {
    const newExpert = event.target.value
    console.log(`Assigning expert ${newExpert} to bid ${selectedBid.id}`)
    setSelectedBid((prev: any) => ({ ...prev, expert: newExpert }))
  }

  const KanbanColumn = ({
    title,
    bids,
    onCardClick,
  }: {
    title: string
    bids: any[]
    onCardClick: (bid: any) => void
  }) => (
    <Paper
      sx={{
        width: 300,
        minWidth: 300,
        p: 1,
        backgroundColor: 'grey.100',
        height: '100%',
      }}
    >
      <Typography variant='h6' sx={{ p: 1, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {bids.map((bid) => (
          <Card
            key={bid.id}
            onClick={() => onCardClick(bid)}
            sx={{ cursor: 'pointer' }}
          >
            <CardContent>
              <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                {bid.caseNumber}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {bid.userName}
              </Typography>
              <Typography variant='caption'>Bid Date: {bid.bidDate}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'grey.50',
          height: '100vh',
          overflowX: 'auto',
        }}
      >
        <Toolbar />
        <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 2 }}>
          Proxy Bidding Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <KanbanColumn
            title='New Application'
            bids={bids.newApplication}
            onCardClick={handleViewDetails}
          />
          <KanbanColumn
            title='Expert Assigned'
            bids={bids.expertAssigned}
            onCardClick={handleViewDetails}
          />
          <KanbanColumn
            title='Docs & Deposit Verified'
            bids={bids.docsSubmitted}
            onCardClick={handleViewDetails}
          />
          <KanbanColumn
            title='Bid Complete'
            bids={bids.bidComplete}
            onCardClick={handleViewDetails}
          />
        </Box>
      </Box>

      {/* --- Bid Details Side Drawer --- */}
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
            <Typography variant='h5'>Bid Details</Typography>
            <IconButton onClick={handleCloseDetailsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedBid && (
            <>
              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                {selectedBid.caseNumber}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                User: {selectedBid.userName}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* --- Status Management --- */}
              <Box mb={3}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Current Status</InputLabel>
                  <Select
                    value={
                      selectedBid.expert ? 'Expert Assigned' : 'New Application'
                    }
                    label='Current Status'
                    onChange={handleUpdateStatus}
                  >
                    {bidStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Assigned Expert</InputLabel>
                  <Select
                    value={selectedBid.expert || ''}
                    label='Assigned Expert'
                    onChange={handleAssignExpert}
                  >
                    <MenuItem value=''>
                      <em>Assign an expert...</em>
                    </MenuItem>
                    {allExperts.map((expert) => (
                      <MenuItem key={expert} value={expert}>
                        {expert}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* --- Payment & Deposit --- */}
              <Box mb={3}>
                <Typography variant='h6'>Financials</Typography>
                <Chip
                  label={`Service Fee: ${selectedBid.paymentStatus}`}
                  color={
                    selectedBid.paymentStatus === 'Paid' ? 'success' : 'warning'
                  }
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Deposit: ${selectedBid.depositStatus}`}
                  color={
                    selectedBid.depositStatus === 'Confirmed'
                      ? 'success'
                      : selectedBid.depositStatus === 'Refunded'
                      ? 'info'
                      : 'warning'
                  }
                />
                <Button
                  size='small'
                  variant='contained'
                  sx={{ display: 'block', mt: 2 }}
                >
                  Confirm Deposit Received
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* --- Document Management --- */}
              <Box>
                <Typography variant='h6'>Documents</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    my: 1,
                  }}
                >
                  <Typography>User Signature Certificate</Typography>
                  <Button size='small' startIcon={<DownloadIcon />}>
                    Download
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    my: 1,
                  }}
                >
                  <Typography>Official Bid Result</Typography>
                  <Button
                    size='small'
                    component='label'
                    startIcon={<UploadIcon />}
                  >
                    Upload
                    <input type='file' hidden />
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  label='Bid Result Memo (e.g., successful bid amount, notes)'
                  multiline
                  rows={3}
                  margin='normal'
                />
                <Button variant='contained' sx={{ mt: 1 }}>
                  Save Result
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  )
}

export default function BiddingManagementPanel() {
  return (
    <AdminLayout>
      <BiddingManagementContent />
    </AdminLayout>
  )
}
