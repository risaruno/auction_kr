import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Modal,
  FormLabel,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  styled,
  IconButton,
  Divider,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DaumPostcodeEmbed from 'react-daum-postcode'
import { FormData, ApplicationType } from '@/interfaces/FormData'
import { sendOtp, verifyOtp } from '@/utils/auth/otp'
import { getBankOptions } from '@/types/bank'
import { fetchUserProfile } from '@/app/auth/user/actions'

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

interface InputFormProps {
  formData: FormData
  handleFormChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } }
  ) => void
  updateFormData: (field: string, value: unknown) => void
  validationErrors?: Array<{ field: string; message: string }>
}

const applicationTypes: { value: ApplicationType; label: string }[] = [
  { value: 'personal', label: '개인 입찰' },
  { value: 'company', label: '법인 입찰' },
  { value: 'group', label: '공동 입찰' },
]

// Utility function to extract numeric value from formatted currency string
export const getNumericBidAmount = (formattedBidAmt: string): number => {
  return parseInt(formattedBidAmt.replace(/[^\d]/g, '')) || 0
}

export default function InputForm({
  formData,
  handleFormChange,
  updateFormData,
  validationErrors = [],
}: InputFormProps) {

  // Local state for UI interactions
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useProfileInfo, setUseProfileInfo] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  // Memoized error lookup function for performance
  const getFieldError = useCallback(
    (fieldName: string) => {
      const error = validationErrors.find((error) => error.field === fieldName)?.message
      // Debug logging
      if (fieldName === 'phoneNumber' && error) {
        console.log('Phone validation error found:', error)
      }
      return error
    },
    [validationErrors]
  )

  // Optimized change handlers with useCallback
  const handleApplicationTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFormData('applicationType', event.target.value as ApplicationType)
    },
    [updateFormData]
  )

  const handlePhoneNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.replace(/\D/g, '')
      if (value.length <= 11) {
        handleFormChange({
          target: { name: 'phoneNumber', value },
        })
      }
    },
    [handleFormChange]
  )

  const handleResidentIdChange = useCallback(
    (field: 'residentId1' | 'residentId2') =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/\D/g, '')
        const maxLength = field === 'residentId1' ? 6 : 7
        if (value.length <= maxLength) {
          handleFormChange({
            target: { name: field, value },
          })
        }
      },
    [handleFormChange]
  )

  const handleBusinessNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.replace(/\D/g, '')
      if (value.length <= 10) {
        handleFormChange({
          target: { name: 'businessNumber', value },
        })
      }
    },
    [handleFormChange]
  )

  const handleBidAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Remove all non-numeric characters
      const numericValue = event.target.value.replace(/[^\d]/g, '')

      // Convert to number and format with commas
      if (numericValue === '') {
        handleFormChange({
          target: { name: 'bidAmt', value: '' },
        })
      } else {
        const formattedValue = parseInt(numericValue).toLocaleString()
        handleFormChange({
          target: { name: 'bidAmt', value: formattedValue },
        })
      }
    },
    [handleFormChange]
  )

  const handleDaumComplete = useCallback(
    (data: { zonecode: string; address: string }) => {
      const addressField =
        formData.applicationType === 'company' ? 'company' : ''
      updateFormData(`${addressField}zipNo`, data.zonecode)
      updateFormData(`${addressField}roadAddr`, data.address)
      setIsModalOpen(false)
    },
    [formData.applicationType, updateFormData]
  )

  // Handle auto-fill from user profile
  const handleUseProfileInfo = useCallback(async (checked: boolean) => {
    setUseProfileInfo(checked)
    
    if (checked) {
      setProfileLoading(true)
      setError(null)
      
      try {
        const result = await fetchUserProfile()
        
        if (result.success && result.data) {
          console.log('Fetched user profile:', result.data)
          const profile = result.data
          
          // Auto-fill personal information
          if (profile.full_name) {
            updateFormData('bidderName', profile.full_name)
          }
          if (profile.phone) {
            updateFormData('phoneNumber', profile.phone)
          }
          if (profile.zip_no) {
            updateFormData('zipNo', profile.zip_no)
          }
          if (profile.address) {
            updateFormData('roadAddr', profile.address)
          }
          if (profile.addr_detail) {
            updateFormData('addrDetail', profile.addr_detail)
          }
          if (profile.bank) {
            updateFormData('bank', profile.bank)
          }
          if (profile.account_number) {
            updateFormData('accountNumber', profile.account_number)
          }
        } else {
          setError(result.error || '프로필 정보를 불러오는데 실패했습니다.')
          setUseProfileInfo(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로필 정보를 불러오는 중 오류가 발생했습니다.')
        setUseProfileInfo(false)
      } finally {
        setProfileLoading(false)
      }
    }
  }, [updateFormData])

  // OTP handling
  const handleSendOtp = useCallback(async () => {
    const phoneToVerify =
      formData.applicationType === 'company'
        ? formData.companyPhoneNumber
        : formData.phoneNumber

    if (!phoneToVerify || phoneToVerify.length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await sendOtp(phoneToVerify)
      if (result.error) {
        throw new Error(result.error)
      }
      setIsOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [
    formData.phoneNumber,
    formData.companyPhoneNumber,
    formData.applicationType,
  ])

  const handleVerifyOtp = useCallback(async () => {
    const phoneToVerify =
      formData.applicationType === 'company'
        ? formData.companyPhoneNumber
        : formData.phoneNumber

    setLoading(true)
    setError(null)
    try {
      const result = await verifyOtp(phoneToVerify!, otp)
      if (result.error) {
        throw new Error(result.error)
      }
      updateFormData('isPhoneVerified', true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [
    formData.phoneNumber,
    formData.companyPhoneNumber,
    formData.applicationType,
    otp,
    updateFormData,
  ])

  // Group member management
  const addGroupMember = useCallback(() => {
    const currentMembers = formData.groupMembers || []
    const newMember = { name: '', residentId1: '', residentId2: '' }
    updateFormData('groupMembers', [...currentMembers, newMember])
    updateFormData('groupMemberCount', currentMembers.length + 1)
  }, [formData.groupMembers, updateFormData])

  const removeGroupMember = useCallback(
    (index: number) => {
      const currentMembers = formData.groupMembers || []
      const newMembers = currentMembers.filter((_, i) => i !== index)
      updateFormData('groupMembers', newMembers)
      updateFormData('groupMemberCount', newMembers.length)
    },
    [formData.groupMembers, updateFormData]
  )

  const updateGroupMember = useCallback(
    (index: number, field: string, value: string) => {
      const currentMembers = formData.groupMembers || []
      const newMembers = [...currentMembers]
      if (field === 'residentId1' || field === 'residentId2') {
        value = value.replace(/\D/g, '')
        const maxLength = field === 'residentId1' ? 6 : 7
        if (value.length > maxLength) return
      }
      newMembers[index] = { ...newMembers[index], [field]: value }
      updateFormData('groupMembers', newMembers)
    },
    [formData.groupMembers, updateFormData]
  )

  // Memoized components for better performance
  const CaseDisplay = useMemo(() => {
    if (!formData.caseResult?.data) return null

    return (
      <Grid container spacing={2} size={{ xs: 12 }}>
        <Grid container size={{ xs: 12 }}>
          <Card
            sx={{
              margin: '0 auto',
              display: 'flex',
              width: '100%',
              flexDirection: { xs: 'column', sm: 'column', md: 'row' },
              backgroundColor: '#fff',
            }}
          >
            <CardMedia
              component='img'
              image={`data:image/jpeg;base64,${formData.caseResult.data.picFile}`}
              alt='Case Image'
              sx={{
                flex: 1,
                objectFit: 'cover',
                height: 250,
                maxHeight: { xs: 250, sm: 300, md: 350 },
                width: { xs: '100%', sm: 'auto' },
              }}
            />
            <CardContent sx={{ flex: 2, p: 3 }}>
              <Typography variant='h6'>
                {formData.caseResult.data.printCaseNumber}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {formData.caseResult.data.courtName}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant='body2'>
                  <strong>감정가:</strong>{' '}
                  {formData.caseResult.data.evaluationAmt?.toLocaleString()}원
                </Typography>
                <Typography variant='body2'>
                  <strong>최저입찰가:</strong>{' '}
                  {formData.caseResult.data.lowestBidAmt?.toLocaleString()}원
                </Typography>
                <Typography variant='body2'>
                  <strong>입찰보증금:</strong>{' '}
                  {formData.caseResult.data.depositAmt?.toLocaleString()}원
                </Typography>
                <Typography variant='body2'>
                  <strong>매각기일:</strong> {formData.caseResult.data.bidDate}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }, [formData.caseResult])

  return (
    <>
      {CaseDisplay}

      <Grid
        container
        spacing={3}
        sx={{
          padding: 2,
          backgroundColor: '#fff',
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          mt: 2,
        }}
      >
        {/* Application Type Selection */}
        <Grid container spacing={2} size={{ xs: 12 }}>
          <FormGrid size={{ xs: 12 }}>
            <Typography variant='h5' fontWeight='bold'>
              입찰 정보를 입력해주세요
            </Typography>
          </FormGrid>

          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor='applicationType'>신청 유형 *</FormLabel>
            <TextField
              id='applicationType'
              name='applicationType'
              select
              value={formData.applicationType}
              onChange={handleApplicationTypeChange}
              fullWidth
            >
              {applicationTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FormGrid>
        </Grid>

        {/* Bid Amount Section */}
        <Grid container spacing={2} size={{ xs: 12 }}>
          <FormGrid size={{ xs: 12 }}>
            <Typography variant='h6'>
              입찰 정보
            </Typography>
          </FormGrid>

          <FormGrid size={{ xs: 12 }}>
            <Alert severity="info">입찰가는 대리인에게만 공개됩니다.</Alert>
          </FormGrid>

          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor='bidAmt'>입찰가 *</FormLabel>
            <TextField
              id='bidAmt'
              name='bidAmt'
              value={formData.bidAmt}
              onChange={handleBidAmountChange}
              placeholder='입찰가를 입력해주세요'
              error={!!getFieldError('bidAmt')}
              helperText={
                getFieldError('bidAmt') ||
                `최저입찰가: ${formData.caseResult?.data?.lowestBidAmt?.toLocaleString()}원`
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>원</InputAdornment>
                ),
              }}
              fullWidth
            />
          </FormGrid>
        </Grid>

        {/* Personal Application Fields */}
        {formData.applicationType === 'personal' && (
          <Grid container spacing={2} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography variant='h6'>
                  입찰차 정보를 입력해주세요.
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useProfileInfo}
                      onChange={(e) => handleUseProfileInfo(e.target.checked)}
                      disabled={profileLoading}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {profileLoading && <CircularProgress size={16} />}
                      <Typography variant="body2">
                        사용자 정보와 동일
                      </Typography>
                    </Box>
                  }
                />
              </Box>

            <FormGrid size={{ xs: 12 }}>
              <Alert severity="info">입찰자 정보는 입찰표에 그대로 반영되므로, 정확하게 기재해주세요.</Alert>
            </FormGrid>
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor='bidderName'>이름 *</FormLabel>
              <TextField
                id='bidderName'
                name='bidderName'
                value={formData.bidderName}
                onChange={handleFormChange}
                placeholder='홍길동'
                error={!!getFieldError('bidderName')}
                helperText={getFieldError('bidderName')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 6, md: 3 }}>
              <FormLabel htmlFor='residentId1'>주민등록번호 앞자리 *</FormLabel>
              <TextField
                id='residentId1'
                name='residentId1'
                value={formData.residentId1}
                onChange={handleResidentIdChange('residentId1')}
                placeholder='123456'
                inputProps={{ maxLength: 6 }}
                error={!!getFieldError('residentId')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 6, md: 3 }}>
              <FormLabel htmlFor='residentId2'>주민등록번호 뒷자리 *</FormLabel>
              <TextField
                id='residentId2'
                name='residentId2'
                type='password'
                value={formData.residentId2}
                onChange={handleResidentIdChange('residentId2')}
                placeholder='*******'
                inputProps={{ maxLength: 7 }}
                error={!!getFieldError('residentId')}
                helperText={getFieldError('residentId')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 8 }}>
              <FormLabel htmlFor='phoneNumber'>휴대폰 번호 *</FormLabel>
              <TextField
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder='01012345678'
                error={!!getFieldError('phoneNumber') || !!getFieldError('phoneVerification')}
                helperText={getFieldError('phoneNumber') || getFieldError('phoneVerification')}
                inputProps={{
                  'data-error': !!getFieldError('phoneNumber') || !!getFieldError('phoneVerification')
                }}
                InputProps={{
                  endAdornment: formData.isPhoneVerified ? (
                    <InputAdornment position='end'>
                      <CheckCircleIcon color='success' />
                    </InputAdornment>
                  ) : undefined,
                }}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 4 }}>
              <FormLabel sx={{ display: { xs: 'none', md: 'block' } }}>&nbsp;</FormLabel>
              <Button
                variant='outlined'
                onClick={handleSendOtp}
                disabled={
                  loading || 
                  formData.isPhoneVerified || 
                  !formData.phoneNumber ||
                  !!getFieldError('phoneNumber')
                }
                fullWidth
                sx={{ height: '52.13px' }}
              >
                {loading ? <CircularProgress size={20} /> : '인증번호 발송'}
              </Button>
            </FormGrid>

            {isOtpSent && !formData.isPhoneVerified && (
              <>
                <FormGrid size={{ xs: 12, md: 8 }}>
                  <FormLabel htmlFor='otp'>인증번호</FormLabel>
                  <TextField
                    id='otp'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder='인증번호 6자리'
                    inputProps={{ maxLength: 6 }}
                    fullWidth
                  />
                </FormGrid>

                <FormGrid size={{ xs: 12, md: 4 }}>
                  <FormLabel>&nbsp;</FormLabel>
                  <Button
                    variant='outlined'
                    onClick={handleVerifyOtp}
                    disabled={loading || !otp}
                    fullWidth
                    sx={{ height: '52.13px' }}
                  >
                    {loading ? <CircularProgress size={20} /> : '인증확인'}
                  </Button>
                </FormGrid>
              </>
            )}
          </Grid>
        )}

        {/* Company Application Fields */}
        {formData.applicationType === 'company' && (
          <Grid container spacing={2} size={{ xs: 12 }} mt={2}>
            <FormGrid size={{ xs: 12 }}>
              <Typography variant='h6'>
                법인 정보
              </Typography>
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor='companyName'>회사명 *</FormLabel>
              <TextField
                id='companyName'
                name='companyName'
                value={formData.companyName || ''}
                onChange={handleFormChange}
                placeholder='주식회사 OO'
                error={!!getFieldError('companyName')}
                helperText={getFieldError('companyName')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor='businessNumber'>사업자등록번호 *</FormLabel>
              <TextField
                id='businessNumber'
                name='businessNumber'
                value={formData.businessNumber || ''}
                onChange={handleBusinessNumberChange}
                placeholder='1234567890'
                inputProps={{ maxLength: 10 }}
                error={!!getFieldError('businessNumber')}
                helperText={getFieldError('businessNumber')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor='representativeName'>대표자명 *</FormLabel>
              <TextField
                id='representativeName'
                name='representativeName'
                value={formData.representativeName || ''}
                onChange={handleFormChange}
                placeholder='홍길동'
                error={!!getFieldError('representativeName')}
                helperText={getFieldError('representativeName')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor='companyPhoneNumber'>
                회사 전화번호 *
              </FormLabel>
              <TextField
                id='companyPhoneNumber'
                name='companyPhoneNumber'
                value={formData.companyPhoneNumber || ''}
                onChange={handleFormChange}
                placeholder='02-1234-5678'
                error={!!getFieldError('companyPhoneNumber')}
                helperText={getFieldError('companyPhoneNumber')}
                fullWidth
              />
            </FormGrid>
          </Grid>
        )}

        {/* Group Application Fields */}
        {formData.applicationType === 'group' && (
          <Grid container spacing={2} size={{ xs: 12 }} mt={2}>
            <FormGrid size={{ xs: 12 }}>
              <Typography variant='h6'>
                공동입찰 대표자 정보
              </Typography>
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor='groupRepresentativeName'>
                대표자명 *
              </FormLabel>
              <TextField
                id='groupRepresentativeName'
                name='groupRepresentativeName'
                value={formData.groupRepresentativeName || ''}
                onChange={handleFormChange}
                placeholder='홍길동'
                error={!!getFieldError('groupRepresentativeName')}
                helperText={getFieldError('groupRepresentativeName')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 6, md: 3 }}>
              <FormLabel htmlFor='groupRepresentativeId1'>
                주민등록번호 앞자리 *
              </FormLabel>
              <TextField
                id='groupRepresentativeId1'
                name='groupRepresentativeId1'
                value={formData.groupRepresentativeId1 || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 6) {
                    handleFormChange({
                      target: { name: 'groupRepresentativeId1', value },
                    })
                  }
                }}
                placeholder='123456'
                inputProps={{ maxLength: 6 }}
                error={!!getFieldError('groupRepresentativeId')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 6, md: 3 }}>
              <FormLabel htmlFor='groupRepresentativeId2'>
                주민등록번호 뒷자리 *
              </FormLabel>
              <TextField
                id='groupRepresentativeId2'
                name='groupRepresentativeId2'
                type='password'
                value={formData.groupRepresentativeId2 || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 7) {
                    handleFormChange({
                      target: { name: 'groupRepresentativeId2', value },
                    })
                  }
                }}
                placeholder='1234567'
                inputProps={{ maxLength: 7 }}
                error={!!getFieldError('groupRepresentativeId')}
                helperText={getFieldError('groupRepresentativeId')}
                fullWidth
              />
            </FormGrid>

            <FormGrid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant='h6'>
                공동입찰자 정보
              </Typography>
            </FormGrid>

            {(formData.groupMembers || []).map((member, index) => (
              <React.Fragment key={index}>
                <FormGrid size={{ xs: 12, md: 4 }}>
                  <FormLabel>입찰자 {index + 1} 이름</FormLabel>
                  <TextField
                    value={member.name}
                    onChange={(e) =>
                      updateGroupMember(index, 'name', e.target.value)
                    }
                    placeholder='홍길동'
                    fullWidth
                  />
                </FormGrid>

                <FormGrid size={{ xs: 5, md: 3 }}>
                  <FormLabel>주민등록번호 앞자리</FormLabel>
                  <TextField
                    value={member.residentId1}
                    onChange={(e) =>
                      updateGroupMember(index, 'residentId1', e.target.value)
                    }
                    placeholder='123456'
                    inputProps={{ maxLength: 6 }}
                    fullWidth
                  />
                </FormGrid>

                <FormGrid size={{ xs: 5, md: 3 }}>
                  <FormLabel>주민등록번호 뒷자리</FormLabel>
                  <TextField
                    type='password'
                    value={member.residentId2}
                    onChange={(e) =>
                      updateGroupMember(index, 'residentId2', e.target.value)
                    }
                    placeholder='1234567'
                    inputProps={{ maxLength: 7 }}
                    fullWidth
                  />
                </FormGrid>

                <FormGrid size={{ xs: 2, md: 2 }}>
                  <FormLabel>&nbsp;</FormLabel>
                  <IconButton
                    onClick={() => removeGroupMember(index)}
                    color='error'
                    disabled={(formData.groupMembers || []).length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </FormGrid>
              </React.Fragment>
            ))}

            <FormGrid size={{ xs: 12 }}>
              <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={addGroupMember}
                sx={{ alignSelf: 'flex-start' }}
              >
                입찰자 추가
              </Button>
            </FormGrid>
          </Grid>
        )}

        {/* Address Section */}
        <Grid container spacing={2} size={{ xs: 12 }} mt={2}>
          <FormGrid size={{ xs: 12 }}>
            <Typography variant='h6'>
              {formData.applicationType === 'company' ? '회사 주소' : '주소'} *
            </Typography>
          </FormGrid>

          <FormGrid size={{ xs: 12, md: 9 }}>
            <FormLabel htmlFor='roadAddr'>주소 검색</FormLabel>
            <TextField
              id='roadAddr'
              name='roadAddr'
              value={
                formData.applicationType === 'company'
                  ? formData.companyRoadAddr || ''
                  : formData.roadAddr
              }
              placeholder='주소 검색'
              error={!!getFieldError('address')}
              helperText={getFieldError('address')}
              InputProps={{ readOnly: true }}
              fullWidth
              onClick={() => setIsModalOpen(true)}
            />
          </FormGrid>

          <FormGrid size={{ xs: 12, md: 3 }}>
            <FormLabel htmlFor='zipNo'>우편번호</FormLabel>
            <TextField
              id='zipNo'
              name='zipNo'
              value={
                formData.applicationType === 'company'
                  ? formData.companyZipNo || ''
                  : formData.zipNo
              }
              placeholder='12345'
              error={!!getFieldError('address')}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </FormGrid>

          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor='addrDetail'>상세주소</FormLabel>
            <TextField
              id='addrDetail'
              name='addrDetail'
              value={
                formData.applicationType === 'company'
                  ? formData.companyAddrDetail || ''
                  : formData.addrDetail
              }
              onChange={handleFormChange}
              placeholder='상세주소를 입력해주세요'
              fullWidth
            />
          </FormGrid>
        </Grid>

        {/* Bank Account Section */}
        <Grid container spacing={2} size={{ xs: 12 }} mt={2}>
          <FormGrid size={{ xs: 12 }}>
            <Typography variant='h6'>
              입찰보증금 입금계좌
            </Typography>
          </FormGrid>

          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor='bank'>은행 *</FormLabel>
            <TextField
              id='bank'
              name='bank'
              select
              value={formData.bank}
              onChange={handleFormChange}
              error={!!getFieldError('bank')}
              helperText={getFieldError('bank')}
              fullWidth
            >
              {getBankOptions().map((bank) => (
                <MenuItem key={bank.value} value={bank.value}>
                  {bank.labelKo}
                </MenuItem>
              ))}
            </TextField>
          </FormGrid>

          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor='accountNumber'>계좌번호 *</FormLabel>
            <TextField
              id='accountNumber'
              name='accountNumber'
              value={formData.accountNumber}
              onChange={handleFormChange}
              placeholder='계좌번호를 입력해주세요'
              error={!!getFieldError('accountNumber')}
              helperText={getFieldError('accountNumber')}
              fullWidth
            />
          </FormGrid>
        </Grid>

        {/* Error Display */}
        {error && (
          <Grid size={{ xs: 12 }}>
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Address Search Modal */}
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
    </>
  )
}
