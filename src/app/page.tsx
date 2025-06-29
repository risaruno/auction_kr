"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from '../marketing-page/components/AppAppBar';
import Hero from '../marketing-page/components/Hero';
import Highlights from '../marketing-page/components/Highlights';
import Features from '../marketing-page/components/Features';
import Testimonials from '../marketing-page/components/Testimonials';
import Footer from '../marketing-page/components/Footer';

export default function Home() {
  return (
    <AppTheme>
      <CssBaseline />
      <AppAppBar />
      <Hero />
      {/* <Features />
      <Divider />
      <Highlights />
      <Divider />
      <Testimonials />
      <Divider />
      <Apply /> */}
      <Divider />
      <Footer />
    </AppTheme>
  );
}
