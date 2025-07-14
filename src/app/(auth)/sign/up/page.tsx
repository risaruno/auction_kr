'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { SitemarkIcon } from '@/components/sign-in/components/CustomIcons'
import Alert from '@mui/material/Alert'
import {
  signup,
  FormState,
  resendConfirmationEmail,
} from '@/app/api/auth/sign/actions'
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  checkPhoneAvailability,
} from '@/app/api/auth/phone/actions'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}))

const SignContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}))

// A component to get the form's pending status
function SignUpButton({ phoneVerified }: { phoneVerified: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      color='secondary'
      fullWidth
      variant='contained'
      disabled={pending || !phoneVerified}
    >
      {pending ? '가입 중...' : '가입하기'}
    </Button>
  )
}

// Phone verification component
function PhoneVerification({
  phoneNumber,
  setPhoneNumber,
  setPhoneVerified,
}: {
  phoneNumber: string
  setPhoneNumber: (phone: string) => void
  phoneVerified: boolean
  setPhoneVerified: (verified: boolean) => void
}) {
  const [otpStep, setOtpStep] = useState<'initial' | 'otp_sent' | 'verified'>(
    'initial'
  )
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Timer effect for resend functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (otpStep === 'otp_sent' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true)
            return 0
          }
          return prevTimer - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [otpStep, resendTimer])

  // Format timer display (mm:ss)
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Start timer when OTP is sent
  const startResendTimer = () => {
    setResendTimer(180) // 3 minutes = 180 seconds
    setCanResend(false)
  }

  const handlePhoneNumberChange = (phone: string) => {
    setPhoneNumber(phone)
    setPhoneAvailable(null) // Reset availability status when phone changes
    setError(null)
    setMessage(null)

    // Reset OTP state if user changes phone number after sending OTP
    if (otpStep !== 'initial') {
      setOtpStep('initial')
      setOtp('')
      setResendTimer(0)
      setCanResend(false)
    }
  }

  const checkPhoneAvailabilityHandler = async (phone: string) => {
    if (!phone) return

    try {
      const result = await checkPhoneAvailability(phone)
      setPhoneAvailable(result.available)

      if (!result.available) {
        setError(result.error)
      } else {
        setError(null)
        setMessage(result.message)
      }
    } catch (err) {
      console.error('Error checking phone availability:', err)
      setError('휴대폰 번호 확인 중 오류가 발생했습니다.')
      setPhoneAvailable(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('휴대폰 번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await sendPhoneOtp(phoneNumber)

      if (result.success) {
        setOtpStep('otp_sent')
        setMessage(result.message)
        setError(null)
        startResendTimer() // Start the resend timer
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error sending OTP:', err)
      setError('인증번호 발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('인증번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await verifyPhoneOtp(phoneNumber, otp)

      if (result.success) {
        setOtpStep('verified')
        setPhoneVerified(true)
        setMessage(result.message)
        setError(null)
      } else {
        console.error('Error verifying OTP:', result.error)
        setError(result.error)
      }
    } catch (err) {
      console.error('Error verifying OTP:', err)
      setError('인증번호 확인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await sendPhoneOtp(phoneNumber)

      if (result.success) {
        setMessage('인증번호가 재발송되었습니다.')
        setError(null)
        startResendTimer() // Restart the timer
        setOtp('') // Clear the OTP input
      } else {
        console.error('Error resending OTP:', result.error)
        setError(result.error)
      }
    } catch (err) {
      console.error('Error resending OTP:', err)
      setError('인증번호 재발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth sx={{ mb: 1 }}>
        <FormLabel htmlFor='phoneNumber'>휴대폰 번호</FormLabel>
        <TextField
          id='phoneNumber'
          type='tel'
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          onBlur={() => checkPhoneAvailabilityHandler(phoneNumber)}
          placeholder='010-1234-5678'
          disabled={otpStep === 'verified'}
          InputProps={{
            endAdornment:
              otpStep === 'verified' ? (
                <InputAdornment position='end'>
                  <CheckCircleIcon color='success' />
                </InputAdornment>
              ) : (
                <InputAdornment position='end'>
                  <Button
                    onClick={handleSendOtp}
                    disabled={
                      loading ||
                      otpStep !== 'initial' ||
                      phoneAvailable === false
                    }
                    size='small'
                    variant='outlined'
                    color={phoneAvailable === true ? 'primary' : 'inherit'}
                  >
                    {loading
                      ? '발송 중...'
                      : phoneAvailable === true
                        ? '인증번호 발송'
                        : '번호 확인 후 발송'}
                  </Button>
                </InputAdornment>
              ),
          }}
          required
          fullWidth
          variant='outlined'
          error={phoneAvailable === false}
        />
      </FormControl>

      {otpStep === 'otp_sent' && (
        <FormControl fullWidth sx={{ mb: 1 }}>
          <FormLabel htmlFor='otp'>인증번호</FormLabel>
          <TextField
            id='otp'
            type='text'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder='6자리 인증번호를 입력하세요'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    size='small'
                    variant='contained'
                  >
                    {loading ? '확인 중...' : '인증확인'}
                  </Button>
                </InputAdornment>
              ),
            }}
            required
            fullWidth
            variant='outlined'
          />

          {/* Timer and Resend Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              p: 1,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            <Typography
              variant='caption'
              color={resendTimer > 0 ? 'text.secondary' : 'primary.main'}
            >
              {resendTimer > 0
                ? `인증번호 재발송까지 ${formatTimer(resendTimer)}`
                : '인증번호를 받지 못하셨나요?'}
            </Typography>
            {canResend && (
              <Button
                onClick={handleResendOtp}
                disabled={loading}
                size='small'
                variant='text'
                color='primary'
                sx={{ minWidth: 'auto' }}
              >
                {loading ? '재발송 중...' : '인증번호 재발송'}
              </Button>
            )}
          </Box>
        </FormControl>
      )}

      {error && (
        <Alert severity='error' sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity='success' sx={{ mt: 1 }}>
          {message}
        </Alert>
      )}
    </Box>
  )
}

export default function SignUp() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [registrationSuccessful, setRegistrationSuccessful] = useState(false)
  const [emailResendTimer, setEmailResendTimer] = useState(0)
  const [canResendEmail, setCanResendEmail] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

  // Form values state to preserve values on error
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  })

  // Initialize useFormState to manage the response from the server action
  const initialState: FormState = { error: null, message: null }
  const [state, formAction] = useFormState(signup, initialState)

  // Email resend timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (registrationSuccessful && emailResendTimer > 0) {
      interval = setInterval(() => {
        setEmailResendTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResendEmail(true)
            return 0
          }
          return prevTimer - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [registrationSuccessful, emailResendTimer])

  // Format timer display (mm:ss)
  const formatEmailTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Start email resend timer
  const startEmailResendTimer = () => {
    setEmailResendTimer(180) // 3 minutes = 180 seconds
    setCanResendEmail(false)
  }

  // Handle successful registration
  React.useEffect(() => {
    if (state.message && state.message.includes('회원가입이 완료되었습니다')) {
      setRegistrationSuccessful(true)
      startEmailResendTimer()
      // Clear form values on successful registration
      setFormValues({
        name: '',
        email: '',
        password: '',
      })
    }
  }, [state.message])

  // Handle resend email
  const handleResendEmail = async () => {
    if (!userEmail) return

    setResendLoading(true)
    setResendError(null)
    setResendMessage(null)

    try {
      const result = await resendConfirmationEmail(userEmail)

      if (result.success) {
        setResendMessage(result.message || '인증 이메일이 재발송되었습니다.')
        setResendError(null)
        startEmailResendTimer() // Restart the timer
      } else {
        setResendError(result.error || '이메일 재발송에 실패했습니다.')
        setResendMessage(null)
      }
    } catch (err) {
      console.error('Error resending confirmation email:', err)
      setResendError('이메일 재발송 중 오류가 발생했습니다.')
      setResendMessage(null)
    } finally {
      setResendLoading(false)
    }
  }

  // Enhanced form action that captures email for resend functionality
  const enhancedFormAction = (formData: FormData) => {
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string

    // Store form values to preserve them on error
    setFormValues({
      name,
      email,
      password,
    })

    setUserEmail(email)
    return formAction(formData)
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <>
      <SignContainer direction='column' justifyContent='space-between'>
        <Card variant='outlined'>
          <SitemarkIcon />
          <Typography
            component='h1'
            variant='h4'
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            회원가입
          </Typography>

          {registrationSuccessful ? (
            // Success state - show confirmation message and resend email option
            <Box sx={{ py: 4 }}>
              <Alert severity='success' sx={{ mb: 2 }}>
                회원가입이 완료되었습니다!
              </Alert>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                <strong>{userEmail}</strong>로 인증 이메일이 발송되었습니다.
                <br />
                이메일을 확인하여 계정을 활성화해주세요.
              </Typography>

              {/* Email resend section */}
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography
                  variant='caption'
                  color={
                    emailResendTimer > 0 ? 'text.secondary' : 'primary.main'
                  }
                >
                  {emailResendTimer > 0
                    ? `인증 이메일 재발송까지 ${formatEmailTimer(emailResendTimer)}`
                    : '인증 이메일을 받지 못하셨나요?'}
                </Typography>
                {canResendEmail && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      onClick={handleResendEmail}
                      disabled={resendLoading}
                      size='small'
                      variant='outlined'
                      color='primary'
                    >
                      {resendLoading ? '재발송 중...' : '인증 이메일 재발송'}
                    </Button>
                  </Box>
                )}
              </Box>

              {resendError && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {resendError}
                </Alert>
              )}
              {resendMessage && (
                <Alert severity='success' sx={{ mb: 2 }}>
                  {resendMessage}
                </Alert>
              )}

              <Button
                variant='contained'
                fullWidth
                onClick={() => router.push('/sign/in')}
                sx={{ mt: 2 }}
              >
                로그인 페이지로 이동
              </Button>
            </Box>
          ) : (
            // Registration form
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
              {state.error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {state.error}
                </Alert>
              )}

              <FormControl>
                <FormLabel htmlFor='name'>이름</FormLabel>
                <TextField
                  id='name'
                  type='text'
                  name='name'
                  placeholder='홍길동'
                  autoComplete='name'
                  autoFocus
                  required
                  fullWidth
                  variant='outlined'
                  value={formValues.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='email'>이메일</FormLabel>
                <TextField
                  id='email'
                  type='email'
                  name='email'
                  placeholder='your@email.com'
                  autoComplete='email'
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
                  placeholder='8-16자 사이로 입력해주세요'
                  type='password'
                  id='password'
                  autoComplete='new-password'
                  required
                  fullWidth
                  variant='outlined'
                  value={formValues.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                />
              </FormControl>

              <PhoneVerification
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                phoneVerified={phoneVerified}
                setPhoneVerified={setPhoneVerified}
              />

              {/* Hidden fields for form submission */}
              <input type='hidden' name='phoneNumber' value={phoneNumber} />
              <input
                type='hidden'
                name='phoneVerified'
                value={phoneVerified.toString()}
              />

              <SignUpButton phoneVerified={phoneVerified} />
              <Divider>계정이 이미 있으신가요?</Divider>
              <Button
                type='button'
                fullWidth
                variant='contained'
                onClick={() => router.push('/sign/in')}
              >
                로그인
              </Button>
            </Box>
          )}
        </Card>
      </SignContainer>
    </>
  )
}
