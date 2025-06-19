'use client'
import * as React from 'react'
import { useState } from 'react'

// Material-UI 컴포넌트 import (Grid는 제거됨)
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
} from '@mui/material'

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

// 입찰 정보 수정 폼 컴포넌트 (Flexbox 사용)
const BiddingInfoForm = () => {
  const [bank, setBank] = useState('')

  return (
    <Paper elevation={0} sx={{ p: 4, flex: 1 }}>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
        입찰 정보 수정
      </Typography>
      <Alert severity='info' sx={{ mb: 4, backgroundColor: '#e3f2fd' }}>
        안심하세요 :) 대리입찰 외 다른 용도로 입찰인의 정보를 이용하지 않습니다
      </Alert>

      {/* Box와 Flexbox를 사용한 폼 레이아웃 */}
      <Box
        component='form'
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            주민등록번호
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField sx={{ flex: 1 }} />
            <Typography component='span'>-</Typography>
            <TextField type='password' sx={{ flex: 1 }} />
          </Box>
          <Typography variant='caption' color='error' sx={{ mt: 1 }}>
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
                value={bank}
                label='은행'
                onChange={(e) => setBank(e.target.value)}
              >
                <MenuItem value={'kb'}>국민은행</MenuItem>
                <MenuItem value={'shinhan'}>신한은행</MenuItem>
                <MenuItem value={'woori'}>우리은행</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth placeholder='계좌번호 입력' />
          </Box>
        </Box>

        {/* 2개의 필드를 한 줄에 배치하기 위한 Flexbox Row */}
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
            <TextField fullWidth defaultValue='리잔' />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              연락처
            </Typography>
            <TextField fullWidth placeholder='연락처 입력' />
          </Box>
        </Box>

        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            주소
          </Typography>
          <TextField fullWidth placeholder='주소검색' sx={{ mb: 1 }} />
          <TextField fullWidth placeholder='상세주소 입력' />
        </Box>

        <Box>
          <Button
            variant='contained'
            size='large'
            fullWidth
            sx={{ py: 1.5, mt: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            입찰인 정보 수정하기
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

// 비밀번호 변경 폼 컴포넌트 (Flexbox 사용)
const ChangePasswordForm = () => {
  return (
    <Paper elevation={0} sx={{ p: 4, flex: 1 }}>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 4 }}>
        비밀번호 변경
      </Typography>

      <Box
        component='form'
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            이메일
          </Typography>
          <TextField
            fullWidth
            defaultValue='risaruno@kakao.com'
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
          <TextField type='password' fullWidth defaultValue='12345678' />
        </Box>

        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            새 비밀번호
          </Typography>
          <TextField
            type='password'
            fullWidth
            placeholder='새 비밀번호 (영문, 숫자, 특수문자 8-15자)'
          />
        </Box>

        <Box>
          <Button
            variant='contained'
            size='large'
            fullWidth
            sx={{ py: 1.5, mt: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            비밀번호 수정하기
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

// 메인 페이지 컴포넌트
export default function UserInfo() {
  const [activeView, setActiveView] = useState('biddingInfo') // 'biddingInfo' or 'changePassword'

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
