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
  Avatar,
  Chip,
  IconButton,
  Modal,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import {
  fetchExperts,
  createExpert,
  updateExpert,
  deleteExpert,
} from "@/app/api/expert/actions";
import { Expert, ExpertCreateRequest, ExpertUpdateRequest } from "@/types/api";

const allLocations = [
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
const allServices = [
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
const ExpertsContent = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Partial<Expert> | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Pagination and search states
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // --- Fetch Experts with pagination and search ---
  const loadExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExperts({
        page: paginationModel.page + 1, // API expects 1-based pagination
        limit: paginationModel.pageSize,
        search: searchQuery || undefined,
        location: selectedLocation || undefined,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      setExperts(result.data);
      setTotalCount(result.total);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch experts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperts();
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    searchQuery,
    selectedLocation,
  ]);

  // Search handlers
  const handleSearch = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page on new search
    loadExperts();
  };

  const handleLocationFilter = (event: SelectChangeEvent<string>) => {
    setSelectedLocation(event.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page on filter change
  };

  // Pagination handlers
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  // --- Modal & Form Handlers ---
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedExpert({
      name: "",
      location: "",
      description: "",
      services: [],
    });
    setOpenFormModal(true);
  };
  const handleOpenEditModal = (expert: Expert) => {
    setIsEditing(true);
    setSelectedExpert(expert);
    setOpenFormModal(true);
    // Show existing photo if available
    if (expert.photo_url) {
      setProfileImagePreview(expert.photo_url);
    }
  };
  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setSelectedExpert(null);
    clearImagePreview();
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSelectedExpert((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setSelectedExpert((prev) => ({
      ...prev,
      services: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // --- Profile Image Upload Handlers ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (
    expertId: string
  ): Promise<string | null> => {
    if (!profileImageFile) return null;

    try {
      setUploadingImage(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", profileImageFile);
      formData.append("expertId", expertId);
      formData.append("imageType", "profile");

      // TODO: Implement actual image upload to your server/storage
      // For now, we'll simulate the upload and return a mock URL
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockImageUrl = `/uploads/experts/${expertId}/profile.jpg`;
      return mockImageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload profile image");
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImagePreview = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  // --- CRUD Action Handlers ---
  const handleSaveExpert = async () => {
    if (!selectedExpert) return;

    setError(null);
    try {
      let updatedExpert: any = { ...selectedExpert }; // Upload profile image if exists
      if (profileImageFile && selectedExpert.id) {
        const imageUrl = await uploadProfileImage(selectedExpert.id);
        updatedExpert = { ...updatedExpert, photo_url: imageUrl };
      }

      if (isEditing && selectedExpert.id) {
        await updateExpert(updatedExpert as ExpertUpdateRequest);
        setSuccessMessage("Expert updated successfully");
      } else {
        await createExpert(updatedExpert as ExpertCreateRequest);
        setSuccessMessage("Expert created successfully");
      }

      await loadExperts(); // Refresh the list
      handleCloseFormModal();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save expert"
      );
    }
  };

  const handleDeleteExpert = async () => {
    if (!selectedExpert || !selectedExpert.id) return;

    setError(null);
    try {
      await deleteExpert(selectedExpert.id);
      setSuccessMessage("Expert deleted successfully");
      await loadExperts(); // Refresh the list
      handleCloseDeleteDialog();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete expert"
      );
    }
  };

  const handleOpenDeleteDialog = (expert: Expert) => {
    setSelectedExpert(expert);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedExpert(null);
  };

  // Close snackbars
  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  // Define DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: "primary.light",
            }}
            src={params.row.photo_url}
          >
            {params.row.name.charAt(0)}
          </Avatar>
          {params.row.name}
        </Box>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 150,
    },
    {
      field: "services",
      headerName: "Services",
      width: 300,

      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {params.row.services.map((service: string) => (
            <Chip key={service} label={service} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenEditModal(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDeleteDialog(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
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
            전문가 관리
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={handleOpenCreateModal}
          >
            새 전문가 추가
          </Button>
        </Box>

        {/* Search and Filter Controls */}
        <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Search experts..."
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
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              label="Location"
              onChange={handleLocationFilter}
            >
              <MenuItem value="">All Locations</MenuItem>
              {allLocations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={experts}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={totalCount}
            loading={loading}
            pageSizeOptions={[5, 10, 25, 50]}
            paginationMode="server"
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
            }}
          />
        </Box>
      </Box>

      <Modal open={openFormModal} onClose={handleCloseFormModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEditing ? "Edit Expert" : "Add New Expert"}
          </Typography>
          <IconButton
            onClick={handleCloseFormModal}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Grid container spacing={2}>
            {" "}
            <Grid size={{ xs: 12 }}>
              <TextField
                name="name"
                label="Expert Name"
                value={selectedExpert?.name || ""}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            {/* Profile Picture Upload Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                프로필 사진
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {" "}
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.light",
                  }}
                  src={profileImagePreview || selectedExpert?.photo_url}
                >
                  {!profileImagePreview &&
                    !selectedExpert?.photo_url &&
                    (selectedExpert?.name
                      ? selectedExpert.name.charAt(0)
                      : "?")}
                </Avatar>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      disabled={uploadingImage}
                      sx={{ mb: 1 }}
                    >
                      {uploadingImage ? "업로드 중..." : "사진 선택"}
                    </Button>
                  </label>
                  {(profileImagePreview || selectedExpert?.photo_url) && (
                    <Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={clearImagePreview}
                        color="error"
                      >
                        사진 제거
                      </Button>
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    JPG, PNG 파일만 지원 (최대 5MB)
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={selectedExpert?.location || ""}
                  label="Location"
                  onChange={handleFormChange as any}
                >
                  {allLocations.map((loc) => (
                    <MenuItem key={loc} value={loc}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="description"
                label="Description"
                value={selectedExpert?.description || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={selectedExpert?.services || []}
                  onChange={handleMultiSelectChange}
                  input={<OutlinedInput label="Services" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {allServices.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}{" "}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{ xs: 12 }}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button variant="outlined" onClick={handleCloseFormModal}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSaveExpert}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the expert "{selectedExpert?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteExpert} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error/Success Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default function ExpertsAdminPanel() {
  return (
    <>
      <ExpertsContent />
    </>
  );
}
