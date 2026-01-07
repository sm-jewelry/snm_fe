import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Collections as CollectionsIcon,
} from "@mui/icons-material";
import { fetcher } from "../../../lib/api";
import DataTable from "../../../components/admin/common/DataTable";
import ImageUploadField from "../../../components/admin/common/ImageUploadField";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import LoadingState from "../../../components/admin/common/LoadingState";

interface Collection {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [form, setForm] = useState<Partial<Collection>>({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load all collections
  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await fetcher("/api/collections");
      setCollections(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Failed to load collections",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetcher("/api/collections/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/collections/${editingId}`
        : "/api/collections";

      await fetcher(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          imageUrl: form.imageUrl,
        }),
      });

      setSnackbar({
        open: true,
        message: `Collection ${editingId ? "updated" : "created"} successfully`,
        severity: "success",
      });

      setDialogOpen(false);
      setForm({ name: "", description: "", imageUrl: "" });
      setEditingId(null);
      await loadCollections();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Operation failed",
        severity: "error",
      });
    }
  };

  // Open dialog for add/edit
  const handleOpenDialog = (col?: Collection) => {
    if (col) {
      setForm({
        name: col.name,
        description: col.description,
        imageUrl: col.imageUrl,
      });
      setEditingId(col._id);
    } else {
      setForm({ name: "", description: "", imageUrl: "" });
      setEditingId(null);
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ name: "", description: "", imageUrl: "" });
    setEditingId(null);
  };

  // Delete collection
  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await fetcher(`/api/collections/${deleteDialog.id}`, { method: "DELETE" });
      setSnackbar({
        open: true,
        message: "Collection deleted successfully",
        severity: "success",
      });
      setDeleteDialog({ open: false, id: null });
      await loadCollections();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Delete failed",
        severity: "error",
      });
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt={params.row.name}
          variant="rounded"
          sx={{ width: 56, height: 56 }}
        >
          <CollectionsIcon />
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    { field: "description", headerName: "Description", flex: 2, minWidth: 300 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => setDeleteDialog({ open: true, id: params.row._id })}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const rows = collections.map((col) => ({
    id: col._id,
    _id: col._id,
    name: col.name,
    description: col.description,
    imageUrl: col.imageUrl,
  }));

  if (loading) {
    return <LoadingState message="Loading collections..." />;
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Manage Collections
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Collection
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        autoHeight
      />

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? "Edit Collection" : "Add New Collection"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Collection Name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Description"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <ImageUploadField
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              onUpload={handleImageUpload}
              label="Collection Image"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Collection"
        message="Are you sure you want to delete this collection? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
