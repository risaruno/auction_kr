"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  Divider,
  Toolbar,
  Typography,
  CssBaseline,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  LockReset as LockResetIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  fetchUsers,
  suspendUser,
  updateUserPoints,
  getUserById,
} from "@/app/api/auth/users/actions";
import { User } from "@/types/api";

// --- Main Admin Panel Content ---
const UserManagementContent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // --- Fetch Users with pagination and search ---
  const loadUsers = async (searchTerm?: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const result = await fetchUsers({
        search: searchTerm,
        page: pageNum,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      setUsers(result.data);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to fetch users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(searchQuery, page);
  }, [page]);

  // Handle DataGrid pagination changes
  useEffect(() => {
    const newPage = paginationModel.page + 1; // DataGrid uses 0-based indexing
    if (newPage !== page) {
      setPage(newPage);
    }
  }, [paginationModel.page]);

  // --- Search handler ---
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    loadUsers(searchQuery, 1);
  };

  // --- Handlers ---
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsDrawerOpen(true);
  };

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleOpenSuspendDialog = (user: User) => {
    setSelectedUser(user);
    setOpenSuspendDialog(true);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    try {
      await suspendUser(selectedUser.id);
      setSnackbar({
        open: true,
        message: "User suspended successfully",
        severity: "success",
      });
      loadUsers(searchQuery, page); // Refresh the list
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to suspend user",
        severity: "error",
      });
    } finally {
      setOpenSuspendDialog(false);
    }
  };

  const handleTriggerPasswordReset = async () => {
    if (!selectedUser) return;
    try {
      // Create FormData for the findPassword action
      const formData = new FormData();
      formData.append("email", selectedUser.email);

      // Import and use the findPassword action
      const { findPassword } = await import("@/app/api/auth/sign/actions");
      const result = await findPassword(
        { error: null, message: null },
        formData
      );

      if (result.error) {
        setSnackbar({
          open: true,
          message: result.error,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Password reset link sent to ${selectedUser.email}`,
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send password reset",
        severity: "error",
      });
    } finally {
      setOpenResetDialog(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // DataGrid columns definition
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "100%",
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            {params.value?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {params.value || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      hideable: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Active"
              ? "success"
              : params.value === "Suspended"
                ? "error"
                : "warning"
          }
          size="small"
        />
      ),
    },
    {
      field: "signupDate",
      headerName: "Signup Date",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}
        >
          <IconButton
            size="small"
            onClick={() => handleViewDetails(params.row)}
            sx={{ color: "primary.main" }}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenSuspendDialog(params.row)}
            sx={{ color: "warning.main" }}
            disabled={params.row.status === "Suspended"}
          >
            <BlockIcon />
          </IconButton>
        </Box>
      ),
      sortable: false,
      filterable: false,
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
          <Typography variant="h5">사용자 관리</Typography>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ display: "flex", gap: 1 }}
          >
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="outlined" size="small">
              <SearchIcon />
            </Button>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 0,
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "grey.50",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Box>

      {/* --- User Details Side Drawer --- */}
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
            <Typography variant="h5">User Details</Typography>
            <IconButton onClick={handleCloseDetailsDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedUser && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{ width: 64, height: 64, mr: 2, bgcolor: "primary.main" }}
                >
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.phone}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LockResetIcon />}
                onClick={() => setOpenResetDialog(true)}
                sx={{ my: 2 }}
              >
                Trigger Password Reset
              </Button>
              {/* Tabs for more details can be added here */}
            </>
          )}
        </Box>
      </Drawer>

      {/* --- Confirmation Dialogs --- */}
      <Dialog
        open={openSuspendDialog}
        onClose={() => setOpenSuspendDialog(false)}
      >
        <DialogTitle>Confirm Suspension</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to suspend "{selectedUser?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuspendDialog(false)}>Cancel</Button>
          <Button onClick={handleSuspendUser} color="warning">
            Suspend
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Confirm Password Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send a password reset link to {selectedUser?.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button onClick={handleTriggerPasswordReset}>Send Link</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Wrapper component to include the main layout
export default function UserManagementPanel() {
  return (
    <>
      <UserManagementContent />
    </>
  );
}
