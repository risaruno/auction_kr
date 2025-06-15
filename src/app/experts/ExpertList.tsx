'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'

interface Expert {
  id: number
  name: string
  // Add other expert properties
}

interface ExpertListProps {
  experts: Expert[] | null
}

export default function ExpertList({ experts }: ExpertListProps) {
  if (!experts) return null

  return (
    <Box>
      {experts.map((expert) => (
        <Box key={expert.id}>
          <Typography>{expert.name}</Typography>
        </Box>
      ))}
    </Box>
  )
}