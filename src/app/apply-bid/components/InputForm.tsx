import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import MoneyInput from './MoneyInput'
import { styled } from '@mui/material/styles'
import { Box, Modal } from '@mui/material' // Import Modal and Box
import DaumPostcodeEmbed from 'react-daum-postcode' // Import DaumPostcodeEmbed
import { CaseResult } from '@/interfaces/CaseResult'
import {
  Card,
  CardContent,
  CardMedia,
  FormControl,
  FormHelperText,
  InputAdornment,
  Menu,
} from '@mui/material'

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

// 1. Define the props interface to be type-safe.
interface InputFormProps {
  formData: {
    bidAmt: string
    residentId1: string
    residentId2: string
    bank: string
    accountNumber: string
    bidderName: string
    phoneNumber: string
    zipNo: string
    roadAddr: string
    addrDetail: string
    caseResult: CaseResult | null
  }
  handleFormChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void
  updateFormData: (field: string, value: any) => void
}

const formatCurrency = (val: string): string => {
  if (!val) return ''
  const num = parseInt(val, 10)
  if (isNaN(num)) return ''
  return num.toLocaleString('ko-KR') // Use Korean locale for comma formatting
}

const banks = [
  'KB국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  'NH농협은행',
  'IBK기업은행',
  '카카오뱅크',
  '케이뱅크',
]

// 2. The component now accepts props to be fully controlled by the parent.
export default function InputForm({
  formData,
  handleFormChange,
  updateFormData,
}: InputFormProps) {
  // State to control the Daum Postcode modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleDaumComplete = (data: any) => {
    updateFormData('zipNo', data.zonecode)
    updateFormData('roadAddr', data.address)
    setIsModalOpen(false)
  }

  return (
    <>
      <Grid container spacing={3} size={{ xs: 12 }}>
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
              image={`data:image/jpeg;base64,${formData.caseResult?.data?.picFile}`}
              alt='Case Image'
              sx={{
                flex: 1,
                objectFit: 'cover',
                height: 250,
                maxHeight: { xs: 250, sm: 300, md: 350 },
                width: { xs: '100%', sm: 'auto' },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flex: { sm: '0', md: '1' },
                alignItems: 'center',
              }}
            >
              <CardContent
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>법원명</Typography>
                  <Typography variant='body1' fontWeight={'bold'}>
                    {formData.caseResult?.data?.courtName}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>사건번호</Typography>
                  <Typography variant='body1' fontWeight={'bold'}>
                    {formData.caseResult?.data?.printCaseNumber}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>감정가</Typography>
                  <Typography variant='body1' fontWeight={'bold'}>
                    {formData.caseResult?.data?.evaluationAmt.toLocaleString()}
                    원
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>최저 입찰가</Typography>
                  <Typography variant='body1' fontWeight={'bold'}>
                    {formData.caseResult?.data?.lowestBidAmt.toLocaleString()}원
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>보증금</Typography>
                  <Typography variant='body1' fontWeight={'bold'}>
                    {formData.caseResult?.data?.depositAmt?.toLocaleString() ??
                      0}
                    원
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>매각기일</Typography>
                  <Typography variant='body1' fontWeight={'bold'}>
                    {formData.caseResult?.data?.bidDate}
                  </Typography>
                </Box>
              </CardContent>
            </Box>
          </Card>
        </Grid>
      </Grid>
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
        }}
      >
        {/* SECTION 1: Bid Amount */}
        <Grid container spacing={3} size={{ xs: 12 }}>
          <Grid container spacing={2} size={{ xs: 12 }}>
            <Typography variant='h4' fontWeight={'bold'} gutterBottom>
              입찰가를 입력해주세요
            </Typography>
            <Grid
              container
              size={{ xs: 12 }}
              sx={{
                backgroundColor: '#fef3f3',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                padding: 2,
                width: '100%',
              }}
            >
              <Typography variant='body1' color='error'>
                대리인만 입찰가를 확인할 수 있습니다.
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <FormLabel htmlFor='bidAmt' required>
                  입찰가
                </FormLabel>
                <MoneyInput
                  name='bidAmt'
                  required
                  value={formData.bidAmt.toString()}
                  placeholder={
                    formData.caseResult?.data?.lowestBidAmt?.toString() ?? '0'
                  }
                  onChange={handleFormChange}
                />
                <FormHelperText>{formData.caseResult?.data?.lowestBidAmt?.toLocaleString() ?? '0'}원 이상 입력해주세요.</FormHelperText>
              </FormControl>
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <FormLabel htmlFor='depositAmt' required>
                  입찰 보증금
                </FormLabel>
                <MoneyInput
                  name='depositAmt'
                  required
                  disabled
                  value={
                    formData.caseResult?.data?.depositAmt.toString() ?? '0'
                  }
                  onChange={(e) => {}}
                />
                <FormHelperText>자동 계산됩니다.</FormHelperText>
              </FormControl>
            </FormGrid>
          </Grid>
        </Grid>
        {/* SECTION 2: Bidder Information */}
        <Grid container spacing={3} size={{ xs: 12 }} mt={4}>
          <Grid container spacing={2} size={{ xs: 12 }}>
            <Typography variant='h4' fontWeight={'bold'} gutterBottom>
              입찰자 정보를 입력해주세요
            </Typography>
            <Grid
              container
              size={{ xs: 12 }}
              sx={{
                backgroundColor: '#fef3f3',
                border: '1px solid',
                borderColor: '#fdbfb3',
                borderRadius: 2,
                padding: 2,
                width: '100%',
              }}
            >
              <Typography variant='body1' color='#b42318'>
                입찰정보는 입찰표에 그대로 반영되므로, 정확하게 기재해주세요.
                오기재로 인한 낙찰무효는 책임지지 않습니다.
              </Typography>
            </Grid>
          </Grid>

          {/* Resident Registration Number */}
          <Grid container spacing={2} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12 }}>
              <FormLabel htmlFor='residentId1'>주민등록번호</FormLabel>
              <Grid container spacing={2}>
                <TextField
                  id='residentId1'
                  name='residentId1'
                  required
                  type='number'
                  fullWidth // fullWidth now applies to the Grid item's space
                  placeholder='주민등록번호 앞자리'
                  value={formData.residentId1}
                  onChange={handleFormChange}
                  sx={{ alignItems: 'center', flex: 20 }}
                />
                <Typography sx={{ textAlign: 'center', flex: 1 }}>-</Typography>
                <TextField
                  id='residentId2'
                  name='residentId2'
                  required
                  type='password'
                  fullWidth // fullWidth now applies to the Grid item's space
                  placeholder='주민등록번호 뒷자리'
                  value={formData.residentId2}
                  onChange={handleFormChange}
                  sx={{ alignItems: 'center', flex: 20 }}
                />
              </Grid>
              <FormHelperText sx={{ color: '#b42318' }}>
                주민등록번호는 입찰표 작성에만 사용됩니다.
              </FormHelperText>
            </FormGrid>
          </Grid>

          {/* Deposit Refund Account */}
          <Grid container spacing={2} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12 }}>
              <FormLabel htmlFor='bank'>보증금 반환계좌</FormLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    id='bank'
                    name='bank'
                    select
                    fullWidth
                    value={formData.bank || 'default'}
                    onChange={handleFormChange}
                  >
                    <MenuItem value='default' disabled>
                      은행 선택
                    </MenuItem>
                    {banks.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    id='accountNumber'
                    name='accountNumber'
                    fullWidth
                    placeholder='계좌번호 입력'
                    value={formData.accountNumber}
                    onChange={handleFormChange}
                  />
                </Grid>
              </Grid>
              <FormHelperText sx={{ color: '#b42318' }}>
                보증금 반환계좌를 잘못 입력시 보증금 반환이 지연될 수 있습니다.
              </FormHelperText>
            </FormGrid>
          </Grid>

          {/* Bidder Name */}
          <Grid container spacing={2} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12 }}>
              <FormLabel htmlFor='bidderName'>입찰자 성명</FormLabel>
              <TextField
                id='bidderName'
                name='bidderName'
                fullWidth
                placeholder='입찰자 성명'
                value={formData.bidderName}
                onChange={handleFormChange}
              />
            </FormGrid>
          </Grid>

          {/* Phone Number */}
          <Grid container spacing={2} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12 }}>
              <FormLabel htmlFor='phoneNumber'>휴대폰 번호</FormLabel>
              <Grid container spacing={2} alignItems='center'>
                <Grid size={{ xs: 12, sm: 9 }}>
                  <TextField
                    id='phoneNumber'
                    name='phoneNumber'
                    required
                    type='number'
                    fullWidth
                    placeholder='휴대폰번호 입력'
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Button variant='contained' sx={{ width: '100%' }}>
                    인증번호 받기
                  </Button>
                </Grid>
              </Grid>
            </FormGrid>
          </Grid>

          {/* --- ADDRESS FORM using React Daum Postcode --- */}
          <Grid container spacing={2} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 12 }}>
              <FormLabel htmlFor='roadAddr'>주소</FormLabel>
              <Grid container spacing={2} alignItems='center'>
                <Grid size={{ xs: 12, sm: 9 }}>
                  <TextField
                    id='zipNo'
                    name='zipNo'
                    fullWidth
                    placeholder='우편번호'
                    value={formData.zipNo}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Button
                    variant='contained'
                    onClick={handleOpenModal} // Open modal on click
                    sx={{
                      width: '100%',
                    }}
                  >
                    주소찾기
                  </Button>
                </Grid>
              </Grid>
              <TextField
                id='roadAddr'
                name='roadAddr'
                fullWidth
                placeholder='주소'
                value={formData.roadAddr}
                sx={{ mt: 2 }}
              />
              <TextField
                id='addrDetail'
                name='addrDetail'
                required
                fullWidth
                placeholder='상세주소 입력'
                value={formData.addrDetail}
                onChange={handleFormChange}
                sx={{ mt: 2 }}
              />
            </FormGrid>
          </Grid>
        </Grid>{' '}
        {/* --- DAUM POSTCODE MODAL --- */}
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby='modal-address-search'
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600,
              ba: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
            }}
          >
            <DaumPostcodeEmbed onComplete={handleDaumComplete} />
          </Box>
        </Modal>
      </Grid>
    </>
  )
}
