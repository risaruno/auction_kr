import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import MuiChip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded'
import EdgesensorHighRoundedIcon from '@mui/icons-material/EdgesensorHighRounded'
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded'

const items = [
  {
    icon: <ViewQuiltRoundedIcon />,
    title: '대리입찰 신청, 쉽고 간단하게',
    description:
      '복잡한 입찰 과정, 더 이상 혼자 고민하지 마세요. 똑똑하고 쉬운 입찰 절차 진행을 편리하게 도와드립니다. 몇 번의 간단한 신청으로 입찰 절차 지원을 요청하고, 모든 과정은 한 곳에서, 간편하고 안전하게 진행됩니다.',
    imageLight: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/dash-light.png")`,
    imageDark: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/dash-dark.png")`,
  },
  {
    icon: <EdgesensorHighRoundedIcon />,
    title: '안전하게 진행되는 서류 작성',
    description:
      '체르토는 입찰 서류 작성 지원 서비스를 통해 문서의 정확성을 높입니다. 체르토를 통해 서류 작성 과정에서 발생할 수 있는 오류를 예방하고, 안심하고 입찰을 준비하세요.',
    imageLight: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/mobile-light.png")`,
    imageDark: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/mobile-dark.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: '전자계약으로 안심 거래',
    description:
      '서비스 계약은 전자계약을 통해 진행됩니다. 입찰자와 입찰 진행 지원자 간 계약을 전자 서명을 통해 간편하게 체결할 수 있어, 원활한 진행과 안전하고 직관적인 방식으로 계약 내용을 쉽게 검토하고 진행하실 수 있습니다.',
    imageLight: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/devices-light.png")`,
    imageDark: `url("${process.env.TEMPLATE_IMAGE_URL || 'https://mui.com'}/static/images/templates/templates-images/devices-dark.png")`,
  },
]

interface ChipProps {
  selected?: boolean
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        borderColor: (theme.vars || theme).palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}))

interface MobileLayoutProps {
  selectedItemIndex: number
  handleItemClick: (index: number) => void
  selectedFeature: (typeof items)[0]
}

export function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null
  }

  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        {items.map(({ title }, index) => (
          <Chip
            size='medium'
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant='outlined'>
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 280,
            backgroundImage: 'var(--items-imageLight)',
            ...theme.applyStyles('dark', {
              backgroundImage: 'var(--items-imageDark)',
            }),
          })}
          style={
            items[selectedItemIndex]
              ? ({
                  '--items-imageLight': items[selectedItemIndex].imageLight,
                  '--items-imageDark': items[selectedItemIndex].imageDark,
                } as React.CSSProperties)
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 'medium' }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0)

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index)
  }

  const selectedFeature = items[selectedItemIndex]

  return (
    <Container id='features' sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' }, px: { xs: 2, sm: 3 } }}>
        <Typography
          component='h2'
          variant='h2'
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          서비스 안내
        </Typography>
        <Typography variant='h6' sx={{ color: 'text.secondary', mb: 1 }}>
          입찰 횟수가 많아도, 체계적 관리로 안심!
        </Typography>
        <Typography
          variant='body1'
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          체르토는 입찰 기일, 입찰 진행 현황, 결과 등 주요 정보를 포함해 입찰
          현황을 체계적으로 관리하고 과거 입찰 기록을 제공합니다. 저장된
          데이터를 활용해 입찰 경력을 세우고, 보다 나은 낙찰 성과를 준비해
          보세요.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: 2,
        }}
      >
        <div>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: '100%',
                    width: '100%',
                    '&:hover': {
                      backgroundColor: (theme.vars || theme).palette.action
                        .hover,
                    },
                  }),
                  selectedItemIndex === index && {
                    backgroundColor: 'action.selected',
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'left',
                      gap: 1,
                      textAlign: 'left',
                      textTransform: 'none',
                      color: 'text.secondary',
                    },
                    selectedItemIndex === index && {
                      color: 'text.primary',
                    },
                  ]}
                >
                  {icon}

                  <Typography variant='h4'>{title}</Typography>
                  <Typography variant='body2'>{description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <MobileLayout
            selectedItemIndex={selectedItemIndex}
            handleItemClick={handleItemClick}
            selectedFeature={selectedFeature}
          />
        </div>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: { xs: '100%', md: '70%' },
            height: 'var(--items-image-height)',
          }}
        >
          <Card
            variant='outlined'
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={(theme) => ({
                m: 'auto',
                width: 420,
                height: 500,
                backgroundSize: 'contain',
                backgroundImage: 'var(--items-imageLight)',
                ...theme.applyStyles('dark', {
                  backgroundImage: 'var(--items-imageDark)',
                }),
              })}
              style={
                items[selectedItemIndex]
                  ? ({
                      '--items-imageLight': items[selectedItemIndex].imageLight,
                      '--items-imageDark': items[selectedItemIndex].imageDark,
                    } as React.CSSProperties)
                  : {}
              }
            />
          </Card>
        </Box>
      </Box>
    </Container>
  )
}
