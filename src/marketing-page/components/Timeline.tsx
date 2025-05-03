import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import MuiChip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import { styled } from '@mui/material/styles'
import Timeline from '@mui/lab/Timeline'
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import LaptopMacIcon from '@mui/icons-material/LaptopMac'
import HotelIcon from '@mui/icons-material/Hotel'
import RepeatIcon from '@mui/icons-material/Repeat'
import Typography from '@mui/material/Typography'
import { ButtonGroup } from '@mui/material'

import { Paid, LocationOn, Description } from '@mui/icons-material'

export default function Features() {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mx: 24,
          my: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          height: 'auto',
          '& .MuiBox-root': {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
          '& .MuiButton-root': {
            flex: 1,
            fontSize: '1.25rem',
            padding: '12px 24px',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            color: 'white',
          },
        }}
      >
        <Box>
          <Button
            key="area"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <LocationOn sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" component="span">
              서비스 지역
            </Typography>
          </Button>
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>전국 법원</TimelineContent>
            </TimelineItem>
          </Timeline>
        </Box>
        <Box>
          <Button
            key="usage"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Paid sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" component="span">
              이용요금
            </Typography>
          </Button>
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>10만원</TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>입찰기일 D-1 신청시 14만원</TimelineContent>
            </TimelineItem>
          </Timeline>
        </Box>
        <Box>
          <Button
            key="content"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Description sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" component="span">
              서비스 내용
            </Typography>
          </Button>
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>입찰관련 서류 작성</TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>대리입찰참여</TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>입찰결과 안내</TimelineContent>
            </TimelineItem>
          </Timeline>
        </Box>
      </Box>
      <Timeline sx={{ backgroundColor: 'grey.200', mt: 4 }}>
        <TimelineItem>
          <TimelineOppositeContent align="right" variant="h4" color="text.main">
            고객
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent align="right" variant="h4" color="text.main">
            쎄르토
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent align="right" variant="h4" color="text.main">
            <Typography variant="h6" component="span">
              1.입찰정보 작성
            </Typography>
            <Typography>입찰사건을 조회하고 정보를 입력합니다.</Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot>
              <FastfoodIcon />
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent align="right" variant="h4" color="text.main">
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color="primary">
              <LaptopMacIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              2. 전자계약서 발행
            </Typography>
            <Typography>보안과 안전한 입찰을 위한 전자계약서 제공</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              3.전자서명/ 수수료 결제
            </Typography>
            <Typography>법적 구속력있는 대리입찰 프로세스 보장</Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color="primary" variant="outlined">
              <HotelIcon />
            </TimelineDot>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            <TimelineDot color="secondary">
              <RepeatIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              4.서류 작성/ 전담 바토너 제공
            </Typography>
            <Typography>배정된 입찰 전문가가 입찰관련 서류 작성</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              5.전자본인서명확인서 업로드/보증금 입금
            </Typography>
            <Typography>대리입찰을 위한 전자본인서명확인서 및 보증금 입금</Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color="primary" variant="outlined">
              <HotelIcon />
            </TimelineDot>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            <TimelineDot color="secondary">
              <RepeatIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            <TimelineDot color="secondary">
              <RepeatIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              6.입찰서류제출
            </Typography>
            <Typography>전문가가 대리참석하여 서류제출</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            <TimelineDot color="secondary">
              <RepeatIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              7.입찰결과 통보
            </Typography>
            <Typography>
              낙찰시
              낙찰 영수증 전달
              패찰시
              보증금 반환 안내
            </Typography>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </>
  )
}
