"use client";
import * as React from 'react';
import Divider from '@mui/material/Divider';
import Headline from '@/components/marketing-page/components/Headline';
import { Typography } from '@mui/material';
import FAQ from '@/components/marketing-page/components/FAQ';

export default function FaqPage() {
  return (
    <>
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
    </>
  );
}
