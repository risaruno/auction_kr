'use client'
import * as React from 'react'
import { useState, useEffect, useActionState, useCallback } from 'react'

// Material-UI 컴포넌트 import
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  CircularProgress,
  Snackbar,
  Modal,
} from '@mui/material'

import { updateProfile, fetchUserProfile, UpdateProfileState } from '../actions'
import { useAuth } from '@/contexts/AuthContext'
import { getBankOptions } from '@/types/bank'
import DaumPostcodeEmbed from 'react-daum-postcode'

const BiddingInfoForm = () => {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )

  const [formData, setFormData] = useState<{
    fullName: string
    phone: string
    zipNo?: string
    address: string
    addrDetail: string
    bank: string // Bank enum value
    accountNumber: string
    socialSecurityFirst: string
    socialSecuritySecond: string
  }>({
    fullName: '',
    phone: '',
    address: '',
    addrDetail: '',
    bank: '',
    accountNumber: '',
    socialSecurityFirst: '',
    socialSecuritySecond: '',
  })

  const handleDaumComplete = useCallback(
    (data: { zonecode: string; address: string }) => {
      setFormData((prev) => ({
        ...prev,
        zipNo: data.zonecode,
        address: data.address,
      }))
      setIsModalOpen(false)
    },
    [setFormData]
  )

  const [updateState, updateFormAction, updatePending] = useActionState<
    UpdateProfileState,
    FormData
  >(updateProfile, { error: null, message: null })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const result = await fetchUserProfile()
        if (result.success && result.data) {
          const profileData = result.data
          setFormData({
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            zipNo: profileData.zip_no || '',
            addrDetail: profileData.addr_detail || '',
            bank: profileData.bank || '',
            accountNumber: profileData.account_number || '',
            socialSecurityFirst: '',
            socialSecuritySecond: '',
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    if (updateState.message) {
      setSnackbarMessage(updateState.message)
      setSnackbarSeverity('success')
      setShowSnackbar(true)
    } else if (updateState.error) {
      setSnackbarMessage(updateState.error)
      setSnackbarSeverity('error')
      setShowSnackbar(true)
    }
  }, [updateState])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'socialSecurityFirst' || key === 'socialSecuritySecond')
        return
      form.append(key, value)
    })
    updateFormAction(form)
  }

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Paper>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ my: 5 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>
        입찰 정보 수정
      </Typography>
      <Alert severity='info' sx={{ mb: 4, backgroundColor: '#e3f2fd' }}>
        대리입찰 외 다른 용도로 입찰인의 정보를 이용하지 않습니다
      </Alert>

      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            주민등록번호
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              sx={{ flex: 1 }}
              value={formData.socialSecurityFirst}
              onChange={(e) =>
                handleInputChange('socialSecurityFirst', e.target.value)
              }
              inputProps={{
                maxLength: 6,
              }}
              placeholder='앞 6자리'
            />
            <Typography component='span'>-</Typography>
            <TextField
              type='password'
              sx={{ flex: 1 }}
              value={formData.socialSecuritySecond}
              onChange={(e) =>
                handleInputChange('socialSecuritySecond', e.target.value)
              }
              inputProps={{
                maxLength: 7,
              }}
              placeholder='뒤 7자리'
            />
          </Box>
          <Typography
            variant='caption'
            color='error'
            sx={{ mt: 1, display: 'block' }}
          >
            주민등록번호는 입찰표 작성에만 사용됩니다.
          </Typography>
        </Box>

        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            보증금 반환계좌
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>은행</InputLabel>
              <Select
                value={formData.bank}
                label='은행'
                onChange={(e) => handleInputChange('bank', e.target.value)}
              >
                {getBankOptions().map((bank) => (
                  <MenuItem key={bank.value} value={bank.value}>
                    {bank.labelKo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              placeholder='계좌번호 입력'
              value={formData.accountNumber}
              onChange={(e) =>
                handleInputChange('accountNumber', e.target.value)
              }
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              입찰자 성명
            </Typography>
            <TextField
              fullWidth
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              연락처
            </Typography>
            <TextField
              fullWidth
              placeholder='연락처 입력'
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </Box>
        </Box>

        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            주소
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Box sx={{ flex: 3 }}>
              <TextField
                fullWidth
                placeholder='주소검색'
                sx={{ mb: 1 }}
                value={formData.address}
                InputProps={{ readOnly: true }}
                onClick={() => setIsModalOpen(true)}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                id='zipNo'
                name='zipNo'
                value={formData.zipNo}
                placeholder='우편번호'
                InputProps={{ readOnly: true }}
                fullWidth
                required
              />
            </Box>
          </Box>
          <TextField
            fullWidth
            placeholder='상세주소 입력'
            value={formData.addrDetail}
            onChange={(e) => handleInputChange('addrDetail', e.target.value)}
            required
          />
        </Box>

        <Box>
          <Button
            type='submit'
            variant='contained'
            size='large'
            fullWidth
            disabled={updatePending}
            sx={{ py: 1.5, mt: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {updatePending ? (
              <CircularProgress size={24} />
            ) : (
              '입찰인 정보 수정하기'
            )}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby='modal-address-search'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 0,
            borderRadius: 1,
          }}
        >
          <DaumPostcodeEmbed
            onComplete={handleDaumComplete}
            style={{ height: '400px' }}
          />
        </Box>
      </Modal>
    </Container>
  )
}

export default function UserInfo() {
  return (
    <Container maxWidth='md' sx={{ my: 5 }}>
      <BiddingInfoForm />
    </Container>
  )
}
