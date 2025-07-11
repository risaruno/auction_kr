'use client'
import * as React from 'react'
import { useState, useEffect, useActionState } from 'react'

// Material-UI 컴포넌트 import
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material'

import { changePassword, ChangePasswordState } from '../actions'
import { useAuth } from '@/contexts/AuthContext'

// 비밀번호 변경 폼 컴포넌트
const ChangePasswordForm = () => {
  const { user } = useAuth()
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [changeState, changeFormAction, changePending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePassword, { error: null, message: null })

  useEffect(() => {
    if (changeState.message) {
      setSnackbarMessage(changeState.message)
      setSnackbarSeverity('success')
      setShowSnackbar(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else if (changeState.error) {
      setSnackbarMessage(changeState.error)
      setSnackbarSeverity('error')
      setShowSnackbar(true)
    }
  }, [changeState])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbarMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      setSnackbarSeverity('error')
      setShowSnackbar(true)
      return
    }

    const form = new FormData()
    form.append('currentPassword', formData.currentPassword)
    form.append('newPassword', formData.newPassword)
    form.append('confirmPassword', formData.confirmPassword)
    changeFormAction(form)
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
          <Typography variant='h5'>비밀번호 변경</Typography>
        </Box>

        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              이메일
            </Typography>
            <TextField
              fullWidth
              value={user?.email || ''}
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Box>

          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              기존 비밀번호
            </Typography>
            <TextField
              type='password'
              fullWidth
              value={formData.currentPassword}
              onChange={(e) =>
                handleInputChange('currentPassword', e.target.value)
              }
              required
            />
          </Box>

          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              새 비밀번호
            </Typography>
            <TextField
              type='password'
              fullWidth
              placeholder='새 비밀번호 (영문, 숫자, 특수문자 8-15자)'
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              required
            />
          </Box>

          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              새 비밀번호 확인
            </Typography>
            <TextField
              type='password'
              fullWidth
              placeholder='새 비밀번호 확인'
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              required
            />
          </Box>

          <Box>
            <Button
              type='submit'
              variant='contained'
              size='large'
              fullWidth
              disabled={changePending}
              sx={{ py: 1.5, mt: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              {changePending ? (
                <CircularProgress size={24} />
              ) : (
                '비밀번호 수정하기'
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
      </Box>
    </>
  )
}

// 메인 페이지 컴포넌트
export default function UserProfile() {
  return (
    <Container maxWidth='md' sx={{ my: 5 }}>
      <ChangePasswordForm />
    </Container>
  )
}
