'use client'
import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import { SitemarkIcon } from '@/components/sign-in/components/CustomIcons'
import Alert from '@mui/material/Alert'
import { login, FormState } from '@/app/api/auth/sign/actions'

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

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button type='submit' fullWidth variant='contained' disabled={pending}>
      {pending ? '로그인 중...' : '로그인'}
    </Button>
  )
}

function SignInForm() {
  const initialState: FormState = { error: null, message: null }
  const [state, formAction] = useActionState(login, initialState)
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectTo')

  return (
    <SignContainer direction='column' justifyContent='space-between'>
      <Card variant='outlined'>
        <SitemarkIcon />
        <Typography
          component='h1'
          variant='h4'
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          로그인
        </Typography>
        <Box
          component='form'
          action={formAction}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          {redirectTo && (
            <input type='hidden' name='redirectTo' value={redirectTo} />
          )}
          {state.error && <Alert severity='error'>{state.error}</Alert>}

          <FormControl>
            <FormLabel htmlFor='email'>이메일</FormLabel>
            <TextField
              id='email'
              type='email'
              name='email'
              placeholder='your@email.com'
              autoComplete='email'
              autoFocus
              required
              fullWidth
              variant='outlined'
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='password'>비밀번호</FormLabel>
            <TextField
              name='password'
              placeholder='8-16자 사이의 비밀번호'
              type='password'
              id='password'
              autoComplete='current-password'
              required
              fullWidth
              variant='outlined'
            />
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <FormControlLabel
              control={<Checkbox value='remember' color='primary' />}
              label='이메일 기억하기'
            />
            <Link
              href='/sign/find-password'
              variant='body2'
              sx={{ alignSelf: 'center' }}
            >
              비밀번호 찾기
            </Link>
          </Box>

          <LoginButton />

          <Divider>or</Divider>
          <Button
            href='/sign/up'
            type='button'
            fullWidth
            variant='contained'
            color='info'
          >
            가입하기
          </Button>
        </Box>
      </Card>
    </SignContainer>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}