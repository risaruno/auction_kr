import * as React from "react";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FormData } from "@/interfaces/FormData";
import { CaseResult } from "@/interfaces/CaseResult";

// 1. Define the props interface for type safety.
// It includes all the fields we want to display.
interface ReviewProps {
  formData: FormData;
}

export default function Review({ formData }: ReviewProps) {
  // Destructure the formData for easier access in the JSX
  const { caseResult, bidderName, roadAddr, addrDetail, phoneNumber, bidAmt, applicationType } =
    formData;

  // Calculate values for display, with fallbacks for safety
  const depositAmt = caseResult?.data?.depositAmt ?? 0;
  const serviceFee = 100000; // This can be made dynamic if needed

  // Get display information based on application type
  const getDisplayInfo = () => {
    switch (applicationType) {
      case 'personal':
        return {
          name: bidderName,
          phone: phoneNumber,
          address: `${roadAddr} ${addrDetail}`,
        };
      case 'company':
        return {
          name: formData.companyName || '',
          phone: formData.companyPhoneNumber || '',
          address: `${formData.companyRoadAddr || ''} ${formData.companyAddrDetail || ''}`,
          businessInfo: `사업자번호: ${formData.businessNumber || ''}, 대표자: ${formData.representativeName || ''}`,
        };
      case 'group':
        return {
          name: formData.groupRepresentativeName || '',
          phone: phoneNumber,
          address: `${roadAddr} ${addrDetail}`,
          groupInfo: `공동입찰 ${formData.groupMemberCount || 0}명`,
        };
      default:
        return {
          name: bidderName,
          phone: phoneNumber,
          address: `${roadAddr} ${addrDetail}`,
        };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold">
        신청 내역 확인
      </Typography>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="대리입찰 수수료" />
          <Typography variant="body2">
            {serviceFee.toLocaleString()}원
          </Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            primary="보증금 (별도 입금)"
            secondary="낙찰 실패 시 전액 환불됩니다."
          />
          <Typography variant="body2">
            {depositAmt.toLocaleString()}원
          </Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="총 결제 금액" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {serviceFee.toLocaleString()}원
          </Typography>
        </ListItem>
      </List>
      <Divider />
      <Stack
        direction="column"
        divider={<Divider flexItem />}
        spacing={2}
        sx={{ my: 2 }}
      >
        <div>
          <Typography variant="subtitle2" gutterBottom>
            입찰자 정보 ({applicationType === 'personal' ? '개인' : applicationType === 'company' ? '법인' : '공동입찰'})
          </Typography>
          <Typography gutterBottom>{displayInfo.name}</Typography>
          {displayInfo.businessInfo && (
            <Typography gutterBottom sx={{ color: "text.secondary", fontSize: '0.9rem' }}>
              {displayInfo.businessInfo}
            </Typography>
          )}
          {displayInfo.groupInfo && (
            <Typography gutterBottom sx={{ color: "text.secondary", fontSize: '0.9rem' }}>
              {displayInfo.groupInfo}
            </Typography>
          )}
          <Typography gutterBottom sx={{ color: "text.secondary" }}>
            {displayInfo.address}
          </Typography>
          <Typography gutterBottom sx={{ color: "text.secondary" }}>
            {displayInfo.phone}
          </Typography>
        </div>
        <div>
          <Typography variant="subtitle2" gutterBottom>
            입찰 내용
          </Typography>
          <Grid container>
            <Grid size={{ xs: 6 }}>
              <Typography color="text.secondary">법원명</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography>{caseResult?.data?.courtName ?? "N/A"}</Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography color="text.secondary">사건번호</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography>
                {caseResult?.data?.printCaseNumber ?? "N/A"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography color="text.secondary">입찰가</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography>{Number(bidAmt).toLocaleString()}원</Typography>
            </Grid>
          </Grid>
        </div>
      </Stack>
    </Stack>
  );
}
