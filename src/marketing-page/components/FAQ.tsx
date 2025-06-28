'use client'
import * as React from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { faqsApi } from '@/utils/api-client'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// 1. Define an interface for a single FAQ item to ensure type safety.
// Note: The property names match your 'faqs' database table.
interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export default function FAQ() {
  const [expanded, setExpanded] = React.useState<string | false>(false)
  const [faqs, setFaqs] = React.useState<FAQItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // 2. Use useEffect to fetch data from your API when the component mounts.
  React.useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const response = await faqsApi.getFaqs({ published: true })
        
        if (response.success && response.data) {
          setFaqs(response.data as any) // Type assertion for compatibility
        } else {
          throw new Error(response.error || 'Failed to load FAQs')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, []) // The empty dependency array ensures this runs only once.

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  return (
    <Container
      id='faq'
      sx={{
        pt: 2,
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Box sx={{ width: '100%' }}>
        {/* 3. Add loading and error states for a better user experience. */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity='error' sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        {!loading &&
          !error &&
          faqs.map((faq) => (
            // 4. Map over the fetched 'faqs' state to render the accordions.
            <Accordion
              key={faq.id}
              expanded={expanded === `panel-${faq.id}`}
              onChange={handleChange(`panel-${faq.id}`)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${faq.id}-content`}
                id={`panel-${faq.id}-header`}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    component='span'
                    sx={{
                      width: { sm: 120 },
                      flexShrink: 0,
                      color: 'text.secondary',
                    }}
                  >
                    [{faq.category}]
                  </Typography>
                  {/* Use 'question' from the database */}
                  <Typography component='span' sx={{ fontWeight: 'bold' }}>
                    {faq.question}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Use 'answer' from the database */}
                <Typography
                  sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
    </Container>
  )
}
