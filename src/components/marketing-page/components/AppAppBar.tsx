import * as React from 'react'
import { useState, useEffect } from 'react'
import { styled, alpha } from '@mui/material/styles'
import type {} from '@mui/material/themeCssVarsAugmentation'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Drawer from '@mui/material/Drawer'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CircularProgress from '@mui/material/CircularProgress'
import Sitemark from './SitemarkIcon'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DebugAuth from '@/components/DebugAuth'
import { Login as LoginIcon } from '@mui/icons-material'
import Link from 'next/link'

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}))

export default function AppAppBar() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleInquiryClick = () => {
    // Jika masih dalam proses loading auth, jangan lakukan apa-apa
    if (loading) {
      return
    }

    // Jika pengguna sudah login
    if (user) {
      // Cek apakah pengguna adalah admin
      if (userIsAdmin) {
        router.push('/auth/manage/inquiries')
      } else {
        router.push('/auth/user/inquiry')
      }
    } else {
      // Jika pengguna belum login, arahkan ke halaman sign-in
      // dengan parameter redirectTo ke halaman inquiry untuk user biasa.
      const destination = '/auth/user/inquiry'
      router.push(`/sign/in?redirectTo=${encodeURIComponent(destination)}`)
    }
  }

  useEffect(() => {
    setUserIsAdmin(user?.admin_role === 'super_admin')
  }, [user])

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple logout attempts

    setIsLoggingOut(true)
    try {
      await signOut()
      setUserMenuAnchor(null)
    } catch (error) {
      console.error('Logout error:', error)
      setUserMenuAnchor(null)
      setIsLoggingOut(false)
    }
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  return (
    <AppBar
      position='fixed'
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth='lg'>
        <StyledToolbar variant='dense' disableGutters>
          <Box
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}
          >
            <Sitemark />
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                marginLeft: { md: 2 },
              }}
            >
              <Link href='/info' passHref>
                <Button variant='text' color='info' size='small'>
                  서비스 안내
                </Button>
              </Link>
              <Link href='/experts' passHref>
                <Button variant='text' color='info' size='small'>
                  전문가 서비스
                </Button>
              </Link>
              <Link href='/faq' passHref>
                <Button variant='text' color='info' size='small'>
                  자주하는 질문
                </Button>
              </Link>
              <Link href='/auth/user/inquiry' passHref>
                <Button
                  onClick={handleInquiryClick}
                  variant='text'
                  color='info'
                  size='small'
                  sx={{ minWidth: 0 }}
                >
                  1:1 문의
                </Button>
              </Link>
              <Link href='/apply-bid' passHref>
                <Button
                  variant='outlined'
                  size='small'
                  sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                >
                  대리입찰 신청
                </Button>
              </Link>
            </Box>
          </Box>

          <DebugAuth />
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            {/* Conditional Rendering based on auth state */}
            {loading ? (
              // If loading, show circular progress or spinner
              <CircularProgress size={24} color='primary' />
            ) : user ? (
              // If the user is logged in:
              <>
                <Button
                  onClick={handleUserMenuOpen}
                  color='primary'
                  variant='outlined'
                  size='small'
                  startIcon={<AccountCircleIcon />}
                >
                  {user?.full_name || user?.email || user?.admin_role || 'User'}
                </Button>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {userIsAdmin
                    ? [
                        <MenuItem
                          key='admin-page'
                          onClick={() => {
                            router.push('/auth/manage')
                            handleUserMenuClose()
                          }}
                        >
                          관리자 페이지
                        </MenuItem>,
                        <Divider key='admin-divider' />,
                      ]
                    : [
                        <MenuItem
                          key='bid-history'
                          onClick={() => {
                            router.push('/auth/user/history')
                            handleUserMenuClose()
                          }}
                        >
                          입찰 내역
                        </MenuItem>,
                        <MenuItem
                          key='profile'
                          onClick={() => {
                            router.push('/auth/user/info')
                            handleUserMenuClose()
                          }}
                        >
                          프로필 관리
                        </MenuItem>,
                        <Divider key='user-divider' />,
                      ]}
                  <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // If the user is logged out:
              <>
                <Link href='/sign/in' passHref>
                  <Button
                    color='primary'
                    variant='outlined'
                    fullWidth
                    size='small'
                    startIcon={<LoginIcon fontSize='small' />}
                  >
                    로그인/회원가입
                  </Button>
                </Link>
              </>
            )}
            {/* <ColorModeIconDropdown /> */}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            {/* <ColorModeIconDropdown size="medium" /> */}
            <IconButton aria-label='Menu button' onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor='top'
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    my: 2,
                  }}
                >
                  <Sitemark />
                </Box>
                <MenuItem>
                  <Link href='/info' passHref>
                    <Button variant='text' color='info' size='small'>
                      서비스 안내
                    </Button>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href='/experts' passHref>
                    <Button variant='text' color='info' size='small'>
                      전문가 서비스
                    </Button>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href='/faq' passHref>
                    <Button variant='text' color='info' size='small'>
                      자주하는 질문
                    </Button>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href='/auth/user/inquiry' passHref>
                    <Button
                      variant='text'
                      color='info'
                      size='small'
                      onClick={handleInquiryClick}
                    >
                      1:1 문의
                    </Button>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href='/apply-bid' passHref>
                    <Button
                      variant='outlined'
                      size='small'
                      sx={{
                        color: 'primary.main',
                        borderColor: 'primary.main',
                      }}
                    >
                      대리입찰 신청
                    </Button>
                  </Link>
                </MenuItem>
                <Divider sx={{ my: 3 }} />

                {/* Mobile menu authentication section */}
                {user ? (
                  // If the user is logged in:
                  <Box>
                    {userIsAdmin && (
                      <MenuItem
                        onClick={() => {
                          router.push('/auth/manage')
                          handleUserMenuClose()
                        }}
                      >
                        관리자 페이지
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        router.push('/auth/user/history')
                        setOpen(false)
                      }}
                    >
                      입찰 내역
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        router.push('/auth/user/info')
                        setOpen(false)
                      }}
                    >
                      입찰 정보
                    </MenuItem>
                    <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                      {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                    </MenuItem>
                  </Box>
                ) : (
                  // If the user is logged out:
                  <Box>
                    <MenuItem>
                      <Link href='/sign/in' passHref>
                        <Button color='primary' variant='outlined' fullWidth>
                          로그인/회원가입
                        </Button>
                      </Link>
                    </MenuItem>
                  </Box>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  )
}
