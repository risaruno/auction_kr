'use client'
import * as React from 'react'
import { Suspense, useState } from 'react'
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

  // Form values state to preserve values on error
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    remember: false,
  })

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setFormValues((prev) => ({
        ...prev,
        email: rememberedEmail,
        remember: true,
      }))
    }
  }, [])

  // Enhanced form action that preserves form values on error
  const enhancedFormAction = (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const remember = formData.get('remember') === 'on'

    // Store form values to preserve them on error
    setFormValues({
      email,
      password,
      remember,
    })

    // Handle remember me functionality
    if (remember) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    return formAction(formData)
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Clear form function (optional - can be called if needed)
  const clearForm = () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    setFormValues({
      email: rememberedEmail || '',
      password: '',
      remember: !!rememberedEmail,
    })
  }

  // Handle successful login (clear form on success)
  React.useEffect(() => {
    if (state.message) {
      // Clear form on successful login
      clearForm()
    }
  }, [state.message])

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
          action={enhancedFormAction}
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
          {state.error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {state.error}
            </Alert>
          )}

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
              value={formValues.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              value={formValues.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
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
              control={
                <Checkbox
                  name='remember'
                  color='primary'
                  checked={formValues.remember}
                  onChange={(e) =>
                    handleInputChange('remember', e.target.checked)
                  }
                />
              }
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

          <Divider>계정 없으신가요?</Divider>
          <Button
            href='/sign/up'
            type='button'
            fullWidth
            variant='contained'
            color='secondary'
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
