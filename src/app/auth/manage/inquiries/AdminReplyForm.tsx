// file: components/AdminReplyForm.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material'

interface AdminReplyFormProps {
  inquiryId: string;
  adminId: string;
  onSuccess: () => void;
}

export default function AdminReplyForm({ inquiryId, adminId, onSuccess }: AdminReplyFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!content.trim()) {
      setError('Reply message cannot be empty.')
      setLoading(false)
      return
    }

    try {
      // Langkah 1: Masukkan pesan balasan dari admin
      const { error: messageError } = await supabase
        .from('inquiry_messages')
        .insert({
          inquiry_id: inquiryId,
          sender_id: adminId,
          sender_role: 'admin', // Peran pengirim adalah 'admin'
          content: content,
        })

      if (messageError) throw messageError

      // Langkah 2: Update status pertanyaan menjadi "Answered"
      const { error: inquiryError } = await supabase
        .from('inquiries')
        .update({ status: 'Answered' })
        .eq('id', inquiryId)

      if (inquiryError) throw inquiryError

      // Langkah 3: Jika semua berhasil, panggil onSuccess
      onSuccess()

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit reply.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="답변 내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fullWidth
        required
        multiline
        rows={4}
        margin="normal"
        placeholder="답변 내용을 입력하세요..."
        autoFocus // Otomatis fokus ke textfield saat muncul
      />

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={loading || !content.trim()}>
          {loading ? <CircularProgress /> : '답변 제출'}
        </Button>
      </Box>
    </Box>
  )
}