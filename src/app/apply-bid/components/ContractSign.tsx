import { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { CaseResult } from "@/interfaces/CaseResult";

// 1. Defined a TypeScript interface for the component's props.
interface ContractSignProps {
  formData: {
    bidderName: string;
    phoneNumber: string;
    roadAddr: string;
    addrDetail: string;
    signature: string | null;
    caseResult: CaseResult | null;
    fee: string;
    feePaidOn: string;
  };
  setSignature: (signature: string | null) => void;
}

// Style for the modal
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0,
  borderRadius: 1,
};

// Style for the main container
const contractPaperStyle = {
  padding: 4,
  marginTop: 4,
  marginBottom: 4,
};

export default function ContractSign({
  formData,
  setSignature,
}: ContractSignProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.getCanvas().toDataURL("image/png");
      setSignature(dataUrl);
    }
    handleCloseModal();
  };

  const ContractSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid size={{ xs: 3, sm: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: 9, sm: 10 }}>
        <Typography variant="body1">{value}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={contractPaperStyle}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          대리입찰 계약서
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          입찰인은 아래 표시 경매 사건에 관하여 다음 내용과 같이 계약을
          체결한다.
        </Typography>

        <ContractSection title="입찰인 정보">
          <InfoRow label="입찰인 (성명)" value={formData.bidderName} />
          <InfoRow label="연락처" value={formData.phoneNumber} />
          <InfoRow
            label="주소"
            value={`${formData.roadAddr} ${formData.addrDetail}`}
          />
        </ContractSection>

        <ContractSection title="경매 사건 정보">
          <InfoRow
            label="경매사건번호"
            value={formData.caseResult?.data?.printCaseNumber || ''}
          />
          <InfoRow
            label="집행 법원"
            value={formData.caseResult?.data?.courtName || ''}
          />
        </ContractSection>

        <ContractSection title="매수신청 대리 보수">
          <InfoRow label="확정 보수" value={formData.fee} />
          <InfoRow label="보수지급 시기" value={formData.feePaidOn} />
        </ContractSection>

        <ContractSection title="위임 내용">
          <Typography component="div" variant="body2">
            <ol>
              <li>「민사집행법」 제113조의 규정에 따른 매수신청 보증의 제공</li>
              <li>입찰표의 작성 및 제출</li>
              <li>
                「민사집행법」 제115조 제3항, 제142조 제6항의 규정에 따라
                매수신청의 보증을 돌려줄 것을 신청하는 행위
              </li>
            </ol>
          </Typography>
        </ContractSection>

        <ContractSection title="계약 내용">
          <Typography component="div" variant="body2" sx={{ lineHeight: 1.8 }}>
            <ol>
              <li>
                ㈜케이디씨씨씨 파트너(이하 ‘회사’라 함)는 통신판매 시스템을
                제공할 뿐, 통신판매의 당사자가 아니다.
              </li>
              <li>
                회사는 이용자의 관리를 위해 사건 정보를 제공할 뿐, 정보 오류에
                대해 회사는 어떠한 책임도 지지 아니한다.
              </li>
              <li>
                회사가 제공하는 경매 정보는 법원 정책에 기반하여 제공되며,
                재매각 등 특별매각 조건 물건의 보증금은 입찰인이 직접 해당
                경매계에 확인하여야 할 의무가 있다.
              </li>
              <li>
                입찰인은 회사에서 중개한 대리인에게 입찰에 필요한 모든 정보를
                제공하고, 입찰을 위한 모든 권한을 위임한다.
              </li>
            </ol>
          </Typography>
        </ContractSection>

        {/* --- Signing Area --- */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {new Date().toLocaleDateString("ko-KR")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              pr: 4,
            }}
          >
            <Typography variant="h6" sx={{ mr: 2 }}>
              입찰인
            </Typography>
            <Typography variant="h5" sx={{ mr: 1, fontWeight: "bold" }}>
              {formData.bidderName}
            </Typography>
            {formData.signature ? (
              <img
                src={formData.signature}
                alt="signature"
                style={{ height: "40px", borderBottom: "1px solid #000" }}
              />
            ) : (
              <Typography variant="body1">(서명날인)</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button variant="contained" size="large" onClick={handleOpenModal}>
            서명하기
          </Button>
        </Box>
      </Paper>

      {/* --- Signature Modal --- */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
              김 지 수
            </Typography>
            <Typography sx={{ mt: 1 }}>마우스를 서명하여야 합니다.</Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd" }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "sigCanvas",
              }}
            />
          </Paper>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={clearSignature}
              sx={{ width: "48%" }}
            >
              지우기
            </Button>
            <Button
              variant="contained"
              onClick={saveSignature}
              sx={{ width: "48%" }}
            >
              서명완료
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}
