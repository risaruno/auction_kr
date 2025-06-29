import { useState } from "react";
import { FormData } from "@/interfaces/FormData";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Modal,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// 1. Define the props interface for type safety.
interface PaymentFormProps {
  formData: FormData;
  handleFormChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
};

// 2. The component now accepts props.
export default function PaymentForm({
  formData,
  handleFormChange,
}: PaymentFormProps) {
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const handleMainPayClick = () => {
    // Validate that terms are checked
    if (!formData.termsChecked) {
      alert("약관에 동의해주세요.");
      return;
    }
    setOpenConfirmModal(true);
  };

  const handleContinueFromConfirm = () => {
    setOpenConfirmModal(false);
    setOpenPaymentModal(true);
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Fee Payment Section */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          수수료 결제
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 4,
            background: "linear-gradient(to right bottom, #4a6a8a, #3c5d7a)",
            color: "white",
          }}
        >
          <Typography variant="h5" sx={{ my: 1, fontWeight: "bold" }}>
            대리입찰 수수료
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            100,000원
          </Typography>
        </Paper>
        <Typography
          variant="body2"
          sx={{
            backgroundColor: "#fffbe6",
            p: 1.5,
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          📢 대리입찰을 위해 <strong>전자본인서명확인서</strong> 발급등록이
          필요합니다.
          <br />
          (주민센터에서 신청)
        </Typography>

        {/* Included Services Section */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 1 }}>
          서비스 포함 내역
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="입찰관련 서류작성" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="대리 입찰참여" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="입찰 결과 안내" />
          </ListItem>
        </List>

        {/* Terms and Refund Section */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 1 }}>
          결제약관 및 환불 취소 규정 확인
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            height: 150,
            overflow: "auto",
            p: 2,
            mb: 1,
            fontSize: "0.8rem",
          }}
        >
          1. 경매 일정 변경시 처리방법
          <br />
          의뢰인은 접수한 사건의 기각, 취하, 연기, 변경, 정지등의 변경사항
          발생시 담당 대리인에게 바로 연락주셔야 합니다. 집행법원의 경매사건
          변경 고지는 의뢰자에게 있음을 유의해주세요. 사건 변경에 의한
          신청취소시 환불규정에 따라 환불됩니다.
          {/* Add more terms here */}
        </Paper>
        <Box display="flex" alignItems="center">
          <Checkbox
            checked={formData.termsChecked}
            onChange={(event) => {
              const updatedFormData = { ...formData, termsChecked: event.target.checked };
              // Simulate the handleFormChange event
              const syntheticEvent = {
                target: { name: 'termsChecked', value: event.target.checked }
              } as React.ChangeEvent<HTMLInputElement>;
              handleFormChange(syntheticEvent);
            }}
            name="termsChecked"
          />
          <Typography variant="body2">
            위 약관을 확인하였으며, 회원 본인은 약관 및 결제에 동의합니다.
          </Typography>
          <Button
            size="small"
            onClick={() => setOpenRefundModal(true)}
            sx={{ ml: "auto" }}
          >
            환불정책
          </Button>
        </Box>

        {/* Payment Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 4, py: 1.5 }}
          onClick={handleMainPayClick}
        >
          결제하기
        </Button>
      </Paper>

      {/* --- Modals --- */}

      {/* 1. Confirmation Modal */}
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <Box sx={modalStyle}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            대리입찰 서비스를 진행하기 위해서는
            <br />
            결제 이후, 전자본인서명확인서 등록이 필요합니다.
          </Typography>
          <Typography
            sx={{
              mt: 2,
              textAlign: "center",
              fontSize: "0.9rem",
              color: "text.secondary",
            }}
          >
            이용료 결제 후, 수임인(대리인) 정보를 확인하고 간단하게 발급할 수
            있어요!
            <br />
            단, 최초 발급 시에는 주민센터에서 발급시스템 이용 승인 신청을 해야
            합니다.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleContinueFromConfirm}
          >
            계속하기
          </Button>
        </Box>
      </Modal>

      {/* 2. Refund Policy Modal */}
      <Modal open={openRefundModal} onClose={() => setOpenRefundModal(false)}>
        <Box sx={{ ...modalStyle, maxWidth: 600 }}>
          <IconButton
            onClick={() => setOpenRefundModal(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            환불 정책 안내
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
            체르토는 입찰에 어려움이 있으신 분들을
            <br />
            전문가가 도와드리는 서비스입니다.
          </Typography>

          <Accordion sx={{ mt: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>의뢰인의 일정변경 확인 및 고지 의무</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                세부적인 환불 정책 내용이 여기에 들어갑니다.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>환불규정 자세히보기</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                추가적인 환불 규정 세부사항입니다.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => setOpenRefundModal(false)}
            >
              동의하지 않습니다
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                const updatedFormData = { ...formData, termsChecked: true };
                // Simulate the handleFormChange event
                const syntheticEvent = {
                  target: { name: 'termsChecked', value: true }
                } as React.ChangeEvent<HTMLInputElement>;
                handleFormChange(syntheticEvent);
                setOpenRefundModal(false);
              }}
            >
              환불 정책에 동의합니다
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 3. Payment Method Modal */}
      <Modal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            결제하기
          </Typography>
          <Button fullWidth variant="outlined" size="large" sx={{ mb: 1 }}>
            신용·체크카드
          </Button>
          <Grid container spacing={1}>
            <Grid size={6}>
              <Button fullWidth variant="outlined" size="large">
                toss pay
              </Button>
            </Grid>
            <Grid size={6}>
              <Button fullWidth variant="outlined" size="large">
                계좌이체
              </Button>
            </Grid>
          </Grid>
          <Box
            sx={{
              my: 2,
              p: 1.5,
              backgroundColor: "#f0f5ff",
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="primary">
              S 신한카드 최대 5개월 무이자 할부
            </Typography>
          </Box>
          <TextField
            select
            fullWidth
            label="카드사 선택"
            SelectProps={{ native: true }}
            sx={{ mb: 1 }}
          >
            <option>카드를 선택하세요</option>
            <option>신한카드</option>
            <option>국민카드</option>
            <option>우리카드</option>
          </TextField>
          <Box display="flex" alignItems="center" my={2}>
            <Checkbox defaultChecked />
            <Typography variant="body2">
              [필수] 결제 서비스 이용 약관, 개인정보 처리 동의
            </Typography>
          </Box>
          <Button fullWidth variant="contained" size="large">
            결제하기
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
