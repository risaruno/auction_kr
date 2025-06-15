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

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export default function CaseFind() {
  const [cortOfcCd, setCortOfcCd] = useState("B000411");
  const [csNo, setCsNo] = useState("2024타경110861");
  const [caseResult, setCaseResult] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/courtAuction", {
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
      console.error("Error:", error);
      setCaseResult(error instanceof Error ? error.message : String(error)); // Set an error message in the state
    }
  };
  return (
    <div>
      <Grid container spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight={"bold"} gutterBottom>
            의뢰하시는 경매 사건은 무엇인가요?
          </Typography>
          <Box
            sx={{
              backgroundColor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              padding: 2,
              marginBottom: 3,
            }}
          >
            <Typography variant="body1" gutterBottom>
              경매 사건을 신청하시는 분들을 위해 경매 사건 조회 서비스를
              제공합니다.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (단, 자동차 경매는 조회 및 신청이 불가능합니다.)
            </Typography>
          </Box>
        </Box>
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
            defaultValue="seoul"
            variant="filled"
          >
            <MenuItem value="seoul">서울</MenuItem>
            <MenuItem value="gyeonggi">경기</MenuItem>
          </TextField>
        </FormGrid>
        <FormGrid size={{ xs: 8 }} sx={{ justifyContent: "flex-end" }}>
          <TextField
            select
            id="court-house"
            name="court-house"
            label="법원"
            required
            defaultValue="seoul"
            variant="filled"
            value={cortOfcCd}
            onChange={(e) => setCortOfcCd(e.target.value)}
          >
            <MenuItem value="B000411">서울중앙지방법원 본원</MenuItem>
            <MenuItem value="B000412">서울중앙지방법원</MenuItem>
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
      <Grid container spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight={"bold"} gutterBottom>
            입찰하시는 사건을 확인해주세요.
          </Typography>
          <Box
            sx={{
              backgroundColor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              padding: 2,
              marginBottom: 3,
            }}
          >
            <Typography variant="body1" gutterBottom>
              {caseResult
                ? typeof caseResult === "object"
                  ? JSON.stringify(caseResult, null, 2) // Convert object to a readable string
                  : caseResult
                : "조회된 사건 정보가 없습니다."}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </div>
  );
}
