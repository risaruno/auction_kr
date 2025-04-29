"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../../shared-theme/AppTheme';
import AppAppBar from '../../marketing-page/components/AppAppBar';
import CancelPolicy from '../../marketing-page/components/CancelPolicy';
import Footer from '@/marketing-page/components/Footer';
import Headline from '@/marketing-page/components/Headline';
import { Typography } from '@mui/material';
import Timeline from '@/marketing-page/components/Timeline';

export default function InfoPage() {
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
            <Typography
              component="span"
              variant="h3"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: "primary.light",
                }),
              })}
            >
              쎄르토
            </Typography>
            &nbsp;대리입찰&nbsp;이용안내
          </Typography>}
        />
        <Divider />
        <Timeline />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
