"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "@/components/shared-theme/AppTheme";
import Footer from "@/components/marketing-page/components/Footer";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <AppTheme>
      <CssBaseline />
      {props.children}
      <Divider />
      <Footer />
    </AppTheme>
  );
}
