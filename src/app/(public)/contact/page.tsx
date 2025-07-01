"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '@/components/shared-theme/AppTheme';
import AppAppBar from '@/components/marketing-page/components/AppAppBar';
import CancelPolicy from '@/components/marketing-page/components/CancelPolicy';
import Footer from '@/components/marketing-page/components/Footer';

export default function ContactPage() {
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
