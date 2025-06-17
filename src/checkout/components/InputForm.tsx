import { useState } from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled } from '@mui/material/styles'
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

// Sample bank list for the dropdown
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

export default function InputForm() {
  // State for the new bidder information form
  const [residentId1, setResidentId1] = useState('')
  const [residentId2, setResidentId2] = useState('')
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bidderName, setBidderName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  interface CaseResult {
    error?: string // Add an optional error field to handle errors
    data?: {
      picFile: string
      courtName: string
      caseNumber: string
      printCaseNumber: string
      evaluationAmt: number
      lowestBidAmt: number
      depositAmt: number
      bidDate: string
    }
  }

  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
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
              <OutlinedInput
                id='bidAmt'
                name='bidAmt'
                placeholder='입찰가를 입력해주세요'
                onChange={(e) => {}}
                endAdornment={
                  <InputAdornment position='end'>원</InputAdornment>
                }
              />
              <FormHelperText>100000원 이상 입력해주세요.</FormHelperText>
            </FormControl>
          </FormGrid>
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor='depositAmt' required>
                입찰 보증금
              </FormLabel>
              <OutlinedInput
                id='depositAmt'
                name='depositAmt'
                required
                disabled
                value='100000'
                onChange={(e) => {}}
                endAdornment={
                  <InputAdornment position='end'>원</InputAdornment>
                }
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
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <TextField
                id='residentId1'
                name='residentId1'
                sx={{ flexGrow: 5 }}
                placeholder='주민등록번호 앞자리'
                value={residentId1}
                onChange={(e) => setResidentId1(e.target.value)}
              />
              <Typography sx={{ flexGrow: 2, textAlign: 'center' }}> - </Typography>
              <TextField
                id='residentId2'
                name='residentId2'
                type='password'
                sx={{ flexGrow: 5 }}
                placeholder='주민등록번호 뒷자리'
                value={residentId2}
                onChange={(e) => setResidentId2(e.target.value)}
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
                  label='은행'
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <MenuItem value='' disabled>
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
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
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
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
            />
          </FormGrid>
        </Grid>

        {/* Phone Number */}
        <Grid container spacing={2} size={{ xs: 12 }}>
          <FormGrid size={{ xs: 12 }}>
            <FormLabel htmlFor='phoneNumber'>휴대폰 번호</FormLabel>
            <Grid container spacing={2} alignItems='center'>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id='phoneNumber'
                  name='phoneNumber'
                  fullWidth
                  placeholder='휴대폰번호 입력'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid>
                <Button variant='contained'>인증번호 받기</Button>
              </Grid>
            </Grid>
          </FormGrid>
        </Grid>
      </Grid>
    </Grid>
  )
}
