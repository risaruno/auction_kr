import * as React from 'react'
import { Box, Container, Link, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: { xs: '100%', sm: '60%' },
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: '100%' } }}>
            <Typography
              component='a'
              href='/'
              variant='h5'
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                fontWeight: 700,
                textDecoration: 'none',
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              Certo
            </Typography>
            <Box
              sx={{
                textAlign: 'left',
              }}
            >
              <Link
                color='text.secondary'
                variant='body1'
                href='/policy/privacy'
                sx={{ fontWeight: 700 }}
              >
                개인정보 처리방침
              </Link>
              <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
                &nbsp;•&nbsp;
              </Typography>
              <Link color='text.secondary' variant='body2' href='/policy/terms'>
                이용약관
              </Link>
              <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
                &nbsp;•&nbsp;
              </Typography>
              <Link color='text.secondary' variant='body2' href='/about'>
                회사 소개
              </Link>
              <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
                &nbsp;•&nbsp;
              </Typography>
              <Link
                color='text.secondary'
                variant='body2'
                href='/policy/refund'
              >
                환불 취소 규정
              </Link>
              <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
                &nbsp;•&nbsp;
              </Typography>
              <Link
                color='text.secondary'
                variant='body2'
                href='/policy/agent-support'
              >
                대리인 지원하기
              </Link>
              <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
                &nbsp;•&nbsp;
              </Typography>
              <Link
                color='text.secondary'
                variant='body2'
                href='/policy/legal-registration'
              >
                법무사 등록하기
              </Link>
            </Box>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mt: 2,
                mb: 2,
                fontSize: '0.875rem',
                textAlign: 'left',
              }}
            >
              주식회사 솔하우징 · 대표이사 류기진
              <br />
              사업자등록번호 337-88-00496
              <br />
              주소 : 경기도 수원시 장안구 듬당로 10번길 63, 201호 (조원동,
              메가타워)
              <br />
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', mb: 2, fontSize: '0.8rem' }}
            >
              ©Copyright Certo. All Rights Reserved.
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Link color='text.secondary' variant='body2' href='/info'>
            이용 안내
          </Link>
          <Link color='text.secondary' variant='body2' href='/expert'>
            전문가 서비스
          </Link>
          <Link color='text.secondary' variant='body2' href='/area'>
            서비스 지역
          </Link>
          <Link color='text.secondary' variant='body2' href='/faq'>
            자주하는 질문
          </Link>
          <Link color='text.secondary' variant='body2' href='/contact'>
            1:1 문의
          </Link>
        </Box>
      </Box>
    </Container>
  )
}
