"use client";
import React from "react";
import { Box, CssBaseline, Toolbar, Container } from "@mui/material";
import { RequireAuth } from "@/components/auth/RequireAuth";
import UserSidebar from "@/app/auth/user/UserSidebar";
import UserAppBar from "@/app/auth/user/UserAppBar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <UserAppBar />
        <UserSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "grey.50",
            minHeight: "100vh",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg">{children}</Container>
        </Box>
      </Box>
    </RequireAuth>
  );
}
