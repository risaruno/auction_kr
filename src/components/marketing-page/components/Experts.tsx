import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ExpertCard from './ExpertCard';

export default function Features() {

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <ExpertCard />
      </Box>
    </Container>
  );
}
