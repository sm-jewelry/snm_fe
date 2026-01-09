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
  MenuItem,
  Chip,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { fetcher } from "../../../lib/api";
import DataTable from "../../../components/admin/common/DataTable";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import LoadingState from "../../../components/admin/common/LoadingState";
import { useAdminAuth } from "../../../hooks/useAdminAuth";

interface CategoryParent {
  _id: string;
  name: string;
  level: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  level: string;
  parents?: CategoryParent[];
}

export default function CategoriesPage() {
  // Protected route - only admins can access
  const { loading: authLoading, user } = useAdminAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    level: "C1",
    parents: [] as string[],
  });
  const [c1Categories, setC1Categories] = useState<Category[]>([]);
  const [c2Categories, setC2Categories] = useState<Category[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetcher("/api/categories");
      setCategories(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Failed to load categories",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadParentLists = async () => {
    try {
      const c1 = await fetcher("/api/categories/level/C1");
      const c2 = await fetcher("/api/categories/level/C2");
      setC1Categories(c1);
      setC2Categories(c2);
    } catch (error) {
      console.error("Failed to load parent categories:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadCategories();
      loadParentLists();
    }
  }, [authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetcher(`/api/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setSnackbar({
          open: true,
          message: "Category updated successfully",
          severity: "success",
        });
      } else {
        await fetcher("/api/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setSnackbar({
          open: true,
          message: "Category created successfully",
          severity: "success",
        });
      }

      setDialogOpen(false);
      setForm({ name: "", description: "", level: "C1", parents: [] });
      setEditingId(null);
      await loadCategories();
      await loadParentLists();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Operation failed",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = (cat?: Category) => {
    if (cat) {
      setForm({
        name: cat.name,
        description: cat.description || "",
        level: cat.level,
        parents: cat.parents?.map((p) => p._id) || [],
      });
      setEditingId(cat._id);
    } else {
      setForm({ name: "", description: "", level: "C1", parents: [] });
      setEditingId(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ name: "", description: "", level: "C1", parents: [] });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await fetcher(`/api/categories/${deleteDialog.id}`, { method: "DELETE" });
      setSnackbar({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
      setDeleteDialog({ open: false, id: null });
      await loadCategories();
      await loadParentLists();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Delete failed",
        severity: "error",
      });
    }
  };

  const filteredParents =
    form.level === "C2"
      ? c1Categories
      : form.level === "C3"
      ? c2Categories
      : [];

  const getLevelColor = (level: string): "primary" | "secondary" | "info" => {
    switch (level) {
      case "C1":
        return "primary";
      case "C2":
        return "secondary";
      case "C3":
        return "info";
      default:
        return "primary";
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    { field: "description", headerName: "Description", flex: 2, minWidth: 250 },
    {
      field: "level",
      headerName: "Level",
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} color={getLevelColor(params.value)} size="small" />
      ),
    },
    {
      field: "parents",
      headerName: "Parent",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        if (!params.value || params.value.length === 0) return "—";
        return params.value.map((p: CategoryParent) => p.name).join(", ");
      },
    },
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

  const rows = categories.map((cat) => ({
    id: cat._id,
    _id: cat._id,
    name: cat.name,
    description: cat.description || "",
    level: cat.level,
    parents: cat.parents || [],
  }));

  if (authLoading) {
    return <LoadingState message="Verifying admin access..." />;
  }

  if (loading) {
    return <LoadingState message="Loading categories..." />;
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Manage Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable columns={columns} rows={rows} pageSize={10} autoHeight />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Category Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              label="Level"
              value={form.level}
              onChange={(e) =>
                setForm({ ...form, level: e.target.value, parents: [] })
              }
              required
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="C1">C1 (Top Level)</MenuItem>
              <MenuItem value="C2">C2 (Sub Category)</MenuItem>
              <MenuItem value="C3">C3 (Sub-Sub Category)</MenuItem>
            </TextField>

            {/* Parent Selection for C2 and C3 */}
            {(form.level === "C2" || form.level === "C3") && (
              <TextField
                select
                label={`Select Parent ${form.level === "C2" ? "C1" : "C2"} Category`}
                value={form.parents[0] || ""}
                onChange={(e) => setForm({ ...form, parents: [e.target.value] })}
                required
                fullWidth
                helperText={
                  filteredParents.length === 0
                    ? `No ${form.level === "C2" ? "C1" : "C2"} categories available`
                    : ""
                }
              >
                <MenuItem value="">
                  <em>Select Parent</em>
                </MenuItem>
                {filteredParents.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} ({p.level})
                  </MenuItem>
                ))}
              </TextField>
            )}
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
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
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
