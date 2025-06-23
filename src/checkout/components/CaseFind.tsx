import { useState } from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { Card, CardContent, CardMedia, Menu } from "@mui/material";
import { CaseResult } from "@/interfaces/CaseResult";
import { CourtHouses } from "@/constants/CourtHouses";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

// 1. Defined a TypeScript interface for the component's props.
interface CaseFindProps {
  caseResult: CaseResult | null;
  setCaseResult: (result: CaseResult) => void;
}

// 2. The component now accepts props.
export default function CaseFind({ caseResult, setCaseResult }: CaseFindProps) {
  const [areaCd, setAreaCd] = useState("ulsan");
  const [cortOfcCd, setCortOfcCd] = useState("B000411");
  const [csNo, setCsNo] = useState("2024타경110861");

  const handleSubmit = async () => {
    try {
      if (areaCd === "default" || cortOfcCd === "default") {
        alert("법원을 선택해주세요.");
        return;
      }
      const response = await fetch(`/api/courtAuction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cortOfcCd,
          csNo,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      console.log("Result:", result);
      setCaseResult(result); // Update the state with
    } catch (error) {
      setCaseResult({
        error: error instanceof Error ? error.message : String(error),
        data: null,
      });
    }
  };
  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
      {caseResult && typeof caseResult === "object" && caseResult.data ? (
        <Grid container spacing={3} size={{ xs: 12 }}>
          <Grid container spacing={0} size={{ xs: 12 }}>
            <Typography variant="h3" fontWeight={"bold"} gutterBottom>
              입찰하시는 사건을 확인해주세요.
            </Typography>
            <Grid container size={{ xs: 12 }}>
              <Card
                sx={{
                  margin: "0 auto",
                  display: "flex",
                  width: "100%",
                  flexDirection: { xs: "column", sm: "column", md: "row" },
                }}
              >
                <CardMedia
                  component="img"
                  image={`data:image/jpeg;base64,${caseResult.data.picFile}`}
                  alt="Case Image"
                  sx={{
                    flex: 1,
                    objectFit: "cover",
                    height: 250,
                    maxHeight: { xs: 250, sm: 300, md: 350 },
                    width: { xs: "100%", sm: "auto" },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flex: { sm: "0", md: "1" },
                    alignItems: "center",
                  }}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">법원명</Typography>
                      <Typography variant="body1" fontWeight={"bold"}>
                        {caseResult.data.courtName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">사건번호</Typography>
                      <Typography variant="body1" fontWeight={"bold"}>
                        {caseResult.data.printCaseNumber}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">감정가</Typography>
                      <Typography variant="body1" fontWeight={"bold"}>
                        {caseResult.data.evaluationAmt.toLocaleString()}원
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">최저 입찰가</Typography>
                      <Typography variant="body1" fontWeight={"bold"}>
                        {caseResult.data.lowestBidAmt.toLocaleString()}원
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">보증금</Typography>
                      <Typography variant="body1" fontWeight={"bold"}>
                        {caseResult.data.depositAmt.toLocaleString()}원
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">매각기일</Typography>
                      <Typography variant="body1" fontWeight={"bold"}>
                        {caseResult.data.bidDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3} size={{ xs: 12 }}>
          <Grid container spacing={0} size={{ xs: 12 }}>
            <Typography variant="h3" fontWeight={"bold"} gutterBottom>
              의뢰하시는 경매 사건은 무엇인가요?
            </Typography>
            <Grid
              container
              size={{ xs: 12 }}
              sx={{
                backgroundColor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                padding: 2,
                width: "100%",
              }}
            >
              <Typography variant="body1">
                경매 사건을 신청하시는 분들을 위해 경매 사건 조회 서비스를
                제공합니다.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (단, 자동차 경매는 조회 및 신청이 불가능합니다.)
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3} size={{ xs: 12 }}>
            <FormGrid size={{ xs: 4 }}>
              <FormLabel htmlFor="area" required>
                관할법원
              </FormLabel>
              <TextField
                select
                id="area"
                name="area"
                label="지역"
                required
                variant="filled"
                value={areaCd ? areaCd : "default"}
                onChange={(e) => {
                  setAreaCd(e.target.value);
                  setCortOfcCd("default");
                }}
              >
                <MenuItem value="default" disabled>
                  지역 선택
                </MenuItem>
                {Object.entries(CourtHouses).map(([key, { areaNm }]) => (
                  <MenuItem key={key} value={key}>
                    {areaNm}
                  </MenuItem>
                ))}
              </TextField>
            </FormGrid>
            <FormGrid size={{ xs: 8 }} sx={{ justifyContent: "flex-end" }}>
              <TextField
                select
                id="court-house"
                name="court-house"
                label="법원"
                required
                value={cortOfcCd ? cortOfcCd : "default"}
                variant="filled"
                onChange={(e) => setCortOfcCd(e.target.value)}
              >
                <MenuItem value="default" disabled>
                  법원 선택
                </MenuItem>
                {Object.entries(CourtHouses)
                  .filter(([key]) => key === areaCd)
                  .flatMap(([, { courtList }]) =>
                    courtList.map(({ code, name }) => (
                      <MenuItem key={code} value={code}>
                        {name}
                      </MenuItem>
                    ))
                  )}
              </TextField>
            </FormGrid>
            <FormGrid size={{ xs: 12 }}>
              <FormLabel htmlFor="case-number" required>
                사건번호
              </FormLabel>
              <TextField
                id="case-number"
                name="case-number"
                label="사건번호"
                placeholder="예) 2025-1234 또는 2025가합1234"
                variant="filled"
                required
                value={csNo}
                onChange={(e) => setCsNo(e.target.value)}
              />
            </FormGrid>
            <Button
              variant="contained"
              sx={{ width: { xs: "100%", sm: "fit-content" } }}
              onClick={handleSubmit}
            >
              조회하기
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
