"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import AppTheme from "../../shared-theme/AppTheme";
import AppAppBar from "@/marketing-page/components/AppAppBar";
import Footer from "@/marketing-page/components/Footer";
import CaseFind from "./components/CaseFind";
import InputForm from "./components/InputForm";
import ContractSign from "./components/ContractSign";
import PaymentForm from "./components/PaymentForm";
import Review from "./components/Review";
import { FormData, InitialFormData } from "@/interfaces/FormData";
import { supabase } from "../../utils/supabase";

const steps = [
  "사건조회",
  "입찰정보작성",
  "전자계약",
  "수수료결제",
  "내용확인",
];

export default function ApplyBid() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>(InitialFormData);

  // State for handling the final submission
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // --- All your state handlers (handleFormChange, updateFormData) remain the same ---
  const handleFormChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value, type } = event.target as HTMLInputElement;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (event.target as HTMLInputElement).checked
            : value,
      }));
    }
  };

  // FIX: Changed the signature to match the type expected by the child components' props.
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CaseFind
            caseResult={formData.caseResult}
            setCaseResult={(r) => updateFormData("caseResult", r)}
          />
        );
      case 1:
        return (
          <InputForm
            formData={formData}
            handleFormChange={handleFormChange}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <ContractSign
            formData={formData}
            setSignature={(s) => updateFormData("signature", s)}
          />
        );
      case 3:
        return (
          <PaymentForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        );
      case 4:
        return <Review formData={formData} />;
      default:
        throw new Error("Unknown step");
    }
  };

  const handleNext = async () => {
    // If we are on the last step (Review page), submit the form.
    if (activeStep === steps.length - 1) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("User not authenticated");

        const response = await fetch("/api/bids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.error || "An error occurred during submission."
          );
        }

        // Move to the "Thank You" screen on success
        setActiveStep(activeStep + 1);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "An unknown error occurred."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Otherwise, just go to the next step
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AppAppBar />
        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            width: "100%",
            backgroundColor: { xs: "transparent", sm: "background.default" },
            alignItems: "center",
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: { sm: "space-between", md: "flex-end" },
              alignItems: "center",
              width: "100%",
              maxWidth: { sm: "100%", md: 800 },
            }}
          >
            <Stepper
              id="desktop-stepper"
              activeStep={activeStep}
              sx={{
                width: "100%",
                height: 40,
                display: { xs: "none", md: "flex" },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              maxWidth: { sm: "100%", md: 800 },
              gap: { xs: 5, md: "none" },
            }}
          >
            {activeStep === steps.length ? (
              <Stack spacing={2} useFlexGap>
                <Typography variant="h1">📦</Typography>
                <Typography variant="h5">신청이 완료되었습니다!</Typography>
                <Typography variant="body1" color="text.secondary">
                  신청 내역은 마이페이지에서 확인하실 수 있습니다.
                </Typography>
              </Stack>
            ) : (
              <React.Fragment>
                {/* Display submission error on the last step if it exists */}
                {activeStep === steps.length - 1 && submitError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                  </Alert>
                )}

                {getStepContent(activeStep)}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column-reverse", sm: "row" },
                    alignItems: "end",
                    flexGrow: 1,
                    gap: 1,
                    pb: { xs: 12, sm: 0 },
                    mt: { xs: 2, sm: 0 },
                    mb: "60px",
                    justifyContent:
                      activeStep !== 0 ? "space-between" : "flex-end",
                  }}
                >
                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="text"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={handleNext}
                    disabled={isSubmitting} // Disable button while submitting
                    sx={{ width: { xs: "100%", sm: "fit-content" } }}
                  >
                    {activeStep === steps.length - 1
                      ? isSubmitting
                        ? "제출 중..."
                        : "제출하기"
                      : "다음"}
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </Box>
      </Grid>
      <Footer />
    </AppTheme>
  );
}
