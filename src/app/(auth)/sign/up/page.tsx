"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
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
import AppTheme from "@/components/shared-theme/AppTheme";
import AppAppBar from "@/components/marketing-page/components/AppAppBar";
import Footer from "@/components/marketing-page/components/Footer";
import { SitemarkIcon } from "@/components/sign-in/components/CustomIcons";
import Alert from "@mui/material/Alert";
import { signup, FormState } from "@/app/api/auth/sign/actions";

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

// A component to get the form's pending status
function SignUpButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" fullWidth variant="contained" disabled={pending}>
      {pending ? "가입 중..." : "가입하기"}
    </Button>
  )
}

export default function SignUp() {
  const router = useRouter();
  
  // Initialize useFormState to manage the response from the server action
  const initialState: FormState = { error: null, message: null }
  const [state, formAction] = useFormState(signup, initialState)

  return (
    <>
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
            action={formAction}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            {state.error && <Alert severity="error">{state.error}</Alert>}
            {state.message && <Alert severity="success">{state.message}</Alert>}

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
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <TextField
                name="password"
                placeholder="8-16자 사이로 입력해주세요"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <SignUpButton />
            <Divider>or</Divider>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => router.push("/sign/in")}
              disabled={!!state.message} // Disable after successful signup
            >
              로그인
            </Button>
          </Box>
        </Card>
      </SignContainer>
    </>
  );
}
