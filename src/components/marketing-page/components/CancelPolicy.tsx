import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Features() {

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          환불 및 취소 규정
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          본 규정은 체로토(이하 "회사")가 제공하는 서비스 이용과 관련하여 발생하는 환불 및 취소에 대한 규정을 정한 것입니다.
          회사는 이용자의 안전한 서비스 이용을 위하여 본 규정을 제정하고 이를 준수하고 있습니다.
        </Typography>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          제1조 경매 일정 변경시 처리방법
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >          
          서비스 접수단계에서 실시간 대법원정보를 수집 조회하여 접수가 이루어지고 있으나 이후 사건의 기각, 취하, 연기, 변경, 정지등의 변경사항 확인은 의뢰인에게 있으며,
          미확인 및 지연 확인 의한 귀책은 의뢰인에게 있습니다. 의뢰인의 확인 소홀로 발생하는 손해에 대해서는 책임지지 않습니다.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          일정 변경에 의한 환불 규정
          📌 입찰 기일 ~ D-2 일 : 전액 환불
          📌 입찰 기일 D-1 일 : 50% 환불 + 50% 포인트 적립
          📌 입찰 당일 : 환불 불가
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          이용료에 관한 일정은 은행 영업일 기준으로 합니다.
          입찰 하루 전 일정 변경에 의한 취소 시 [문의 게시판]에 ①사건 번호 ②집행 법원 ③의뢰인 이름을 남겨주셔야 합니다.
          등록된 내용 확인 후 최대 7일 이내 포인트가 지급됩니다.
          포인트는 홈페이지 상단[내 정보]메뉴에서 확인이 가능합니다.
        </Typography>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          제2조 접수 취소 및 환불 규정
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          체로토는 입찰 보안 및 서비스 품질을 위해 제한된 대리인으로 운영중입니다. 서비스 이용료에는 의뢰인의 사건 정보를 수집처리하고 필요한 서류를 생성, 대리인 관리, 지정 대리인 확정 후 다른 의뢰인의 접수를 포기하는 비용과 해당일 다른 스케쥴을 포기하는 비용을 포함하고 있습니다. 접수 취소 시 아래와 같이 환불 수수료가 발생하므로 접수 시 유의해 주세요.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          환불 규정
          📌100% 환불 : 입찰 기일 D-2 일까지 취소 및 환불 요청.
          📌50% 환불 : 입찰 기일 D-1 일 취소 환불 요청.
          📌환불 불가 : 입찰 당일 취소 환불 요청.
          입찰 당일 9시까지 보증금 미입금 또는 미달하게 입금한 경우. 전자본인서명확인서 등 입찰에 필요한 서류 미제출.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          이용료에 관한 일정은 은행 영업일 기준으로 합니다.
          예) 월요일 휴일일 경우, 입찰 기일이 화요일이면 금요일이 D-1 입니다.
        </Typography>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          제3조 대리인의 고의 과실 책임 배상
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          (주)케이디씨텍 체로토는 대리 입찰 중개시스템의 제공자로 대리 입찰 당사자가 아닙니다.
          입찰보증금은 지정 대리인에게 이체하며, 이체 이후 보증금의 도난 또는 분실에 대한 책임은 지정 대리인에게 있으며, 대리인이 가입한 공제 증서 범위내에서 배상합니다. 
          대리인의 고의 과실에 의한 불참석 및 입찰 무효의 경우, 의뢰인에게 받은 수수료의 배액을 배상합니다.
          단, 천재지변으로 인한 입찰 불참석은 사전에 고객과 연락하여 진행 불가를 통보하고 접수 취소와 함께 수수료를 반환됩니다.
        </Typography>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          제4조 고지
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          회사는 본 방침의 내용 추가, 삭제 및 수정이 있을 시에는 변경사항을 시행하기 최소 7일 전에 홈페이지를 통해 공지할 것입니다.
          다만, 회원에게 불리한 내용의 변경인 경우에는 최소 30일 전에 공지하도록 하겠습니다.
          • 공고 일자: 2024년 12월 06일
          • 시행 일자: 2024년 12월 13일
        </Typography>
      </Box>
    </Container>
  );
}
