'use client'

import React, { useState } from 'react'
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert, Box, Typography } from '@mui/material'
import { inviteUser, InviteUserState } from '@/app/api/admin/invite/actions'

const initialState: InviteUserState = {
  error: null,
  message: null
}

export default function InviteUserForm() {
  const [state, setState] = useState<InviteUserState>(initialState)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('role', role)
    
    try {
      const result = await inviteUser(initialState, formData)
      setState(result)
      
      if (!result.error) {
        // Reset form on success
        setEmail('')
        setRole('user')
      }
    } catch (error) {
      setState({
        error: `초대 처리 중 오류가 발생했습니다. ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        message: null
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        사용자 초대
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        새로운 사용자를 Certo 플랫폼에 초대합니다. 초대된 사용자에게 이메일이 발송됩니다.
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {state.message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {state.message}
        </Alert>
      )}

      <TextField
        fullWidth
        label="이메일 주소"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{ mb: 2 }}
        placeholder="user@example.com"
        helperText="초대할 사용자의 이메일 주소를 입력하세요"
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>역할</InputLabel>
        <Select
          value={role}
          label="역할"
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="user">일반 사용자</MenuItem>
          <MenuItem value="expert">전문가</MenuItem>
          <MenuItem value="admin">관리자</MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || !email}
        sx={{ py: 1.5 }}
      >
        {loading ? '초대 중...' : '초대 이메일 발송'}
      </Button>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>안내:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>초대 링크는 7일 후에 만료됩니다</li>
          <li>초대된 사용자는 이메일을 통해 계정을 생성할 수 있습니다</li>
          <li>이미 가입된 이메일로는 초대를 보낼 수 없습니다</li>
        </Typography>
      </Box>
    </Box>
  )
}
