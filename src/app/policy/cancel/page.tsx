"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../../../shared-theme/AppTheme';
import AppAppBar from '../../../marketing-page/components/AppAppBar';
import CancelPolicy from '../../../marketing-page/components/CancelPolicy';
import Footer from '@/marketing-page/components/Footer';

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
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
