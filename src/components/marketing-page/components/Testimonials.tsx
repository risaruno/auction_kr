import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';
import Image from 'next/image';
const userTestimonials = [
  {
    avatar: <Avatar alt="김영호" src="/static/images/avatar/1.jpg" />,
    name: '김영호',
    occupation: '사업가',
    testimonial:
      "체르또의 대리입찰 서비스를 통해 처음으로 경매에 도전했습니다. 전문가들의 상세한 물건 분석과 적극적인 대응으로 좋은 조건에 낙찰받을 수 있었습니다. 부동산 투자 초보자에게 정말 든든한 파트너입니다.",
  },
  {
    avatar: <Avatar alt="박지연" src="/static/images/avatar/2.jpg" />,
    name: '박지연',
    occupation: '부동산 투자자',
    testimonial:
      "여러 대리입찰 업체를 이용해봤지만 체르또만큼 투명하고 전문적인 서비스는 없었습니다. 매물 선별부터 입찰 전략까지 모든 과정에서 정확한 정보와 조언을 얻을 수 있어 안심하고 투자할 수 있었습니다.",
  },
  {
    avatar: <Avatar alt="이준호" src="/static/images/avatar/3.jpg" />,
    name: '이준호',
    occupation: '회사원',
    testimonial:
      '바쁜 직장생활 중에는 경매에 직접 참여하기 어려웠는데, 체르또의 대리입찰 서비스가 큰 도움이 되었습니다. 원하는 물건을 합리적인 가격에 낙찰받을 수 있었고, 모든 과정에서 세심한 관리와 신속한 연락으로 신뢰할 수 있었습니다.',
  },
  {
    avatar: <Avatar alt="최미영" src="/static/images/avatar/4.jpg" />,
    name: '최미영',
    occupation: '자산관리사',
    testimonial:
      "20년 이상 부동산 투자를 해왔지만, 체르또의 전문성에 감탄했습니다. 특히 법원 경매의 복잡한 절차와 리스크를 명확히 설명해주고, 최적의 입찰 전략을 제시해 주어 성공적인 투자로 이어졌습니다.",
  },
  {
    avatar: <Avatar alt="정민우" src="/static/images/avatar/5.jpg" />,
    name: '정민우',
    occupation: '개인사업자',
    testimonial:
      "다른 대리입찰 서비스와 달리 체르또는 고객의 상황과 목표에 맞춤형 전략을 제공합니다. 제 투자 성향과 예산에 맞는 물건을 추천받고, 세심한 관리로 원하는 물건을 낙찰받을 수 있었습니다.",
  },
  {
    avatar: <Avatar alt="송하은" src="/static/images/avatar/6.jpg" />,
    name: '송하은',
    occupation: '금융전문가',
    testimonial:
      "경매 초보였던 저에게 체르또는 든든한 길잡이가 되어주었습니다. 복잡한 용어와 절차를 쉽게 설명해주고, 물건의 장단점을 객관적으로 분석해 주어 안심하고 투자를 결정할 수 있었습니다. 앞으로도 계속 이용할 예정입니다.",
  },
];

const whiteLogos = [
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560628e8573c43893fe0ace_Sydney-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f4d520d0517ae8e8ddf13_Bern-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f46794c159024c1af6d44_Montreal-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e891fa22f89efd7477a_TerraLight.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560a09d1f6337b1dfed14ab_colorado-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f5caa77bf7d69fb78792e_Ankara-white.svg',
];

const darkLogos = [
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560628889c3bdf1129952dc_Sydney-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f4d4d8b829a89976a419c_Bern-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f467502f091ccb929529d_Montreal-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e911fa22f2203d7514c_TerraDark.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560a0990f3717787fd49245_colorado-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f5ca4e548b0deb1041c33_Ankara-black.svg',
];

const logoStyle = {
  width: '64px',
  opacity: 0.3,
};

export default function Testimonials() {
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Container
      id="testimonials"
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
      <Box
        sx={{
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        <Typography
          component="h2"
          variant="h2"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          고객 후기
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          체르또와 함께한 고객들의 생생한 경험담입니다. 전문성 있는 대리입찰 서비스로 
          성공적인 부동산 투자를 이끌어낸 실제 사례들을 확인해보세요.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexGrow: 1,
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ color: 'text.secondary' }}
                >
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                <CardHeader
                  avatar={testimonial.avatar}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
                <Image
                  src={logos[index]}
                  alt={`Logo ${index + 1}`}
                  style={logoStyle}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
