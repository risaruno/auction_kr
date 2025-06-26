"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth/AuthProvider"; // Adjust path to your AuthProvider
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
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
import CircularProgress from "@mui/material/CircularProgress";

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
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const SignContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

export default function SignIn() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from context

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);

  // This effect handles the redirection
  React.useEffect(() => {
    // Wait until the initial auth check is complete
    if (!authLoading) {
      if (user) {
        // If user is logged in, redirect them away from the sign-in page
        router.push("/auth/user/history"); // Or '/dashboard', etc.
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Login failed. Please try again.");
      }
      // The onAuthStateChange listener in AuthProvider will handle the redirect,
      // but you could also do it here if needed.
      // router.push("/auth/user/history");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // While checking auth status, show a loading spinner to prevent the form from flashing
  if (authLoading || user) {
    return (
      <AppTheme>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </AppTheme>
    );
  }

  // If auth is checked and there's no user, show the sign-in form
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
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            로그인
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            <FormControl>
              <FormLabel htmlFor="email">이메일</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <TextField
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="이메일 기억하기"
              />
              <Link
                href="/sign/find-password"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                비밀번호 찾기
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={formLoading}
            >
              {formLoading ? "로그인 중..." : "로그인"}
            </Button>
            <Divider>or</Divider>
            <Button
              href="/sign/up"
              type="button"
              fullWidth
              variant="contained"
              color="info"
            >
              가입하기
            </Button>
          </Box>
        </Card>
      </SignContainer>
      <Divider />
      <Footer />
    </AppTheme>
  );
}
