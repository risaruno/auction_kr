"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Modal,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Drawer,
  Divider,
  SelectChangeEvent,
  Avatar,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import {
  fetchBiddingApplications,
  updateBiddingApplicationStatus,
  assignExpertToBid,
  updatePaymentStatus,
  updateDepositStatus,
  updateBidResult,
  getBiddingApplicationById,
} from "@/app/api/bidding-applications/actions";
import { fetchExperts } from "@/app/api/expert/actions";
import { BiddingApplication, Expert } from "@/types/api";

const statusOptions = [
  { value: "pending", label: "Pending", color: "warning" as const },
  { value: "approved", label: "Approved", color: "info" as const },
  { value: "in_progress", label: "In Progress", color: "primary" as const },
  { value: "completed", label: "Completed", color: "success" as const },
  { value: "rejected", label: "Rejected", color: "error" as const },
];

const paymentStatusOptions = [
  { value: "pending", label: "Pending", color: "warning" as const },
  { value: "paid", label: "Paid", color: "success" as const },
  { value: "failed", label: "Failed", color: "error" as const },
];

const depositStatusOptions = [
  { value: "pending", label: "Pending", color: "warning" as const },
  { value: "confirmed", label: "Confirmed", color: "success" as const },
  { value: "refunded", label: "Refunded", color: "info" as const },
];

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// --- Main Admin Panel Component ---
const BiddingManagementContent = () => {
  const [applications, setApplications] = useState<BiddingApplication[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination and filtering
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Detail drawer
  const [selectedApplication, setSelectedApplication] =
    useState<BiddingApplication | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [resultNotes, setResultNotes] = useState("");

  // Load bidding applications
  const loadBiddingApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBiddingApplications({
        page: paginationModel.page + 1, // API expects 1-based pagination
        limit: paginationModel.pageSize,
        status: statusFilter || undefined,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      setApplications(result.data);
      setTotalCount(result.total);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch bidding applications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load experts
  const loadExperts = async () => {
    try {
      const result = await fetchExperts({ limit: 100 });
      setExperts(result.data);
    } catch (error) {
      console.error("Failed to load experts:", error);
    }
  };

  useEffect(() => {
    loadBiddingApplications();
    loadExperts();
  }, [paginationModel.page, paginationModel.pageSize, statusFilter]);

  // Search handlers
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on new search
    loadBiddingApplications();
  };

  const handleStatusFilter = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on filter change
  };

  // Pagination handlers
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleViewDetails = async (application: BiddingApplication) => {
    try {
      const fullApplicationData = await getBiddingApplicationById(
        application.id
      );
      setSelectedApplication(fullApplicationData);
      setResultNotes(fullApplicationData.result_notes || "");
      setIsDetailsDrawerOpen(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch application details"
      );
    }
  };

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false);
    setSelectedApplication(null);
    setResultNotes("");
  };

  const handleUpdateStatus = async (event: any) => {
    if (!selectedApplication) return;

    const newStatus = event.target.value;
    setError(null);
    try {
      await updateBiddingApplicationStatus(selectedApplication.id, newStatus);
      setSuccessMessage("Status updated successfully");
      await loadBiddingApplications(); // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id);
      setSelectedApplication(updated);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update status"
      );
    }
  };

  const handleAssignExpert = async (event: any) => {
    if (!selectedApplication) return;

    const expertId = event.target.value;
    setError(null);
    try {
      await assignExpertToBid(selectedApplication.id, expertId);
      setSuccessMessage("Expert assigned successfully");
      await loadBiddingApplications(); // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id);
      setSelectedApplication(updated);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to assign expert"
      );
    }
  };
  const handleConfirmDeposit = async () => {
    if (!selectedApplication) return;

    // Add confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to confirm the deposit has been received?"
    );
    if (!confirmed) return;

    setError(null);
    try {
      await updateDepositStatus(selectedApplication.id, "confirmed");
      setSuccessMessage("Deposit confirmed successfully");
      await loadBiddingApplications(); // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id);
      setSelectedApplication(updated);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to confirm deposit"
      );
    }
  };

  const handleConfirmServiceFee = async () => {
    if (!selectedApplication) return;

    // Add confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to confirm the service fee payment?"
    );
    if (!confirmed) return;

    setError(null);
    try {
      await updatePaymentStatus(selectedApplication.id, "paid");
      setSuccessMessage("Service fee payment confirmed successfully");
      await loadBiddingApplications(); // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id);
      setSelectedApplication(updated);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to confirm service fee payment"
      );
    }
  };

  const handleSaveResult = async () => {
    if (!selectedApplication) return;

    setError(null);
    try {
      await updateBidResult(selectedApplication.id, resultNotes, "completed");
      setSuccessMessage("Bid result saved successfully");
      await loadBiddingApplications(); // Refresh the data
      // Update the selected application
      const updated = await getBiddingApplicationById(selectedApplication.id);
      setSelectedApplication(updated);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save result"
      );
    }
  };

  // Close notifications
  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  const getStatusChip = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return (
      <Chip
        label={statusOption?.label || status}
        color={statusOption?.color || "default"}
        size="small"
      />
    );
  };

  const getPaymentStatusChip = (status: string) => {
    const statusOption = paymentStatusOptions.find(
      (opt) => opt.value === status
    );
    return (
      <Chip
        label={statusOption?.label || status}
        color={statusOption?.color || "default"}
        size="small"
        variant="outlined"
      />
    );
  };

  const getDepositStatusChip = (status: string) => {
    const statusOption = depositStatusOptions.find(
      (opt) => opt.value === status
    );
    return (
      <Chip
        label={statusOption?.label || status}
        color={statusOption?.color || "default"}
        size="small"
        variant="filled"
      />
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  // Define DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "case_number",
      headerName: "Application",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "start",
            justifyContent: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {params.row.case_number || `App #${params.row.id}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.court_name}
          </Typography>
        </Box>
      ),
    },
    {
      field: "user",
      headerName: "User",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: "primary.light",
              fontSize: "0.8rem",
            }}
          >
            {params.row.user?.full_name?.charAt(0) || "?"}
          </Avatar>
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="body2">
              {params.row.user?.full_name || "N/A"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.user?.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "expert",
      headerName: "Expert",
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        params.row.expert ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography variant="body2">{params.row.expert.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Expert assigned
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Not assigned
          </Typography>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        getStatusChip(params.row.status),
    },
    {
      field: "payment_status",
      headerName: "Payment",
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        getPaymentStatusChip(params.row.payment_status || "pending"),
    },
    {
      field: "deposit_status",
      headerName: "Deposit",
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        getDepositStatusChip(params.row.deposit_status || "pending"),
    },
    {
      field: "created_at",
      headerName: "Date",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "start",
            justifyContent: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {formatDate(params.row.created_at)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => handleViewDetails(params.row)}
          title="View Details"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            Bidding Applications Management
          </Typography>
        </Box>

        {/* Search and Filter Controls */}
        <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            variant="filled"
            label="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilter}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={applications}
            columns={columns}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[5, 10, 25, 50]}
            rowCount={totalCount}
            paginationMode="server"
            disableRowSelectionOnClick
          />
        </Box>
      </Box>

      {/* --- Bid Details Side Drawer --- */}
      <Drawer
        anchor="right"
        open={isDetailsDrawerOpen}
        onClose={handleCloseDetailsDrawer}
      >
        <Box sx={{ width: { xs: "90vw", sm: 500 }, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">Application Details</Typography>
            <IconButton onClick={handleCloseDetailsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedApplication && (
            <>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {selectedApplication.case_number ||
                  `Application #${selectedApplication.id}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                User: {selectedApplication.user?.full_name || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {selectedApplication.user?.email || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Court: {selectedApplication.court_name || "N/A"}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {/* --- Status Management --- */}
              <Box mb={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Current Status</InputLabel>
                  <Select
                    value={selectedApplication?.status || "pending"}
                    label="Current Status"
                    onChange={handleUpdateStatus}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Assigned Expert</InputLabel>
                  <Select
                    value={selectedApplication?.expert_id || ""}
                    label="Assigned Expert"
                    onChange={handleAssignExpert}
                  >
                    <MenuItem value="">
                      <em>Assign an expert...</em>
                    </MenuItem>
                    {experts.map((expert) => (
                      <MenuItem key={expert.id} value={expert.id}>
                        {expert.name} ({expert.location})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Divider sx={{ my: 2 }} /> {/* --- Payment & Deposit --- */}
              <Box mb={3}>
                <Typography variant="h6">Financials</Typography>
                <Box
                  sx={{
                    mt: 1,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getPaymentStatusChip(
                      selectedApplication.payment_status || "pending"
                    )}
                    <Typography variant="caption">Service Fee</Typography>
                  </Box>
                  {selectedApplication.payment_status !== "paid" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={handleConfirmServiceFee}
                      startIcon={<CheckCircleIcon />}
                    >
                      Confirm Payment
                    </Button>
                  )}
                </Box>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getDepositStatusChip(
                      selectedApplication.deposit_status || "pending"
                    )}
                    <Typography variant="caption">Deposit</Typography>
                  </Box>
                  {selectedApplication.deposit_status !== "confirmed" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={handleConfirmDeposit}
                      startIcon={<CheckCircleIcon />}
                    >
                      Confirm Deposit
                    </Button>
                  )}
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* --- Document Management --- */}
              <Box>
                <Typography variant="h6">Bid Result</Typography>
                <TextField
                  fullWidth
                  label="Bid Result Notes (e.g., successful bid amount, outcome)"
                  multiline
                  rows={3}
                  margin="normal"
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                />
                <Button
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={handleSaveResult}
                >
                  Save Result
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Snackbar Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default function BiddingManagementPanel() {
  return <BiddingManagementContent />;
}
