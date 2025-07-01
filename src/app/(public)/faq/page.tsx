"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '@/shared-theme/AppTheme';
import AppAppBar from '@/marketing-page/components/AppAppBar';
import Footer from '@/marketing-page/components/Footer';
import Headline from '@/marketing-page/components/Headline';
import { Typography } from '@mui/material';
import FAQ from '@/marketing-page/components/FAQ';

export default function FaqPage() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <div>
        <Headline headline={
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
          >
            자주하는 질문
          </Typography>}
        />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
