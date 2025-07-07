import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function Hero() {
  return (
    <Box
      id='hero'
      sx={(theme) => ({
        width: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0)),
          url('/hero-background.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pt: { xs: 18, sm: 24 },
          pb: { xs: 12, sm: 16 },
          px: { xs: 4, sm: 6 }, 
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'flex-start', width: { xs: '100%', sm: '70%' } }}
        >
          <Typography
            variant='h3'
            sx={{
              textAlign: 'left',
              color: 'text.secondary',
            }}
          >
            대리입찰 전문가
          </Typography>
          <Typography
            variant='h1'
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'flex-start',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
            }}
          >
            대리입찰&nbsp;
            <Typography
              component='span'
              variant='h1'
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              체르또
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: 'left',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            20년 이상의 경매 노하우로 물건 선별부터 낙찰까지 책임집니다. 부동산
            경매 전문가들이 고객님의 성공적인 투자를 위해 맞춤형 입찰 전략을
            제공해 드립니다.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            sx={{
              justifyContent: 'flex-start',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant='contained'
              color='primary'
              size='large'
              sx={{ minWidth: 'fit-content' }}
              href='/apply-bid'
            >
              대리입찰 신청
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
