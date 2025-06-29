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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material'

import { updateProfile, changePassword, fetchUserProfile, UpdateProfileState, ChangePasswordState } from '../actions'
import { useAuth } from '@/contexts/AuthContext'

// 왼쪽 네비게이션 메뉴 컴포넌트
const SideNav = ({
  activeView,
  setActiveView,
}: {
  activeView: string
  setActiveView: (view: string) => void
}) => (
  <Paper elevation={0} sx={{ p: 2, width: 240, mr: 4 }}>
    <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 1 }}>
      내 정보
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
      내 정보 수정과 포인트 내역을 확인할 수 있습니다.
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button
        variant={activeView === 'biddingInfo' ? 'contained' : 'text'}
        onClick={() => setActiveView('biddingInfo')}
        sx={{
          justifyContent: 'flex-start',
          py: 1.5,
          px: 2,
          fontSize: '1rem',
          ...(activeView === 'biddingInfo'
            ? {
                backgroundColor: '#e3f2fd',
                color: 'primary.main',
                fontWeight: 'bold',
              }
            : { color: 'text.primary' }),
        }}
      >
        입찰 정보
      </Button>
      <Button
        variant={activeView === 'changePassword' ? 'contained' : 'text'}
        onClick={() => setActiveView('changePassword')}
        sx={{
          justifyContent: 'flex-start',
          py: 1.5,
          px: 2,
          fontSize: '1rem',
          ...(activeView === 'changePassword'
            ? {
                backgroundColor: '#e3f2fd',
                color: 'primary.main',
                fontWeight: 'bold',
              }
            : { color: 'text.primary' }),
        }}
      >
        비밀번호 변경
      </Button>
    </Box>
  </Paper>
)

// 입찰 정보 수정 폼 컴포넌트
const BiddingInfoForm = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    addrDetail: '',
    bank: '',
    accountNumber: '',
    socialSecurityFirst: '',
    socialSecuritySecond: '',
  })

  const [updateState, updateFormAction, updatePending] = useActionState<UpdateProfileState, FormData>(
    updateProfile,
    { error: null, message: null }
  )

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const result = await fetchUserProfile()
        if (result.success && result.data) {
          const profileData = result.data
          setProfile(profileData)
          setFormData({
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
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
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'socialSecurityFirst' || key === 'socialSecuritySecond') return
      form.append(key, value)
    })
    updateFormAction(form)
  }

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{ p: 4, flex: 1 }}>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
        입찰 정보 수정
      </Typography>
      <Alert severity='info' sx={{ mb: 4, backgroundColor: '#e3f2fd' }}>
        안심하세요 :) 대리입찰 외 다른 용도로 입찰인의 정보를 이용하지 않습니다
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
              onChange={(e) => handleInputChange('socialSecurityFirst', e.target.value)}
              placeholder="앞 6자리"
            />
            <Typography component='span'>-</Typography>
            <TextField 
              type='password' 
              sx={{ flex: 1 }} 
              value={formData.socialSecuritySecond}
              onChange={(e) => handleInputChange('socialSecuritySecond', e.target.value)}
              placeholder="뒤 7자리"
            />
          </Box>
          <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
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
                <MenuItem value={'kb'}>국민은행</MenuItem>
                <MenuItem value={'shinhan'}>신한은행</MenuItem>
                <MenuItem value={'woori'}>우리은행</MenuItem>
                <MenuItem value={'hana'}>하나은행</MenuItem>
                <MenuItem value={'nh'}>농협은행</MenuItem>
                <MenuItem value={'ibk'}>기업은행</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              fullWidth 
              placeholder='계좌번호 입력' 
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
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
          <TextField 
            fullWidth 
            placeholder='주소검색' 
            sx={{ mb: 1 }} 
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
          <TextField 
            fullWidth 
            placeholder='상세주소 입력' 
            value={formData.addrDetail}
            onChange={(e) => handleInputChange('addrDetail', e.target.value)}
          />
        </Box>

        <Box>
          <Button
            type="submit"
            variant='contained'
            size='large'
            fullWidth
            disabled={updatePending}
            sx={{ py: 1.5, mt: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {updatePending ? <CircularProgress size={24} /> : '입찰인 정보 수정하기'}
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
    </Paper>
  )
}

// 비밀번호 변경 폼 컴포넌트
const ChangePasswordForm = () => {
  const { user } = useAuth()
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [changeState, changeFormAction, changePending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    { error: null, message: null }
  )

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
    setFormData(prev => ({ ...prev, [field]: value }))
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
    <Paper elevation={0} sx={{ p: 4, flex: 1 }}>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 4 }}>
        비밀번호 변경
      </Typography>

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
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
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
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
          />
        </Box>

        <Box>
          <Button
            type="submit"
            variant='contained'
            size='large'
            fullWidth
            disabled={changePending}
            sx={{ py: 1.5, mt: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {changePending ? <CircularProgress size={24} /> : '비밀번호 수정하기'}
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
    </Paper>
  )
}

// 메인 페이지 컴포넌트
export default function UserInfo() {
  const [activeView, setActiveView] = useState('biddingInfo')

  return (
    <Container maxWidth='lg' sx={{ my: 5 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <SideNav activeView={activeView} setActiveView={setActiveView} />
        <Box sx={{ flex: 1 }}>
          {activeView === 'biddingInfo' && <BiddingInfoForm />}
          {activeView === 'changePassword' && <ChangePasswordForm />}
        </Box>
      </Box>
    </Container>
  )
}
