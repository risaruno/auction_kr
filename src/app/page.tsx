"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "@/components/shared-theme/AppTheme";
import AppAppBar from "@/components/marketing-page/components/AppAppBar";
import Hero from "@/components/marketing-page/components/Hero";
import Highlights from "@/components/marketing-page/components/Highlights";
import Features from "@/components/marketing-page/components/Features";
import Testimonials from "@/components/marketing-page/components/Testimonials";
import Footer from "@/components/marketing-page/components/Footer";
import DebugAuth from "@/components/DebugAuth";

export default function Home() {
  return (
    <>
      <CssBaseline />
      <AppAppBar />
      <Hero />
      <Features />
      <Divider />
      <Highlights />
      {/* <Divider />
      // <Testimonials />
      // <Divider />
      // <Apply /> */}
      <Divider />
      <Footer />
    </>
  );
}
