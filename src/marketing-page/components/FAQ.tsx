'use client'
import * as React from 'react'
import { useState, useEffect } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { 
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq 
} from '@/app/faq/actions'
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
  const [expanded, setExpanded] = useState<string | false>(false)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // 2. Use useEffect to fetch data from your API when the component mounts.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await fetchFaqs({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          sortBy: 'created_at',
          sortOrder: 'desc',
        })
        setFaqs(result.data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
