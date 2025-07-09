import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

// Timeline-related imports
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'

// Icon imports
import { LocationOn, Paid, Description, Gavel } from '@mui/icons-material'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PeopleIcon from '@mui/icons-material/People'

// Data for the top feature cards
const features = [
  {
    icon: <LocationOn color='primary' />,
    title: '서비스 지역',
    description: '전국 법원',
  },
  {
    icon: <Paid color='primary' />,
    title: '이용요금',
    description: '11만원',
    subDescription: '입찰기일 D-1 신청시 154,000원',
  },
  {
    icon: <Description color='primary' />,
    title: '서비스 내용',
    description: ['입찰관련 서류 작성', '대리입찰참여', '입찰결과 안내'],
  },
]

// Data for the timeline steps
const timelineSteps = [
  {
    actor: '고객',
    title: '1. 입찰정보 작성',
    description: '입찰사건을 조회하고 정보를 입력합니다.',
    icon: <AssignmentIndIcon />,
  },
  {
    actor: '체르또',
    title: '2. 전자계약서 발행',
    description: '보안과 안전한 입찰을 위한 전자계약서 제공',
    icon: <Description />,
  },
  {
    actor: '고객',
    title: '3. 전자서명 / 수수료 결제',
    description: '법적 구속력있는 대리입찰 프로세스 보장',
    icon: <RequestQuoteIcon />,
  },
  {
    actor: '체르또',
    title: '4. 서류 작성 / 전담 체르또 제공',
    description: '배정된 입찰 전문가가 입찰관련 서류 작성',
    icon: <PeopleIcon />,
  },
  {
    actor: '고객',
    title: '5. 전자본인서명확인서 업로드 / 보증금 입금',
    description: '대리입찰을 위한 전자본인서명확인서 및 보증금 입금',
    icon: <UploadFileIcon />,
  },
]

export default function Features() {
  return (
    <Container sx={{ py: { xs: 4, sm: 8 } }}>

      {/* Top Feature Cards Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 4,
          mb: 8,
        }}
      >
        {features.map((feature) => (
          <Card key={feature.title} sx={{ textAlign: 'center', boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'primary.light',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {React.cloneElement(feature.icon, { sx: { fontSize: 40 } })}
              </Box>
              <Typography
                variant='h6'
                component='h3'
                sx={{ fontWeight: '600', mb: 1 }}
              >
                {feature.title}
              </Typography>
              {Array.isArray(feature.description) ? (
                <Box sx={{ textAlign: 'left', display: 'inline-block' }}>
                  {feature.description.map((item) => (
                    <Typography key={item} component='div' sx={{ mt: 0.5 }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography>{feature.description}</Typography>
              )}
              {feature.subDescription && (
                <Typography
                  color='text.secondary'
                  sx={{ mt: 1, fontSize: '0.875rem' }}
                >
                  {feature.subDescription}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* CTA Banner */}
      <Box
        sx={{
          backgroundColor: '#34495e',
          color: 'white',
          textAlign: 'center',
          py: 4,
          px: 2,
          my: 8,
          borderRadius: 2,
          boxShadow: 5,
        }}
      >
        <Typography variant='h5' component='p' sx={{ fontWeight: 'bold' }}>
          복잡하고 번거로운 작업은 체르또에게 맡기세요.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          딱 5분, 입찰자님은 꼭 필요한 일만 하세요.
        </Typography>
      </Box>

      {/* Timeline Section */}
      <Timeline position='alternate'>
        {timelineSteps.map((step, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent sx={{ m: 'auto 0' }}>
              {step.actor === '고객' && (
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    transition: 'box-shadow 0.3s',
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  <Typography
                    variant='h6'
                    component='h4'
                    sx={{ fontWeight: 'bold' }}
                  >
                    {step.title}
                  </Typography>
                  <Typography>{step.description}</Typography>
                </Paper>
              )}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot
                color={step.actor === '고객' ? 'primary' : 'secondary'}
                variant='filled'
              >
                {step.icon}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ m: 'auto 0' }}>
              {step.actor === '체르또' && (
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    transition: 'box-shadow 0.3s',
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  <Typography
                    variant='h6'
                    component='h4'
                    sx={{ fontWeight: 'bold' }}
                  >
                    {step.title}
                  </Typography>
                  <Typography>{step.description}</Typography>
                </Paper>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
        {/* Final Step */}
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot
              sx={{
                width: 100,
                height: 100,
                backgroundColor: 'success.main',
                boxShadow: '0 0 15px rgba(76, 175, 80, 0.8)',
              }}
            >
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Gavel sx={{ fontSize: 32 }} />
                <Typography sx={{ fontWeight: 'bold' }}>입찰 기일</Typography>
              </Box>
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent />
        </TimelineItem>
      </Timeline>
    </Container>
  )
}
