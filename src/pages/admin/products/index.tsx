import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Avatar,
  Chip,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { fetcher } from "../../../lib/api";
import DataTable from "../../../components/admin/common/DataTable";
import ImageUploadField from "../../../components/admin/common/ImageUploadField";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import LoadingState from "../../../components/admin/common/LoadingState";
import { useAdminAuth } from "../../../hooks/useAdminAuth";

interface Product {
  _id: string;
  title: string;
  price: number;
  collectionId?: { _id: string; name: string }; // Keep for backward compatibility
  collection?: { _id: string; name: string }; // New structure
  URL: string;
  description: string;
  stock: number;
  SKU: string;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  isFeatured?: boolean;
}

interface Collection {
  _id: string;
  name: string;
}

export default function AdminProductsPage() {
  // Protected route - only admins can access
  const { loading: authLoading, user } = useAdminAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [form, setForm] = useState<Partial<Product>>({
    title: "",
    price: 0,
    collectionId: { _id: "", name: "" },
    URL: "",
    description: "",
    stock: 0,
    SKU: "",
    rating: 0,
    reviewCount: 0,
    brand: "",
    isFeatured: false,
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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetcher("/api/catalogs");
      setProducts(data.products || data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Failed to load products",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await fetcher("/api/collections");
      setCollections(data);
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadProducts();
      loadCollections();
    }
  }, [authLoading, user]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetcher("/api/catalogs/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        price: form.price,
        collectionId: typeof form.collectionId === 'object' ? form.collectionId?._id : form.collectionId,
        URL: form.URL,
        description: form.description,
        stock: form.stock,
        SKU: form.SKU,
        rating: form.rating || 0,
        reviewCount: form.reviewCount || 0,
        brand: form.brand || "",
        isFeatured: form.isFeatured || false,
      };

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/catalogs/${editingId}` : "/api/catalogs";

      await fetcher(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSnackbar({
        open: true,
        message: `Product ${editingId ? "updated" : "created"} successfully`,
        severity: "success",
      });

      setDrawerOpen(false);
      setForm({
        title: "",
        price: 0,
        collectionId: { _id: "", name: "" },
        URL: "",
        description: "",
        stock: 0,
        SKU: "",
        rating: 0,
        reviewCount: 0,
        brand: "",
        isFeatured: false,
      });
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Operation failed",
        severity: "error",
      });
    }
  };

  const handleOpenDrawer = (p?: Product) => {
    if (p) {
      // Handle both old (collectionId) and new (collection) structure
      const collection = p.collection || p.collectionId;
      setForm({
        title: p.title,
        price: p.price,
        collectionId: collection,
        URL: p.URL,
        description: p.description,
        stock: p.stock,
        SKU: p.SKU,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        brand: p.brand || "",
        isFeatured: p.isFeatured || false,
      });
      setEditingId(p._id);
    } else {
      setForm({
        title: "",
        price: 0,
        collectionId: { _id: "", name: "" },
        URL: "",
        description: "",
        stock: 0,
        SKU: "",
        rating: 0,
        reviewCount: 0,
        brand: "",
        isFeatured: false,
      });
      setEditingId(null);
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setForm({
      title: "",
      price: 0,
      collectionId: { _id: "", name: "" },
      URL: "",
      description: "",
      stock: 0,
      SKU: "",
      rating: 0,
      reviewCount: 0,
      brand: "",
      isFeatured: false,
    });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await fetcher(`/api/catalogs/${deleteDialog.id}`, { method: "DELETE" });
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
      setDeleteDialog({ open: false, id: null });
      await loadProducts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Delete failed",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "URL",
      headerName: "Image",
      width: 80,
      renderCell: (params) => (
        <Avatar src={params.value} alt={params.row.title} variant="rounded" />
      ),
      sortable: false,
      filterable: false,
    },
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      renderCell: (params) => `₹${params.value}`,
    },
    { field: "SKU", headerName: "SKU", width: 120 },
    { field: "stock", headerName: "Stock", width: 80 },
    {
      field: "collection",
      headerName: "Collection",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.value?.name || "—",
    },
    { field: "brand", headerName: "Brand", width: 120 },
    {
      field: "isFeatured",
      headerName: "Featured",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Featured" color="secondary" size="small" />
        ) : null,
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
            <Typography variant="body2">{params.value.toFixed(1)}</Typography>
          </Box>
        ) : (
          "—"
        ),
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
            onClick={() => handleOpenDrawer(params.row)}
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

  const rows = products.map((p) => ({
    id: p._id,
    _id: p._id,
    title: p.title,
    price: p.price,
    SKU: p.SKU,
    stock: p.stock,
    collection: p.collection || p.collectionId, // Handle both structures
    brand: p.brand || "",
    isFeatured: p.isFeatured || false,
    rating: p.rating || 0,
    URL: p.URL,
  }));

  if (authLoading) {
    return <LoadingState message="Verifying admin access..." />;
  }

  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Manage Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDrawer()}
        >
          Add Product
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable columns={columns} rows={rows} pageSize={10} autoHeight />

      {/* Add/Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              {editingId ? "Edit Product" : "Add New Product"}
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Product Title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Price"
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
                fullWidth
                InputProps={{ startAdornment: "₹" }}
              />

              <TextField
                label="SKU"
                value={form.SKU || ""}
                onChange={(e) => setForm({ ...form, SKU: e.target.value })}
                fullWidth
              />

              <TextField
                label="Stock"
                type="number"
                value={form.stock || ""}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                required
                fullWidth
              />

              <TextField
                select
                label="Collection"
                value={typeof form.collectionId === 'object' ? form.collectionId?._id : form.collectionId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    collectionId: { _id: e.target.value, name: "" },
                  })
                }
                required
                fullWidth
              >
                <MenuItem value="">
                  <em>Select Collection</em>
                </MenuItem>
                {collections.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Brand (optional)"
                value={form.brand || ""}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                fullWidth
              />

              <TextField
                label="Rating (0-5)"
                type="number"
                value={form.rating || ""}
                onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                fullWidth
              />

              <TextField
                label="Review Count"
                type="number"
                value={form.reviewCount || ""}
                onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isFeatured || false}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                }
                label="Featured Product (Brands We Love)"
              />

              <ImageUploadField
                value={form.URL}
                onChange={(url) => setForm({ ...form, URL: url })}
                onUpload={handleImageUpload}
                label="Product Image"
              />

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button onClick={handleCloseDrawer} fullWidth>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" fullWidth>
                  {editingId ? "Update" : "Create"}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
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