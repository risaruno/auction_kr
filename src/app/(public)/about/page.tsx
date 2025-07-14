"use client";
import * as React from "react";
import {
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  HandshakeOutlined as HandshakeIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import Headline from "@/components/marketing-page/components/Headline";

export default function AboutPage() {
  return (
    <Container maxWidth="lg">
      <Headline
        headline={
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
          >
            주식회사 솔하우징
            <Typography component="span" variant="h3">
              &nbsp;|&nbsp;회사 소개
            </Typography>
          </Typography>
        }
      />
      <Divider />

      {/* Main Content */}
      <Grid container spacing={4} sx={{ my: 8 }}>
        {/* Company Story */}
        <Grid size={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <BusinessIcon
                sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
              />
              <Typography
                variant="h5"
                component="h3"
                sx={{ fontWeight: "bold" }}
              >
                회사 연혁
              </Typography>
            </Box>
            <Typography
              variant="body1"
              paragraph
              sx={{
                lineHeight: 1.8,
                fontSize: "1.1rem",
                color: "text.primary",
              }}
            >
              주식회사 솔하우징은 <strong>2016년 주택사업</strong>으로 시작해,
              <strong>2024년 수원과 울산 전역</strong>으로 경매 컨설팅 사업을
              확장하며 성장해왔습니다.
              <strong>2025년</strong>에는 경매 대행 서비스를 시작하여 고객의
              시간과 노력을 절감하는 효율적인 서비스를 제공하고 있습니다.
            </Typography>
          </Paper>
        </Grid>

        {/* Platform Introduction */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              borderRadius: 3,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ p: 4, mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "center",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <TimelineIcon
                    sx={{ fontSize: 35, color: "secondary.main", mr: 2 }}
                  />
                  <Typography
                    variant="h6"
                    component="h4"
                    sx={{ fontWeight: "bold" }}
                  >
                    플랫폼 탄생 배경
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  paragraph
                  sx={{ lineHeight: 1.7, color: "text.secondary" }}
                >
                  솔하우징의 경매대행 플랫폼
                  <Chip
                    label="솔하우징"
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mx: 1 }}
                  />
                  은 복잡한 경매 입찰 과정에서 고객의 수고로움을 덜어드리기 위해
                  탄생했습니다.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ lineHeight: 1.7, color: "text.secondary" }}
                >
                  개인과 기업이 입찰 과정에서 겪는 어려움을 관찰하고, 이를
                  해결하기 위한 빠르고 원활한 시스템 구축에 힘써왔습니다.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Services & Vision */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              borderRadius: 3,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ p: 4, mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "center",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 35, color: "success.main", mr: 2 }}
                  />
                  <Typography
                    variant="h6"
                    component="h4"
                    sx={{ fontWeight: "bold" }}
                  >
                    서비스 비전
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  paragraph
                  sx={{ lineHeight: 1.7, color: "text.secondary" }}
                >
                  우리는 대리입찰 과정을 간소화하여 더 많은 고객이 경매 기회를
                  놓치지 않도록 돕고 있으며, 앞으로도 경매대행을 넘어 다양한
                  분야로 서비스 영역을 확대해 나갈 예정입니다.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Promise */}
        <Grid size={12}>
          <Paper
            elevation={4}
            sx={{
              p: 5,
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <HandshakeIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 3 }}
            >
              우리의 약속
            </Typography>
            <Typography
              variant="h6"
              sx={{
                lineHeight: 1.6,
                fontWeight: "medium",
                opacity: 0.95,
              }}
            >
              신뢰와 전문성을 바탕으로, 솔하우징은 고객 여러분의 든든한 파트너가
              되겠습니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
