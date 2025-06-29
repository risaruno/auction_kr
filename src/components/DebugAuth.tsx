"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Box, Typography, Button, Popover } from "@mui/material";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function DebugAuth() {
  const { user, loading, signOut, refreshUser } = useAuth();
  const [rawSession, setRawSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setRawSession(session);
    };
    checkSession();
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleClearAuth = async () => {
    const supabase = createClient();

    // Clear all Supabase auth data
    await supabase.auth.signOut();

    // Clear localStorage and sessionStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();

      // Force page reload
      window.location.reload();
    }
  };

  const handleManualLogout = async () => {
    await signOut();
  };

  const handleRefreshAuth = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setRawSession(session);

    // Also refresh the AuthContext
    await refreshUser();
  };

  const [debugMenuAnchor, setDebugMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleDebugMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDebugMenuAnchor(event.currentTarget);
  };

  const handleDebugMenuClose = () => {
    setDebugMenuAnchor(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleDebugMenuOpen}
        sx={{ color: "warning.main", borderColor: "warning.main" }}
      >
        Debug
      </Button>
      <Popover
        anchorEl={debugMenuAnchor}
        open={Boolean(debugMenuAnchor)}
        onClose={handleDebugMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ backgroundColor: "#ffffff20"}}
      >
        <Box sx={{ p: 2, width: "350px", height: "400px", backgroundColor: "#ffffff20" }}>
          <Typography variant="h6" color="error">
            DEBUG: Auth State
          </Typography>
          <Typography variant="body2">
            Loading: {loading ? "true" : "false"}
          </Typography>
          <Typography variant="body2">
            User: {user ? "logged in" : "not logged in"}
          </Typography>
          {user && (
            <>
              <Typography variant="body2">Email: {user.email}</Typography>
              <Typography variant="body2">Role: {user.admin_role}</Typography>
              <Typography variant="body2">ID: {user.id}</Typography>
            </>
          )}

          <Typography variant="body2" sx={{ mt: 1 }}>
            Raw Session: {rawSession ? "exists" : "null"}
          </Typography>
          {rawSession && (
            <Typography variant="body2" sx={{ fontSize: "0.7rem" }}>
              Session User: {rawSession.user?.email || "no email"}
            </Typography>
          )}

          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRefreshAuth}
              color="info"
            >
              Refresh Auth
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleManualLogout}
              color="warning"
            >
              Manual Logout
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearAuth}
              color="error"
            >
              Clear All Auth
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
