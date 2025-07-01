"use client";
import * as React from 'react';
import AppAppBar from '@/marketing-page/components/AppAppBar';
import CancelPolicy from '@/marketing-page/components/CancelPolicy';
import Footer from '@/marketing-page/components/Footer';
import AppTheme from '@/shared-theme/AppTheme';
import { CssBaseline, Divider } from '@mui/material';

export default function AboutPage() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <div>
        {/* <LogoCollection /> */}
        <CancelPolicy />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
