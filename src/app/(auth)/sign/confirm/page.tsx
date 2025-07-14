'use client'
import * as React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { type EmailOtpType } from '@supabase/supabase-js'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import { SitemarkIcon } from '@/components/sign-in/components/CustomIcons'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: { maxWidth: '450px' },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}))

const SignContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
}))

interface Params {
  access_token: string | null
  refresh_token: string | null
  type: EmailOtpType | null
  next: string
  error: string | null
  error_code: string | null
  error_description: string | null
}

interface ConfirmEmailState {
  success: boolean
  error: string | null
  message: string | null
}

function ConfirmForm() {
  const [state, setState] = useState<ConfirmEmailState>({
    success: false,
    error: null,
    message: null,
  })
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<Params | null>(null)

  useEffect(() => {
    const parseHashParams = () => {
      const hash = window.location.hash.substring(1)

      if (!hash) {
        return {
          access_token: null,
          refresh_token: null,
          type: null,
          next: '/',
          error: null,
          error_code: null,
          error_description: null,
        }
      }

      const params = new URLSearchParams(hash)

      // Parse success parameters
      const access_token = params.get('access_token') || null
      const refresh_token = params.get('refresh_token') || null
      const type = params.get('type') as EmailOtpType | null
      const next = params.get('next') || '/'

      // Parse error parameters
      const error = params.get('error') || null
      const error_code = params.get('error_code') || null
      const error_description = params.get('error_description') || null

      return {
        access_token,
        refresh_token,
        type,
        next,
        error,
        error_code,
        error_description,
      }
    }

    const parsedParams = parseHashParams()
    setParams(parsedParams)
  }, [])

  useEffect(() => {
    const handleConfirmation = () => {
      if (!params) {
        return
      }
      if (params.error) {
        let errorMessage = '이메일 확인 중 오류가 발생했습니다.'

        if (params.error_code === 'otp_expired') {
          errorMessage = '확인 링크가 만료되었습니다.'
        } else if (params.error === 'access_denied') {
          errorMessage = '이메일 확인이 거부되었습니다.'
        } else if (params.error_description) {
          // Decode URL-encoded error description
          errorMessage = decodeURIComponent(
            params.error_description.replace(/\+/g, ' ')
          )
        }

        setState({
          success: false,
          error: errorMessage,
          message: null,
        })
        setLoading(false)
        return
      }

      // Check for success parameters
      if (params.access_token && params.type) {
        setState({
          success: true,
          error: null,
          message: '이메일 확인이 완료되었습니다.',
        })
        setLoading(false)
        return
      }

      // No valid parameters found
      setState({
        success: false,
        error: '확인 링크가 유효하지 않습니다. 이메일을 다시 확인해 주세요.',
        message: null,
      })
      setLoading(false)
    }

    if (params !== null) {
      handleConfirmation()
    }
  }, [params])

  return (
    <SignContainer direction='column' justifyContent='space-between'>
      <Card variant='outlined'>
        <SitemarkIcon />
        <Typography
          component='h1'
          variant='h4'
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          이메일 확인
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
            }}
          >
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant='body1' color='text.secondary'>
              이메일 확인 중...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {state.success ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                  }}
                >
                  <CheckCircleIcon
                    color='success'
                    sx={{ fontSize: 64, mb: 2 }}
                  />
                  <Typography variant='h6' color='success.main' gutterBottom>
                    이메일 확인 완료!
                  </Typography>
                </Box>
                <Alert severity='success' sx={{ mb: 2 }}>
                  {state.message}
                </Alert>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                  }}
                >
                  <ErrorIcon color='error' sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant='h6' color='error.main' gutterBottom>
                    이메일 확인 실패
                  </Typography>
                </Box>
                <Alert severity='error' sx={{ mb: 2 }}>
                  {state.error}
                </Alert>
                {(params?.error_code === 'otp_expired' ||
                  params?.error === 'access_denied') && (
                  <Alert severity='info' sx={{ mb: 2 }}>
                    확인 링크가 만료되었습니다. 회원가입 시 사용한 이메일로
                    새로운 확인 이메일을 요청해주세요.
                  </Alert>
                )}
              </>
            )}
            <Stack spacing={2}>
              <Button
                fullWidth
                variant='contained'
                href='/sign/in'
                size='large'
                color='primary'
              >
                로그인하기
              </Button>
            </Stack>
          </Box>
        )}
      </Card>
    </SignContainer>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <SignContainer direction='column' justifyContent='space-between'>
          <Card variant='outlined'>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
              }}
            >
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant='body1' color='text.secondary'>
                로딩 중...
              </Typography>
            </Box>
          </Card>
        </SignContainer>
      }
    >
      <ConfirmForm />
    </Suspense>
  )
}
