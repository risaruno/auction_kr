import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const items = [
  {
    title: '전문가 서비스',
    content: '전문가 서비스는 체르또에서 제공하는 전문가와의 직접 상담 서비스입니다. 전문가와의 상담을 통해 보다 전문적인 조언과 지원을 받을 수 있습니다.',
    services: ['권리 분석', '임장', '예상낙찰가산정', '특수물건분석', '부동산 관리', '사건기록열람']
  },
  {
    title: '전문가 서비스 이용 방법',
    content: '전문가 서비스는 체르또 웹사이트에서 신청할 수 있습니다. 신청 후 전문가와의 상담 일정을 조율하여 진행됩니다.',
    services: ['권리 분석', '임장', '예상낙찰가산정', '특수물건분석', '부동산 관리', '사건기록열람']
  }
]

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

export default function ExpertCard() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
      {items.map((item, index) => (
        <Card key={index}>
          <CardHeader
            avatar={
              <Avatar
                alt="김주원 공인중개사"
                src="/static/images/avatar/1.jpg"
                sx={{ width: 86, height: 86, fontSize: 36 }}
              />
            }
            title={
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                김주원 공인중개사
              </Typography>
            }
            subheader={
              <Button variant="outlined" color='info' sx={{ fontSize: '1rem', fontWeight: 600 }}>
                서울
              </Button>
            }
            sx={{ mx: 2, mt: 2, mb: 4 }}
          />
          <CardContent>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                wordBreak: 'keep-all',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2, // Limit to 2 lines
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mx: 2,
                my: 2,
              }}
            >
              2008년 개업이래 17년째 광주법원 정문앞 한자리에서 영업을 계속하고 있으며 부동산 경매분야에 특화되어 있습니다. 경매전문가로서의 경험과 노하우를 바탕으로 고객님께 최상의 서비스를 제공하기 위해 항상 노력하고 있습니다.
            </Typography>
            <Box>
              {item.services.map((service, index) => (
                <Button
                key={index}
                size="small"
                color="info"
                variant="outlined"
                sx={{ fontSize: '1rem', mx: 1 }}
                >
                  {service}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
