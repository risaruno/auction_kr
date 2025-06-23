"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../../../shared-theme/AppTheme";
import AppAppBar from "@/marketing-page/components/AppAppBar";
import Footer from "@/marketing-page/components/Footer";
import { SitemarkIcon } from "../../../sign-in/components/CustomIcons";
import Alert from "@mui/material/Alert";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
}));

const SignContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // This effect runs once on page load to capture the token from the URL
  React.useEffect(() => {
    // The token is in the URL hash fragment, e.g., #access_token=...&...
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // remove the '#'
    const token = params.get("access_token");

    if (token) {
      setAccessToken(token);
    } else {
      setError(
        "Invalid or missing password reset token. Please request a new link."
      );
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!accessToken) {
      setError(
        "Missing access token. Please use the link from your email again."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, newPassword: password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password.");
      }

      setMessage("Password updated successfully! Redirecting to login...");

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <SignContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            새 비밀번호 설정
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <FormControl>
              <FormLabel htmlFor="password">새 비밀번호</FormLabel>
              <TextField
                id="password"
                type="password"
                name="password"
                placeholder="••••••"
                autoFocus
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirmPassword">새 비밀번호 확인</FormLabel>
              <TextField
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••"
                required
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !accessToken || !!message}
            >
              {loading ? "변경 중..." : "비밀번호 변경하기"}
            </Button>
          </Box>
        </Card>
      </SignContainer>
      <Divider />
      <Footer />
    </AppTheme>
  );
}
