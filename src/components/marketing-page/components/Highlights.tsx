import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded'
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded'
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded'
import theme from '@/theme'

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: '전문성과 경험',
    description:
      '20년 이상의 경매 경험으로 법원 경매의 복잡한 절차와 규정을 철저히 파악하여 고객님께 최적의 입찰 서비스를 제공합니다.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: '정확한 물건 분석',
    description:
      '전문 감정사와 법률 전문가가 물건의 가치와 법적 리스크를 철저히 분석하여 안전하고 수익성 있는 투자가 가능하도록 도와드립니다.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: '편리한 비대면 서비스',
    description:
      '직접 현장에 방문하실 필요 없이 온라인으로 모든 과정을 편리하게 관리하며, 실시간으로 입찰 과정을 확인하실 수 있습니다.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: '맞춤형 입찰 전략',
    description:
      '고객님의 예산과 투자 목표에 맞는 최적의 입찰 전략을 수립하여 경쟁 입찰자보다 유리한 조건으로 낙찰받을 수 있도록 지원합니다.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: '1:1 전담 매니저',
    description:
      '전문 입찰 매니저가 상담부터 낙찰 이후 권리 이전까지 모든 과정을 책임지고 관리하며, 24시간 신속한 응대 서비스를 제공합니다.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: '투명한 수수료 체계',
    description:
      '추가 비용이나 숨겨진 수수료 없이 명확하고 투명한 수수료 체계로 운영되어 고객님께서 안심하고 서비스를 이용하실 수 있습니다.',
  },
]
export default function Highlights() {
  return (
    <Box
      id='highlights'
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: theme.palette.mode === 'light' ? 'grey.900' : 'white',
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundBlendMode: 'multiply',
        backgroundColor: theme.palette.mode === 'light' ? 'white' : 'grey.900',
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 0 12px 8px hsla(220, 25%, 80%, 0.2)'
            : '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
        outlineColor:
          theme.palette.mode === 'light'
            ? 'hsla(220, 20%, 42%, 0.1)'
            : 'hsla(220, 20%, 42%, 0.2)',
        borderColor: theme.palette.mode === 'light' ? 'grey.700' : 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: 'left',
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography component='h2' variant='h2' gutterBottom>
            서비스 특장점
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: theme.palette.mode === 'light' ? 'grey.800' : 'white',
              mb: { xs: 2, sm: 4 },
            }}
          >
            체르또 대리입찰 서비스는 전문성, 정확한 분석, 맞춤형 전략으로
            고객님의 성공적인 부동산 경매 투자를 지원합니다. 투명한 수수료
            체계와 1:1 전담 매니저 시스템으로 안심하고 이용하실 수 있습니다.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction='column'
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  backgroundColor:
                    theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
                  },
                  '&:active': {
                    backgroundColor:
                      theme.palette.mode === 'light' ? 'grey.200' : 'grey.700',
                  },
                  borderRadius: 2,
                  boxShadow:
                    theme.palette.mode === 'light'
                      ? '0 0 12px 8px hsla(220, 25%, 80%, 0.2)'
                      : '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
                  outlineColor:
                    theme.palette.mode === 'light'
                      ? 'hsla(220, 20%, 42%, 0.1)'
                      : 'hsla(220, 20%, 42%, 0.2)',
                  borderColor:
                    theme.palette.mode === 'light' ? 'grey.200' : 'grey.700',
                  backgroundImage:
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))'
                      : 'linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'fixed',
                  backgroundBlendMode: 'multiply',
                }}
              >
                <Box
                  sx={{
                    opacity: '50%',
                    color:
                      theme.palette.mode === 'light' ? 'grey.800' : 'white',
                  }}
                >
                  {item.icon}
                </Box>
                <div>
                  <Typography
                    variant='h4'
                    gutterBottom
                    sx={{ fontWeight: 'medium' }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
