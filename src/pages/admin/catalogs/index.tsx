import React, { useEffect, useState } from "react";
import { Box, Button, Drawer, Typography, TextField, IconButton, Snackbar, Alert, MenuItem, FormControlLabel, Checkbox, Avatar, Chip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Star as StarIcon } from "@mui/icons-material";
import { fetcher } from "../../../lib/api";
import DataTable from "../../../components/admin/common/DataTable";
import ImageUploadField from "../../../components/admin/common/ImageUploadField";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import LoadingState from "../../../components/admin/common/LoadingState";
import { useAdminAuth } from "../../../hooks/useAdminAuth";

interface Category {
  _id: string;
  name: string;
  parents?: any[];
  level?: string;
}

interface Catalog {
  _id: string;
  title: string;
  price: number;
  stock: number;
  SKU: string;
  URL: string;
  category?: string;
  c1?: Category | null;
  c2?: Category | null;
  c3?: Category | null;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  isFeatured?: boolean;
}

export default function CatalogsPage() {
  // Protected route - only admins can access
  const { loading: authLoading, user } = useAdminAuth();

  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [form, setForm] = useState<Partial<Catalog>>({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "", rating: 0, reviewCount: 0, brand: "", isFeatured: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const data = await fetcher("/api/catalogs");
      setCatalogs(data.products || data);
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Failed to load catalogs", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetcher("/api/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadCatalogs();
      loadCategories();
    }
  }, [authLoading, user]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetcher("/api/catalogs/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url;
  };

  // Preserve category hierarchy logic
  const getCategoryHierarchy = (categoryId: string) => {
    const selectedCat = categories.find((c) => c._id === categoryId);
    if (!selectedCat) return { c1: null, c2: null, c3: null };
    let c1 = null, c2 = null, c3 = null;
    if (selectedCat.level === "C3") {
      c3 = selectedCat._id;
      if (selectedCat.parents && selectedCat.parents.length > 0) {
        const c2Parent = typeof selectedCat.parents[0] === 'object' ? selectedCat.parents[0]._id : selectedCat.parents[0];
        c2 = c2Parent;
        const c2Cat = categories.find((c) => c._id === c2Parent);
        if (c2Cat && c2Cat.parents && c2Cat.parents.length > 0) {
          c1 = typeof c2Cat.parents[0] === 'object' ? c2Cat.parents[0]._id : c2Cat.parents[0];
        }
      }
    } else if (selectedCat.level === "C2") {
      c2 = selectedCat._id;
      if (selectedCat.parents && selectedCat.parents.length > 0) {
        c1 = typeof selectedCat.parents[0] === 'object' ? selectedCat.parents[0]._id : selectedCat.parents[0];
      }
    } else if (selectedCat.level === "C1") {
      c1 = selectedCat._id;
    }
    return { c1, c2, c3 };
  };

  const buildCategoryPath = (cat: Category): string => {
    if (!cat) return "";
    if (!cat.parents || cat.parents.length === 0) return cat.name;
    const parent = cat.parents[0];
    if (typeof parent === "object") {
      return `${buildCategoryPath(parent)} → ${cat.name}`;
    } else {
      const parentObj = categories.find((c) => c._id === parent);
      return parentObj ? `${buildCategoryPath(parentObj)} → ${cat.name}` : cat.name;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hierarchy = getCategoryHierarchy(form.category || "");
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/catalogs/${editingId}` : "/api/catalogs";
      await fetcher(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, URL: form.URL || "", rating: form.rating || 0, reviewCount: form.reviewCount || 0, brand: form.brand || "", isFeatured: form.isFeatured || false, c1: hierarchy.c1, c2: hierarchy.c2, c3: hierarchy.c3 }),
      });
      setSnackbar({ open: true, message: `Catalog ${editingId ? "updated" : "created"} successfully`, severity: "success" });
      setDrawerOpen(false);
      setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "", rating: 0, reviewCount: 0, brand: "", isFeatured: false });
      setEditingId(null);
      await loadCatalogs();
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Operation failed", severity: "error" });
    }
  };

  const handleOpenDrawer = (c?: Catalog) => {
    if (c) {
      // Extract category ID from hierarchy (prefer c3, then c2, then c1)
      let categoryId = "";
      if (c.c3 && typeof c.c3 === "object") {
        categoryId = c.c3._id;
      } else if (c.c2 && typeof c.c2 === "object") {
        categoryId = c.c2._id;
      } else if (c.c1 && typeof c.c1 === "object") {
        categoryId = c.c1._id;
      }
      
      setForm({ 
        title: c.title, 
        price: c.price, 
        stock: c.stock, 
        SKU: c.SKU, 
        URL: c.URL, 
        category: categoryId, 
        rating: c.rating || 0, 
        reviewCount: c.reviewCount || 0, 
        brand: c.brand || "", 
        isFeatured: c.isFeatured || false 
      });
      setEditingId(c._id);
    } else {
      setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "", rating: 0, reviewCount: 0, brand: "", isFeatured: false });
      setEditingId(null);
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "", rating: 0, reviewCount: 0, brand: "", isFeatured: false });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await fetcher(`/api/catalogs/${deleteDialog.id}`, { method: "DELETE" });
      setSnackbar({ open: true, message: "Catalog deleted successfully", severity: "success" });
      setDeleteDialog({ open: false, id: null });
      await loadCatalogs();
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Delete failed", severity: "error" });
    }
  };

  const categoryOptions = categories.filter((cat) => cat.level === "C1" || cat.level === "C2" || cat.level === "C3").map((cat) => ({ ...cat, path: buildCategoryPath(cat) })).sort((a, b) => a.path.localeCompare(b.path));
  const getCategoryPath = (catalog: Catalog) => {
    if (catalog.c3) return buildCategoryPath(catalog.c3);
    if (catalog.c2) return buildCategoryPath(catalog.c2);
    if (catalog.c1) return buildCategoryPath(catalog.c1);
    return "";
  };

  const columns: GridColDef[] = [
    { field: "URL", headerName: "Image", width: 80, renderCell: (params) => <Avatar src={params.value} alt={params.row.title} variant="rounded" />, sortable: false, filterable: false },
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    { field: "price", headerName: "Price", width: 100, renderCell: (params) => `₹${params.value}` },
    { field: "SKU", headerName: "SKU", width: 120 },
    { field: "stock", headerName: "Stock", width: 80 },
    { field: "categoryPath", headerName: "Category", flex: 1, minWidth: 200 },
    { field: "brand", headerName: "Brand", width: 120 },
    { field: "isFeatured", headerName: "Featured", width: 100, renderCell: (params) => params.value ? <Chip label="Featured" color="secondary" size="small" /> : null },
    { field: "rating", headerName: "Rating", width: 100, renderCell: (params) => params.value ? <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><StarIcon sx={{ fontSize: 16, color: "warning.main" }} /><Typography variant="body2">{params.value.toFixed(1)}</Typography></Box> : "—" },
    { field: "actions", headerName: "Actions", width: 120, sortable: false, filterable: false, renderCell: (params) => <Box sx={{ display: "flex", gap: 1 }}><IconButton size="small" color="primary" onClick={() => handleOpenDrawer(params.row)}><EditIcon fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: params.row._id })}><DeleteIcon fontSize="small" /></IconButton></Box> },
  ];

  const rows = catalogs.map((c) => ({ id: c._id, _id: c._id, title: c.title, price: c.price, SKU: c.SKU, stock: c.stock, categoryPath: getCategoryPath(c), brand: c.brand || "", isFeatured: c.isFeatured || false, rating: c.rating || 0, URL: c.URL, c1: c.c1, c2: c.c2, c3: c.c3 }));

  if (authLoading) return <LoadingState message="Verifying admin access..." />;

  if (loading) return <LoadingState message="Loading catalogs..." />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Product Catalog</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDrawer()}>Add Catalog Item</Button>
      </Box>
      <DataTable columns={columns} rows={rows} pageSize={10} autoHeight />
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer} PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>{editingId ? "Edit Catalog Item" : "Add New Catalog Item"}</Typography>
            <IconButton onClick={handleCloseDrawer}><CloseIcon /></IconButton>
          </Box>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required fullWidth />
              <TextField label="Price" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required fullWidth InputProps={{ startAdornment: "₹" }} />
              <TextField label="Stock" type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required fullWidth />
              <TextField label="SKU" value={form.SKU || ""} onChange={(e) => setForm({ ...form, SKU: e.target.value })} fullWidth />
              <TextField select label="Category" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} required fullWidth>
                <MenuItem value=""><em>Select Category</em></MenuItem>
                {categoryOptions.map((cat) => <MenuItem key={cat._id} value={cat._id}>{cat.path}</MenuItem>)}
              </TextField>
              <TextField label="Brand (optional)" value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} fullWidth />
              <TextField label="Rating (0-5)" type="number" value={form.rating || ""} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} inputProps={{ min: 0, max: 5, step: 0.1 }} fullWidth />
              <TextField label="Review Count" type="number" value={form.reviewCount || ""} onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })} inputProps={{ min: 0 }} fullWidth />
              <FormControlLabel control={<Checkbox checked={form.isFeatured || false} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />} label="Featured Product (Brands We Love)" />
              <ImageUploadField value={form.URL} onChange={(url) => setForm({ ...form, URL: url })} onUpload={handleImageUpload} label="Product Image" />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button onClick={handleCloseDrawer} fullWidth>Cancel</Button>
                <Button type="submit" variant="contained" fullWidth>{editingId ? "Update" : "Create"}</Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Drawer>
      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} onConfirm={handleDelete} title="Delete Catalog Item" message="Are you sure you want to delete this catalog item? This action cannot be undone." confirmText="Delete" confirmColor="error" />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}