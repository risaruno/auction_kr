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
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import AppTheme from "../../shared-theme/AppTheme";
import AppAppBar from "@/marketing-page/components/AppAppBar";
import Footer from "@/marketing-page/components/Footer";
import CaseFind from "@/checkout/components/CaseFind";
import InputForm from "@/checkout/components/InputForm";
import ContractSign from "@/checkout/components/ContractSign";
import PaymentForm from "@/checkout/components/PaymentForm";
import Review from "@/checkout/components/Review";
import { CaseResult } from "@/interfaces/CaseResult";
import { FormData, InitialFormData } from "@/interfaces/FormData";

const steps = [
  "사건조회",
  "입찰정보작성",
  "전자계약",
  "수수료결제",
  "내용확인",
];

export default function ApplyBid() {
  const [activeStep, setActiveStep] = React.useState(0);

  // The complete, centralized state for the entire multi-step form
  const [formData, setFormData] = React.useState<FormData>(InitialFormData);

  const handleFormChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value, type } = event.target as HTMLInputElement;
    if (name) {
      setFormData((prevData) => ({
        ...prevData,
        [name]:
          type === "checkbox"
            ? (event.target as HTMLInputElement).checked
            : value,
      }));
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CaseFind
            caseResult={formData.caseResult}
            setCaseResult={(result) => updateFormData("caseResult", result)}
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
            setSignature={(sig) => updateFormData("signature", sig)}
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
        // Pass the entire formData object to the Review component for display
        return <Review formData={formData} />;
      default:
        throw new Error("Unknown step");
    }
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
    // If it's the last step, log the final data
    if (activeStep === steps.length - 1) {
      console.log("Submitting Final Form Data:", formData);
      // Here you would make your final API call to the backend
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
                <Typography variant="h5">신청해주셔서 감사합니다!</Typography>
              </Stack>
            ) : (
              <React.Fragment>
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
                    sx={{ width: { xs: "100%", sm: "fit-content" } }}
                  >
                    {activeStep === steps.length - 1 ? "제출하기" : "다음"}
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
