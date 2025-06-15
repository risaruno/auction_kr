import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

export default function Apply() {
  return (
    <Box
      id="apply"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.400',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h3" gutterBottom>
            체르토에서 경매입찰 전문가를 만나보세요
          </Typography>
          <Typography variant="h6" sx={{ color: 'grey.100' }}>
            대리입찰 서비스 100,000원. 원스톱으로 끝내세요.
            개인,법인,공동 법원 입찰 접수중
          </Typography>
          <Button color="primary" variant="contained" sx={{ fontSize: '1.5rem', mt: 2, p: 4 }}>
            대리입찰 신청하기
          </Button>
        </Box>
      </Container>
    </Box>
  );
}