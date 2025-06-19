'use client'
import React, { useState, useMemo } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import AppTheme from '../../shared-theme/AppTheme'
import AppAppBar from '../../marketing-page/components/AppAppBar'
import Footer from '@/marketing-page/components/Footer'
import Headline from '@/marketing-page/components/Headline'
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Button,
} from '@mui/material'

// --- Sample Data ---
const expertsData = [
  {
    name: '원유호 공인중개사',
    location: '인천',
    description:
      '경매 경력 10년 낙찰횟수 다수. 권리분석 심가 / 다가구 / 법정지상권/유치권/지분경매 등',
    photo: '/path/to/image1.png', // Replace with actual image path
    services: ['권리분석', '임장', '예상낙찰가산정', '특수물건분석', '부동산 관리', '사건기록열람'],
  },
  {
    name: '오은석 공인중개사',
    location: '광주',
    description:
      '개업공인중개사로서 고객의 니즈를 이해하고 니즈에 맞는 결과를 만들어왔습니다. 매수신청대리인으로서 다수의...',
    photo: '/path/to/image2.png', // Replace with actual image path
    services: ['권리분석', '사건기록열람', '임장', '예상낙찰가산정', '부동산 관리'],
  },
  {
    name: '이규호 공인중개사',
    location: '수원',
    description:
      '10년이상의 중개경력과 경매 다수의 입찰과 낙찰경험이 있습니다. 권리분석 및 부동산과 경매 관련 모든 상담...',
    photo: '/path/to/image3.png', // Replace with actual image path
    services: ['권리분석', '예상낙찰가산정', '임장', '특수물건분석', '부동산 관리'],
  },
  {
    name: '김맹겸 공인중개사',
    location: '창원',
    description:
      '5년이상 경매입찰 및 권리분석만 집중적으로 공부하고 경험을 쌓았습니다. 꼼꼼한 권리분석으로 이용자님께 특...',
    photo: '/path/to/image4.png', // Replace with actual image path
    services: ['권리분석'],
  },
];

const regions = ['전체', '서울', '인천', '수원', '의정부', '광주', '대전', '청주', '대구', '창원', '울산', '부산', '전주'];
const services = ['전체', '대리입찰', '권리분석', '사건기록열람', '등기', '명도', '임장', '예상낙찰가산정', '특수물건분석', '부동산 관리', '올인원서비스'];

export default function ExpertPage() {
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedService, setSelectedService] = useState('전체');

  const handleRegionChange = (event: React.MouseEvent<HTMLElement>, newRegion: string | null) => {
    if (newRegion !== null) {
      setSelectedRegion(newRegion);
    }
  };

  const handleServiceChange = (event: React.MouseEvent<HTMLElement>, newService: string | null) => {
    if (newService !== null) {
      setSelectedService(newService);
    }
  };

  const filteredExperts = useMemo(() => {
    return expertsData.filter((expert) => {
      const regionMatch = selectedRegion === '전체' || expert.location === selectedRegion;
      const serviceMatch = selectedService === '전체' || expert.services.includes(selectedService);
      return regionMatch && serviceMatch;
    });
  }, [selectedRegion, selectedService]);

  const FilterGroup = ({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: any }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 100, mr: 2 }}>{title}</Typography>
        <ToggleButtonGroup value={value} exclusive onChange={onChange} aria-label={`${title} filter`} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {options.map((option) => (
            <ToggleButton key={option} value={option} sx={{ border: 'none', borderRadius: '20px !important', px: 2, '&.Mui-selected': { backgroundColor: 'primary.main', color: 'white' }, '&.Mui-selected:hover': { backgroundColor: 'primary.dark' }}}>
              {option}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
  );

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Container maxWidth="lg" sx={{ my: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                전문가 서비스
            </Typography>
            <Button variant="contained" color="primary" size="large">
                대리입찰 신청
            </Button>
        </Box>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 5, backgroundColor: '#f9fafb', borderRadius: 2 }}>
          <FilterGroup title="지역" options={regions} value={selectedRegion} onChange={handleRegionChange}/>
          <Divider />
          <FilterGroup title="제공 서비스" options={services} value={selectedService} onChange={handleServiceChange}/>
        </Paper>

        {/* Experts Grid */}
        <Grid container spacing={4}>
          {filteredExperts.map((expert, index) => (
            // Grid component now uses the requested 'size' prop
            <Grid container size={{ xs: 12, sm: 6 }} key={index}>
              <Card sx={{ width: '100%', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={expert.photo} sx={{ width: 64, height: 64, mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="primary">{expert.location}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{expert.name}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 60 }}>
                    {expert.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {expert.services.map((service) => (
                      <Chip key={service} label={service} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </AppTheme>
  )
}