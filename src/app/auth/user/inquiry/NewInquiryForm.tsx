'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Box, Button, TextField, Typography, Alert } from '@mui/material'

interface NewInquiryFormProps {
  userId: string
  onSuccess: () => void
}

export default function NewInquiryForm({ userId, onSuccess }: NewInquiryFormProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.')
      setLoading(false)
      return
    }

    try {
      const { data: inquiryData, error: inquiryError } = await supabase
        .from('inquiries')
        .insert({
          user_id: userId,
          title,
          status: 'Unanswered',
          edited_at: null,
        })
        .select('id')
        .single()

      if (inquiryError) throw inquiryError
      if (!inquiryData) throw new Error('Failed to insert inquiry.')

      const { error: messageError } = await supabase
        .from('inquiry_messages')
        .insert({
          inquiry_id: inquiryData.id,
          sender_id: userId,
          sender_role: 'user',
          content: message,
          edited_at: null,
        })

      if (messageError) throw messageError

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} mt={2}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
        required
        multiline
        rows={4}
        margin="normal"
      />

      <Box mt={2}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
    </Box>
  )
}