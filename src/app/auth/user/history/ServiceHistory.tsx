"use client";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams, GridRowParams } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ScreenSearchDesktopOutlinedIcon from "@mui/icons-material/ScreenSearchDesktopOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import { fetchUserApplications } from "../actions";
import { getBiddingApplicationById } from "@/app/api/bidding-applications/actions";
import { useAuth } from "@/contexts/AuthContext";
import { uploadElectronicIdentityDocument } from "@/utils/supabase/fileUpload";

interface BiddingApplication {
  id: string
  case_number?: string
  print_case_number?: string
  bid_amount?: number
  bid_date?: string
  created_at?: string
  status?: string
  result?: string
  result_notes?: string
  electronic_identity_document_url?: string
  electronic_identity_document_name?: string
  electronic_identity_document_uploaded_at?: string
  user_id?: string
  experts?: {
    name?: string
  }[] | {
    name?: string
  } | null
}

// --- Styled Components for a Custom Stepper Look ---
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    background: theme.palette.primary.main,
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...(ownerState.completed && {
    background: theme.palette.primary.main,
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <HomeOutlinedIcon />,
    2: <ScreenSearchDesktopOutlinedIcon />,
    3: <PersonSearchOutlinedIcon />,
    4: <DescriptionOutlinedIcon />,
    5: <PlaylistAddCheckOutlinedIcon />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

// --- Main Page Component ---
const ServiceHistory = () => {
  const [currentTab, setCurrentTab] = useState("proxyBidding");
  const [applications, setApplications] = useState<BiddingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<BiddingApplication | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        const result = await fetchUserApplications();

        if (result.success) {
          setApplications(result.data);
          setError(null);
        } else {
          const errorMessage = result.error || "신청 내역을 불러오는데 실패했습니다.";
          setError(errorMessage);
          setApplications([]);
        }
      } catch (err) {
        console.error("ServiceHistory: Error loading applications:", err);
        const errorMessage = err instanceof Error ? err.message : "신청 내역을 불러오는 중 오류가 발생했습니다.";
        setError(errorMessage);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    // Only load if user is available
    if (user) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleViewDetails = async (applicationId: string) => {
    try {
      setLoadingDetail(true);
      setDetailDialogOpen(true);
      const detailData = await getBiddingApplicationById(applicationId);
      setSelectedApplication(detailData);
    } catch (error) {
      console.error("Error loading application details:", error);
      setError("신청 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedApplication(null);
  };
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedApplication) return;

    try {
      setUploadingFile(true);

      const result = await uploadElectronicIdentityDocument(
        selectedApplication.id,
        file
      );

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update the selected application with the new document
      setSelectedApplication({
        ...selectedApplication,
        electronic_identity_document_url: result.url,
        electronic_identity_document_name: file.name,
        electronic_identity_document_uploaded_at: new Date().toISOString(),
      });

      alert("전자본인서명확인서가 성공적으로 업로드되었습니다.");
    } catch (error) {
      console.error("File upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "파일 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setUploadingFile(false);
    }
  };
  const handleFileDownload = () => {
    if (selectedApplication?.electronic_identity_document_url) {
      // Open file in new tab for download
      window.open(
        selectedApplication.electronic_identity_document_url,
        "_blank"
      );
    }
  };

  const steps = [
    "대리입찰 신청",
    "신청내역 확인",
    "전문가 배정",
    "서류등록 및 보증금 입금",
    "입찰준비 완료",
  ];

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'info' | 'default' => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "대기":
        return "warning";
      case "approved":
      case "승인":
        return "success";
      case "rejected":
      case "거절":
        return "error";
      case "in_progress":
      case "진행중":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ko-KR");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string) => {
    try {
      const num = typeof amount === "string" ? parseInt(amount) : amount;
      return new Intl.NumberFormat("ko-KR").format(num) + "원";
    } catch {
      return amount + "원";
    }
  };

  // DataGrid columns definition
  const columns: GridColDef[] = [
    {
      field: "case_number",
      headerName: "사건번호",
      width: 180,
      renderCell: (params: { row: BiddingApplication }) => {
        return (
          params?.row?.print_case_number ||
          params?.row?.case_number ||
          "-"
        );
      },
    },
    {
      field: "bid_amount",
      headerName: "입찰금액",
      width: 150,
      renderCell: (params: { row: BiddingApplication }) => {
        return params?.row?.bid_amount ? formatCurrency(params.row.bid_amount) : "-";
      },
    },
    {
      field: "bid_date",
      headerName: "입찰기일",
      width: 120,
      renderCell: (params: { row: BiddingApplication }) => {
        return params?.row?.bid_date ? params.row.bid_date : "-";
      },
    },
    {
      field: "created_at",
      headerName: "요청일자",
      width: 120,
      renderCell: (params: { row: BiddingApplication }) => {
        return formatDate(params?.row?.created_at || "");
      },
    },
    {
      field: "expert_name",
      headerName: "대리인",
      width: 120,
      renderCell: (params: { row: BiddingApplication }) => {
        const experts = params?.row?.experts;
        if (Array.isArray(experts) && experts.length > 0) {
          return experts[0]?.name || "미배정";
        } else if (experts && typeof experts === 'object' && 'name' in experts) {
          return experts.name || "미배정";
        }
        return "미배정";
      },
    },
    {
      field: "status",
      headerName: "처리상태",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params?.row?.status || "대기중";
        return (
          <Chip
            label={status}
            color={getStatusColor(status)}
            variant="outlined"
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "상세보기",
      width: 100,
      getActions: (params: GridRowParams<BiddingApplication>) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="상세보기"
          onClick={() => handleViewDetails(params?.row?.id)}
          title="상세보기"
        />,
      ],
    },
  ];

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        입찰 신청 내역
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="service history tabs"
        >
          <Tab label="대리입찰 서비스" value="proxyBidding" />
          <Tab label="전문가 서비스" value="expertService" />
        </Tabs>
      </Box>

      {currentTab === "proxyBidding" && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              backgroundColor: "#f9fafb",
              borderRadius: 4,
              mb: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
            >
              입찰신청 이후 절차안내
            </Typography>
            <Stepper
              alternativeLabel
              activeStep={1}
              connector={<ColorlibConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorlibStepIcon}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Paper elevation={0} variant="outlined" sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={applications}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnSelector
              disableDensitySelector
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              localeText={{
                noRowsLabel: "입찰신청 내역이 없습니다.",
                footerRowSelected: () => "",
                footerTotalRows: "총 행 수:",
                paginationRowsPerPage: "페이지당 행 수:",
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    py: 4
                  }}>
                    <InboxOutlinedIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      입찰신청 내역이 없습니다.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      서비스를 신청하고 진행상황을 확인해보세요.
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Paper>
        </Box>
      )}

      {currentTab === "expertService" && (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <InboxOutlinedIcon sx={{ fontSize: 60, color: "grey.400" }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            전문가 서비스 신청 내역이 없습니다.
          </Typography>
        </Box>
      )}

      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          신청 상세 내역
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDetailDialog}
            aria-label="close"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 3,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                상세 정보를 불러오는 중...
              </Typography>
            </Box>
          ) : selectedApplication ? (
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                    gutterBottom
                  >
                    사건번호
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedApplication.case_number ||
                      "-"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                    gutterBottom
                  >
                    신청일자
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedApplication.created_at ? formatDate(selectedApplication.created_at) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                    gutterBottom
                  >
                    입찰금액
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedApplication.bid_amount
                      ? formatCurrency(selectedApplication.bid_amount)
                      : "-"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                    gutterBottom
                  >
                    입찰기일
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedApplication.bid_date
                      ? formatDate(selectedApplication.bid_date)
                      : "-"}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                    gutterBottom
                  >
                    신청 상태
                  </Typography>
                  <Chip
                    label={selectedApplication.status || "대기중"}
                    color={getStatusColor(selectedApplication.status || 'pending') as 'success' | 'warning' | 'error' | 'info'}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                    gutterBottom
                  >
                    대리인
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {(() => {
                      const experts = selectedApplication.experts;
                      if (Array.isArray(experts) && experts.length > 0) {
                        return experts[0]?.name || "미배정";
                      } else if (experts && typeof experts === 'object' && 'name' in experts) {
                        return experts.name || "미배정";
                      }
                      return "미배정";
                    })()}
                  </Typography>
                </Box>
              </Box>
              {selectedApplication.result && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                      gutterBottom
                    >
                      입찰 결과
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedApplication.result}
                    </Typography>
                  </Box>
                  {selectedApplication.result_notes && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                        gutterBottom
                      >
                        비고
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {selectedApplication.result_notes}
                      </Typography>
                    </Box>
                  )}
                </>
              )}{" "}
              <Divider sx={{ my: 2 }} />
              {/* Electronic Identity Verification Document Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "primary.main", mb: 2 }}
                >
                  전자본인서명확인서
                </Typography>{" "}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    {selectedApplication.electronic_identity_document_url ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          업로드된 파일:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {selectedApplication.electronic_identity_document_name ||
                            "전자본인서명확인서"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          업로드일:{" "}                            {selectedApplication.electronic_identity_document_uploaded_at 
                              ? formatDate(selectedApplication.electronic_identity_document_uploaded_at)
                              : 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        전자본인서명확인서가 업로드되지 않았습니다.
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    {selectedApplication.electronic_identity_document_url ? (
                      <Button
                        startIcon={<FileDownloadIcon />}
                        onClick={handleFileDownload}
                        size="small"
                        variant="outlined"
                        href={
                          selectedApplication.electronic_identity_document_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        다운로드
                      </Button>
                    ) : (
                      <Box>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                          id="electronic-identity-upload"
                          disabled={uploadingFile}
                        />
                        <label htmlFor="electronic-identity-upload">
                          <Button
                            component="span"
                            startIcon={<UploadFileIcon />}
                            disabled={uploadingFile}
                            size="small"
                            variant="contained"
                          >
                            {uploadingFile ? "업로드 중..." : "파일 업로드"}
                          </Button>
                        </label>
                      </Box>
                    )}
                  </CardActions>
                </Card>
                <Typography variant="caption" color="text.secondary">
                  지원 형식: PDF, DOC, DOCX, JPG, JPEG, PNG (최대 10MB)
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              상세 정보를 찾을 수 없습니다.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ServiceHistory;
