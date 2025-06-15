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

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export default function ContractSign() {
  const [areaCd, setAreaCd] = useState("B000411");
  const [cortOfcCd, setCortOfcCd] = useState("B000411");
  const [csNo, setCsNo] = useState("2024타경110861");
  interface CaseResult {
    error?: string; // Add an optional error field to handle errors
    data?: {
      picFile: string;
      courtName: string;
      caseNumber: string;
      printCaseNumber: string;
      evaluationAmt: number;
      lowestBidAmt: number;
      depositAmt: number;
      bidDate: string;
    };
  }

  const [caseResult, setCaseResult] = useState<CaseResult | null>(null);
  const courtHouses = {
    seoul: {
      areaNm: "서울",
      courtList: [
        { code: "B000210", name: "서울중앙지방법원" },
        { code: "B000211", name: "서울동부지방법원" },
        { code: "B000215", name: "서울서부지방법원" },
        { code: "B000212", name: "서울남부지방법원" },
        { code: "B000213", name: "서울북부지방법원" },
      ],
    },
    uijeongbu: {
      areaNm: "의정부",
      courtList: [
        { code: "B000214", name: "의정부지방법원" },
        { code: "B214807", name: "의정부지방법원 고양지원" },
        { code: "B214804", name: "의정부지방법원 남양주지원" },
      ],
    },
    incheon: {
      areaNm: "인천",
      courtList: [
        { code: "B000240", name: "인천지방법원" },
        { code: "B000241", name: "인천지방법원 부천지원" },
      ],
    },
    suwon: {
      areaNm: "수원",
      courtList: [
        { code: "B000250", name: "수원지방법원" },
        { code: "B000251", name: "수원지방법원 성남지원" },
        { code: "B000252", name: "수원지방법원 여주지원" },
        { code: "B000253", name: "수원지방법원 평택지원" },
        { code: "B250826", name: "수원지방법원 안산지원" },
        { code: "B000254", name: "수원지방법원 안양지원" },
      ],
    },
    chuncheon: {
      areaNm: "춘천",
      courtList: [
        { code: "B000260", name: "춘천지방법원" },
        { code: "B000261", name: "춘천지방법원 강릉지원" },
        { code: "B000262", name: "춘천지방법원 원주지원" },
        { code: "B000263", name: "춘천지방법원 속초지원" },
        { code: "B000264", name: "춘천지방법원 영월지원" },
      ],
    },
    cheongju: {
      areaNm: "청주",
      courtList: [
        { code: "B000270", name: "청주지방법원" },
        { code: "B000271", name: "청주지방법원 충주지원" },
        { code: "B000272", name: "청주지방법원 제천지원" },
        { code: "B000273", name: "청주지방법원 영동지원" },
      ],
    },
    daejeon: {
      areaNm: "대전",
      courtList: [
        { code: "B000280", name: "대전지방법원" },
        { code: "B000281", name: "대전지방법원 홍성지원" },
        { code: "B000282", name: "대전지방법원 논산지원" },
        { code: "B000283", name: "대전지방법원 천안지원" },
        { code: "B000284", name: "대전지방법원 공주지원" },
        { code: "B000285", name: "대전지방법원 서산지원" },
      ],
    },
    daegu: {
      areaNm: "대구",
      courtList: [
        { code: "B000310", name: "대구지방법원" },
        { code: "B000311", name: "대구지방법원 안동지원" },
        { code: "B000312", name: "대구지방법원 경주지원" },
        { code: "B000313", name: "대구지방법원 김천지원" },
        { code: "B000314", name: "대구지방법원 상주지원" },
        { code: "B000315", name: "대구지방법원 의성지원" },
        { code: "B000316", name: "대구지방법원 영덕지원" },
        { code: "B000317", name: "대구지방법원 포항지원" },
        { code: "B000320", name: "대구지방법원 대구서부지원" },
      ],
    },
    busan: {
      areaNm: "부산",
      courtList: [
        { code: "B000410", name: "부산지방법원" },
        { code: "B000412", name: "부산지방법원 부산동부지원" },
        { code: "B000414", name: "부산지방법원 부산서부지원" },
      ],
    },
    ulsan: {
      areaNm: "울산",
      courtList: [{ code: "B000411", name: "울산지방법원" }],
    },
    changwon: {
      areaNm: "창원",
      courtList: [
        { code: "B000420", name: "창원지방법원" },
        { code: "B000431", name: "창원지방법원 마산지원" },
        { code: "B000421", name: "창원지방법원 진주지원" },
        { code: "B000422", name: "창원지방법원 통영지원" },
        { code: "B000423", name: "창원지방법원 밀양지원" },
        { code: "B000424", name: "창원지방법원 거창지원" },
      ],
    },
    gwangju: {
      areaNm: "광주",
      courtList: [
        { code: "B000510", name: "광주지방법원" },
        { code: "B000511", name: "광주지방법원 목포지원" },
        { code: "B000512", name: "광주지방법원 장흥지원" },
        { code: "B000513", name: "광주지방법원 순천지원" },
        { code: "B000514", name: "광주지방법원 해남지원" },
      ],
    },
    jeonju: {
      areaNm: "전주",
      courtList: [
        { code: "B000520", name: "전주지방법원" },
        { code: "B000521", name: "전주지방법원 군산지원" },
        { code: "B000522", name: "전주지방법원 정읍지원" },
        { code: "B000523", name: "전주지방법원 남원지원" },
      ],
    },
    jeju: {
      areaNm: "제주",
      courtList: [{ code: "B000530", name: "제주지방법원" }],
    },
  };

  const handleSubmit = async () => {
    try {
      if (areaCd === "default" || cortOfcCd === "default") {
        alert("법원을 선택해주세요.");
        return;
      }
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
      setCaseResult(null); // Clear the case result on error
      setCaseResult({
        error: error instanceof Error ? error.message : String(error),
      }); // Set an error message in the state
    }
  };
  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
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
              {Object.entries(courtHouses).map(([key, { areaNm }]) => (
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
              {Object.entries(courtHouses)
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
      <Grid container spacing={3} size={{ xs: 12 }}>
        <Grid container spacing={0} size={{ xs: 12 }}>
          <Typography variant="h3" fontWeight={"bold"} gutterBottom>
            입찰하시는 사건을 확인해주세요.
          </Typography>
          <Grid container size={{ xs: 12 }}>
            {caseResult && typeof caseResult === "object" && caseResult.data ? (
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
                      <Typography variant="body1" fontWeight={"bold"}>{caseResult.data.courtName}</Typography>
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
                      <Typography variant="body1" fontWeight={"bold"}>{caseResult.data.printCaseNumber}</Typography>
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
                      <Typography variant="body1" fontWeight={"bold"}>{caseResult.data.bidDate}</Typography>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            ) : (
              <Typography variant="body1">
                조회된 사건 정보가 없습니다.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
