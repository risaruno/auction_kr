"use client";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppAppBar from "@/components/marketing-page/components/AppAppBar";
import Hero from "@/components/marketing-page/components/Hero";
import Footer from "@/components/marketing-page/components/Footer";

export default function Home() {
  return (
    <>
      <CssBaseline />
      <AppAppBar />
      <Hero />
      {/* <Features />
      <Divider />
      <Highlights /> */}
      {/* <Divider />
      // <Testimonials />
      // <Divider />
      // <Apply /> */}
      <Divider />
      <Footer />
    </>
  );
}
