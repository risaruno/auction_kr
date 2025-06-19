"use client";
import * as React from 'react';
import AppAppBar from '@/marketing-page/components/AppAppBar';
import CancelPolicy from '@/marketing-page/components/CancelPolicy';
import Footer from '@/marketing-page/components/Footer';
import AppTheme from '@/shared-theme/AppTheme';
import { CssBaseline, Divider } from '@mui/material';
import ServiceHistory from './ServiceHistory';

export default function AboutPage() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <div>
        <ServiceHistory />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
