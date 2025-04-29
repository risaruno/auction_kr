import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const items = [
  {
    "title": "서비스 이용료",
    "type": "전문가 서비스",
    "content": "전문가가 서비스에 게시한 이용료를 확인해 주세요.\n쎄르토는 전문가 서비스 이용료에 일체 관여 하지 않으며, 전문가 서비스의 이용료는 의뢰인이 전문가에게 직접 결제합니다.\n(주)쎄르토는 전문가 서비스에서 일체의 수수료를 받지 않습니다."
  },
  {
    "title": "전문가는 믿을수 있나요?",
    "type": "전문가 서비스",
    "content": "쎄르토는 안전하고 신뢰할 수 있는 거래 환경을 제공하기 위해 노력하고 있습니다.\n전문가의 자격을 입증하는 증빙 자료를 검토하고, 공인중개사협회 또는 대한법무사협회를 통해 자격 상실여부등을 확인 후 서비스 승인절차를 진행합니다."
  },
  {
    "title": "전문가 서비스의 손해 배상",
    "type": "전문가 서비스",
    "content": "(주)쎄르토은 통신판매중개자로서 이용자와 전문가 간 자유로운 거래를 위한 시스템을 운영 및 관리, 제공할 뿐이므로 전문가를 대리하지 않습니다. 이용자와 전문가 사이에 성립된 거래와 관련된 손해배상은 이용자와 전문가가 합의 해결해야 합니다."
  },
  {
    "title": "결제는 되었는데 신청 내역이 보이지 않아요",
    "type": "기타",
    "content": "신청 내역이 확인이 안되는 경우는 두가지 경우입니다.\n\n📌 입찰 접수 알림을 받은 경우\n가입 계정을 확인해주세요\n\n📌 입찰 접수 알림을 못 받은 경우\n지연 결제로 인해 접수 정보가 삭제된 경우로\n①사건번호,\n②법원명\n③의뢰인 성함\n상담톡에 남겨주시면 확인 후 처리도와드리겠습니다."
  },
  {
    "title": "부동산 이외 자동차, 중기 등도 대리입찰 가능한가요?",
    "type": "기타",
    "content": "매수신청대리인의 업무 영역에 대한 법원의 해석이 상의하여 공인중개사로 구성된 쎄르토 대리입찰 서비스에서는 부동산 이외에 자동차, 중기 등은 접수가 불가합니다.\n\n자동차, 중기 등 부동산 이외의 물건에 대한 경매 대리입찰은 전문가 서비스내 법무사대리입찰을 이용해주세요."
  },
  {
    "title": "결제 영수증이 필요한 경우",
    "type": "기타",
    "content": "지출 증빙이 필요하신 경우, 주식회사 쎄르토 상호로 발행되는 현금영수증(계좌이체 또는 토스페이)또는 카드 전표를 전달드립니다.\n\n[내 신청 내역] [영수증 확인]을 통해 확인해주세요."
  }
]

export default function FAQ() {
  const [expanded, setExpanded] = React.useState<string[]>([]);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(
        isExpanded
          ? [...expanded, panel]
          : expanded.filter((item) => item !== panel),
      );
    };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Box sx={{ width: '100%' }}>
        {items.map((item, index) => (
          <Accordion key={`panel${index + 1}`} expanded={expanded.includes(`panel${index + 1}`)} onChange={handleChange(`panel${index + 1}`)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index + 1}bh-content`}
              id={`panel${index + 1}bh-header`}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <Typography component="span" sx={{ flexShrink: 0, color: 'text.secondary' }}>
                  {item.type}
                </Typography>
                <Typography component="span" sx={{ fontWeight: 'bold' }}>
                  {item.title}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ mx: 1, color: 'text.secondary' }}>
                {item.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
