"use client";

import React, { useState, useMemo, useEffect } from "react";
import Divider from "@mui/material/Divider";
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
} from "@mui/material";
import { fetchExperts } from "@/app/api/expert/actions";
import { Expert } from "@/types/api";
import Headline from "@/components/marketing-page/components/Headline";

const regions = [
  "전체",
  "서울",
  "인천",
  "수원",
  "의정부",
  "광주",
  "대전",
  "청주",
  "대구",
  "창원",
  "울산",
  "부산",
  "전주",
];
const services = [
  "전체",
  "대리입찰",
  "권리분석",
  "사건기록열람",
  "등기",
  "명도",
  "임장",
  "예상낙찰가산정",
  "특수물건분석",
  "부동산 관리",
  "올인원서비스",
];

export default function ExpertPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedService, setSelectedService] = useState("전체");

  // Fetch experts using the server action
  const fetchExpertsData = async () => {
    setLoading(true);
    try {
      const result = await fetchExperts(); // Call the server action with no filters for all experts
      setExperts(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertsData();
  }, []);

  const handleRegionChange = (
    event: React.MouseEvent<HTMLElement>,
    newRegion: string | null
  ) => {
    if (newRegion !== null) {
      setSelectedRegion(newRegion);
    }
  };

  const handleServiceChange = (
    event: React.MouseEvent<HTMLElement>,
    newService: string | null
  ) => {
    if (newService !== null) {
      setSelectedService(newService);
    }
  };

  const filteredExperts = useMemo(() => {
    return experts.filter((expert) => {
      const regionMatch =
        selectedRegion === "전체" || expert.location === selectedRegion;
      const serviceMatch =
        selectedService === "전체" || expert.services.includes(selectedService);
      return regionMatch && serviceMatch;
    });
  }, [selectedRegion, selectedService, experts]);

  const FilterGroup = ({
    title,
    options,
    value,
    onChange,
  }: {
    title: string;
    options: string[];
    value: string;
    onChange: any;
  }) => (
    <Box
      sx={{ display: "flex", alignItems: "center", my: 2, flexWrap: "wrap" }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", minWidth: 100, mr: 2 }}
      >
        {title}
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={onChange}
        aria-label={`${title} filter`}
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {options.map((option) => (
          <ToggleButton
            key={option}
            value={option}
            sx={{
              border: "none",
              borderRadius: "20px !important",
              px: 2,
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
              },
              "&.Mui-selected:hover": { backgroundColor: "primary.dark" },
            }}
          >
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

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
            전문가 서비스
          </Typography>
        }
      />

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <FilterGroup
          title="지역"
          options={regions}
          value={selectedRegion}
          onChange={handleRegionChange}
        />
        <Divider />
        <FilterGroup
          title="제공 서비스"
          options={services}
          value={selectedService}
          onChange={handleServiceChange}
        />
      </Paper>

      {/* Experts Grid */}
      <Grid container spacing={4}>
        {loading ? (
          <div style={{ width: "100%", textAlign: "center", padding: "20px" }}>
            Loading...
          </div>
        ) : (
          filteredExperts.map((expert, index) => (
            <Grid container size={{ xs: 12, sm: 6 }} key={index}>
              <Card
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  backgroundColor: "#fff",
                  border: "1px solid",
                  borderColor: "divider",
                  p: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={expert.photo_url}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body2" color="primary">
                        {expert.location}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {expert.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minHeight: 60 }}
                  >
                    {expert.description}
                  </Typography>
                  <Box
                    sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {expert.services.map((service) => (
                      <Chip key={service} label={service} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
