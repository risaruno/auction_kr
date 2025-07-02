'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  CssBaseline,
  Divider,
  Step,
  Stepper,
  StepLabel,
  Typography,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import { createClient } from '@/utils/supabase/client';
import CaseFind from './components/CaseFind';
import InputForm from './components/InputForm';
import ContractSign from './components/ContractSign';
import PaymentForm from './components/PaymentForm';
import Review from './components/Review';
import { FormData, InitialFormData } from '@/interfaces/FormData';
import { applyBid } from '@/app/api/apply-bid/actions';
import { 
  getValidationForStep, 
  ValidationError,
  validateCaseFind,
  validateInputForm,
  validateContractSign,
  validatePaymentForm,
  validateReview 
} from '@/utils/validation';

const steps = ['사건조회', '입찰정보작성', '전자계약', '수수료결제', '내용확인'];

export default function ApplyBid() {
  const router = useRouter();
  const supabase = createClient();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(InitialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // State for handling the final submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }> | 
    { target: { name: string; value: any } }
  ) => {
    const { name, value, type } = event.target as HTMLInputElement;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? (event.target as HTMLInputElement).checked
            : value,
      }));
      
      // Clear validation errors for this field when user starts typing
      setValidationErrors(prev => prev.filter(error => error.field !== name));
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear validation errors for this field when data is updated
    setValidationErrors(prev => prev.filter(error => error.field !== field));
  };

  const validateCurrentStep = (step: number): boolean => {
    const validate = getValidationForStep(step);
    const result = validate(formData);
    
    setValidationErrors(result.errors);
    
    if (!result.isValid) {
      // Scroll to first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('[data-error="true"]');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
    
    return result.isValid;
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CaseFind
            caseResult={formData.caseResult}
            setCaseResult={(r) => updateFormData('caseResult', r)}
          />
        );
      case 1:
        return (
          <InputForm
            formData={formData}
            handleFormChange={handleFormChange}
            updateFormData={updateFormData}
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <ContractSign
            formData={formData}
            setSignature={(s) => updateFormData('signature', s)}
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
        return (
          <Review 
            formData={formData} 
          />
        );
      default:
        throw new Error('Unknown step');
    }
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep(activeStep)) {
      return;
    }

    if (activeStep === steps.length - 1) {
      // Final submission
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        if (formData.caseResult === null) {
          throw new Error('사건 조회가 필요합니다. 사건을 먼저 조회해주세요.');
        }

        const result = await applyBid(session.access_token, formData);
        if (result.error) {
          throw new Error(result.error);
        }

        // Move to the "Thank You" screen on success
        setActiveStep(activeStep + 1);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An unknown error occurred.'
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setValidationErrors([]); // Clear validation errors when going back
  };

  const getNextButtonText = () => {
    switch (activeStep) {
      case 0: return '다음: 입찰정보 작성';
      case 1: return '다음: 전자계약';
      case 2: return '다음: 수수료 결제';
      case 3: return '다음: 최종 확인';
      case 4: return isSubmitting ? '신청 중...' : '신청 완료';
      default: return '다음';
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return formData.caseResult?.data != null;
      case 1: return formData.bidAmt && formData.bidderName;
      case 2: return formData.signature != null;
      case 3: return formData.termsChecked;
      default: return true;
    }
  };

  return (
    <>
      <Grid
        size={{ sm: 12, md: 7, lg: 8 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          width: '100%',
          backgroundColor: { xs: 'transparent', sm: 'background.default' },
          alignItems: 'center',
          pt: { xs: 0, sm: 16 },
          px: { xs: 2, sm: 10 },
          gap: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: { sm: 'space-between', md: 'flex-end' },
            alignItems: 'center',
            width: '100%',
            maxWidth: { sm: '100%', md: 800 },
          }}
        >
          <Stepper
            id="desktop-stepper"
            activeStep={activeStep}
            sx={{
              width: '100%',
              height: 40,
              display: { xs: 'none', md: 'flex' },
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
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            maxWidth: { sm: '100%', md: 800 },
            gap: { xs: 5, md: 'none' },
          }}
        >
          {activeStep === steps.length ? (
            <Stack spacing={2} useFlexGap>
              <Typography variant="h1">📦</Typography>
              <Typography variant="h5">신청이 완료되었습니다!</Typography>
              <Typography variant="body1" color="text.secondary">
                신청 내역은 마이페이지에서 확인하실 수 있습니다.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/auth/user/history')}
                sx={{ mt: 3, alignSelf: 'center' }}
              >
                마이페이지로 이동
              </Button>
            </Stack>
          ) : (
            <React.Fragment>
              {/* Display validation errors */}
              {validationErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2" component="div">
                    다음 항목을 확인해주세요:
                  </Typography>
                  <ul>
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Display submission error on final step */}
              {activeStep === steps.length - 1 && submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
              )}

              {getStepContent(activeStep)}

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  justifyContent: activeStep !== 0 ? 'space-between' : 'flex-end',
                  alignItems: 'center',
                  flexGrow: 1,
                  gap: 1,
                  pb: { xs: 12, sm: 0 },
                  mt: { xs: 2, sm: 0 },
                  mb: '60px',
                }}
              >
                {activeStep !== 0 && (
                  <Button
                    onClick={handleBack}
                    variant="text"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    이전
                  </Button>
                )}

                <Button
                  variant="contained"
                  endIcon={null}
                  onClick={handleNext}
                  disabled={isSubmitting}
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                >
                  {getNextButtonText()}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Box>
      </Grid>
    </>
  );
}
