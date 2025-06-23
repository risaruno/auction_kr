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
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Call the backend API route for sign-up
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Sign-up failed. Please try again.");
      }

      // On successful sign-up, show the confirmation message
      setMessage(result.message);
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
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            회원가입
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
            {message && <Alert severity="success">{message}</Alert>}

            <FormControl>
              <FormLabel htmlFor="name">이름</FormLabel>
              <TextField
                id="name"
                type="text"
                name="name"
                placeholder="홍길동"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">이메일</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
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
                placeholder="6자 이상 입력해주세요"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !!message} // Disable button while loading or after success
            >
              {loading ? "가입 중..." : "가입하기"}
            </Button>
            <Divider>or</Divider>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => router.push("/sign-in")}
            >
              로그인
            </Button>
          </Box>
        </Card>
      </SignContainer>
      <Divider />
      <Footer />
    </AppTheme>
  );
}
