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
import AppTheme from "../../../shared-theme/AppTheme";
import AppAppBar from "@/marketing-page/components/AppAppBar";
import Footer from "@/marketing-page/components/Footer";
import { SitemarkIcon } from "../../../sign-in/components/CustomIcons";
import Alert from "@mui/material/Alert";
import { updatePassword, FormState } from "../actions";

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

// A component to get the form's pending status
function UpdatePasswordButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" fullWidth variant="contained" disabled={pending}>
      {pending ? "변경 중..." : "비밀번호 변경하기"}
    </Button>
  )
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  
  // Initialize useFormState to manage the response from the server action
  const initialState: FormState = { error: null, message: null }
  const [state, formAction] = useFormState(updatePassword, initialState)

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
            action={formAction}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {state.error && <Alert severity="error">{state.error}</Alert>}
            {state.message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {state.message}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push('/sign/in')}
                  sx={{ mt: 2, width: '100%' }}
                >
                  로그인 페이지로 이동
                </Button>
              </Alert>
            )}

            {!state.message && (
              <>
                <FormControl>
                  <FormLabel htmlFor="newPassword">새 비밀번호</FormLabel>
                  <TextField
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="8-16자 사이로 입력해주세요"
                    autoFocus
                    required
                    fullWidth
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="confirmPassword">새 비밀번호 확인</FormLabel>
                  <TextField
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="비밀번호를 다시 입력해주세요"
                    required
                    fullWidth
                  />
                </FormControl>
                <UpdatePasswordButton />
              </>
            )}
          </Box>
        </Card>
      </SignContainer>
      <Divider />
      <Footer />
    </AppTheme>
  );
}
