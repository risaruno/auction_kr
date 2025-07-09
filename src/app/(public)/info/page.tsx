'use client'
import Divider from '@mui/material/Divider'
import Headline from '@/components/marketing-page/components/Headline'
import { Container, Typography } from '@mui/material'
import Timeline from '@/components/marketing-page/components/Timeline'

export default function InfoPage() {
  return (
    <Container maxWidth='lg'>
      <Headline
        headline={
          <Typography
            variant='h3'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            <Typography
              component='span'
              variant='h3'
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
            &nbsp;대리입찰&nbsp;이용안내
          </Typography>
        }
      />
      <Divider />
      <Timeline />
    </Container>
  )
}
