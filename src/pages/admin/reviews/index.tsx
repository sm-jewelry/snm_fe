import React, { useEffect, useState } from "react";
import { Box, Button, Typography, TextField, MenuItem, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Rating, Chip, Drawer } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, Delete as DeleteIcon, FileDownload as ExportIcon, Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import NextLink from "next/link";
import { fetcher } from "../../../lib/api";
import DataTable from "../../../components/admin/common/DataTable";
import StatusChip from "../../../components/admin/common/StatusChip";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import LoadingState from "../../../components/admin/common/LoadingState";
import { useAdminAuth } from "../../../hooks/useAdminAuth";

interface Review {
  _id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  // Protected route - only admins can access
  const { loading: authLoading, user } = useAdminAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [moderateDialog, setModerateDialog] = useState<{ open: boolean; reviewId: string | null; action: "approve" | "reject" | null }>({ open: false, reviewId: null, action: null });
  const [adminNotes, setAdminNotes] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  // NEW: Edit drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    _id: string;
    rating: number;
    title: string;
    comment: string;
    status: "pending" | "approved" | "rejected";
    adminNotes?: string;
  }>({
    _id: "",
    rating: 5,
    title: "",
    comment: "",
    status: "pending",
    adminNotes: "",
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (ratingFilter !== "all") params.append("rating", ratingFilter);
      if (searchTerm) params.append("search", searchTerm);
      const data = await fetcher(`/api/reviews/admin/all?${params.toString()}`);
      setReviews(data.reviews || data);
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Failed to load reviews", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadReviews();
    }
  }, [statusFilter, ratingFilter, authLoading, user]);

  const handleModerate = async () => {
    if (!moderateDialog.reviewId || !moderateDialog.action) return;
    try {
      await fetcher(`/api/reviews/admin/${moderateDialog.reviewId}/${moderateDialog.action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      setSnackbar({ open: true, message: `Review ${moderateDialog.action}d successfully`, severity: "success" });
      setModerateDialog({ open: false, reviewId: null, action: null });
      setAdminNotes("");
      await loadReviews();
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Operation failed", severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await fetcher(`/api/reviews/admin/${deleteDialog.id}`, { method: "DELETE" });
      setSnackbar({ open: true, message: "Review deleted successfully", severity: "success" });
      setDeleteDialog({ open: false, id: null });
      await loadReviews();
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Delete failed", severity: "error" });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(selectedRows.map(id => fetcher(`/api/reviews/admin/${id}/approve`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminNotes: "Bulk approved" }) })));
      setSnackbar({ open: true, message: `${selectedRows.length} reviews approved`, severity: "success" });
      setSelectedRows([]);
      await loadReviews();
    } catch (error) {
      setSnackbar({ open: true, message: "Bulk approve failed", severity: "error" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0 || !confirm(`Delete ${selectedRows.length} reviews?`)) return;
    try {
      await Promise.all(selectedRows.map(id => fetcher(`/api/reviews/admin/${id}`, { method: "DELETE" })));
      setSnackbar({ open: true, message: `${selectedRows.length} reviews deleted`, severity: "success" });
      setSelectedRows([]);
      await loadReviews();
    } catch (error) {
      setSnackbar({ open: true, message: "Bulk delete failed", severity: "error" });
    }
  };

  // NEW: Edit handlers
  const handleOpenEditDrawer = (review: Review) => {
    setEditForm({
      _id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      adminNotes: review.adminNotes || "",
    });
    setEditDrawerOpen(true);
  };

  const handleCloseEditDrawer = () => {
    setEditDrawerOpen(false);
    setEditForm({
      _id: "",
      rating: 5,
      title: "",
      comment: "",
      status: "pending",
      adminNotes: "",
    });
  };

  const handleUpdateReview = async () => {
    try {
      await fetcher(`/api/reviews/admin/${editForm._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editForm.rating,
          title: editForm.title,
          comment: editForm.comment,
          status: editForm.status,
          adminNotes: editForm.adminNotes,
        }),
      });
      setSnackbar({ open: true, message: "Review updated successfully", severity: "success" });
      handleCloseEditDrawer();
      await loadReviews();
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : "Update failed", severity: "error" });
    }
  };

  const columns: GridColDef[] = [
    { field: "productTitle", headerName: "Product", flex: 1, minWidth: 180 },
    { field: "userName", headerName: "User", flex: 1, minWidth: 150 },
    { field: "rating", headerName: "Rating", width: 130, renderCell: (params) => <Rating value={params.value} readOnly size="small" /> },
    { 
      field: "title", 
      headerName: "Title", 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: "comment", 
      headerName: "Comment", 
      flex: 2, 
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {params.value}
        </Typography>
      )
    },
    { field: "status", headerName: "Status", width: 120, renderCell: (params) => <StatusChip status={params.value} /> },
    { field: "createdAt", headerName: "Date", width: 120, renderCell: (params) => new Date(params.value).toLocaleDateString() },
    { 
      field: "actions", 
      headerName: "Actions", 
      width: 180, 
      sortable: false, 
      filterable: false, 
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.rawStatus === "pending" && (
            <>
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => setModerateDialog({ open: true, reviewId: params.row._id, action: "approve" })} 
                title="Approve"
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="warning" 
                onClick={() => setModerateDialog({ open: true, reviewId: params.row._id, action: "reject" })} 
                title="Reject"
              >
                <RejectIcon fontSize="small" />
              </IconButton>
            </>
          )}
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleOpenEditDrawer(params.row.fullReview)} 
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => setDeleteDialog({ open: true, id: params.row._id })} 
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    },
  ];

  const rows = reviews.map((r) => ({
    id: r._id,
    _id: r._id,
    productTitle: r.productTitle,
    userName: r.userName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    status: r.status,
    rawStatus: r.status,
    createdAt: r.createdAt,
    fullReview: r
  }));

  if (authLoading) return <LoadingState message="Verifying admin access..." />;

  if (loading) return <LoadingState message="Loading reviews..." />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Review Moderation</Typography>
        <NextLink href="/admin/reviews/import-export" passHref legacyBehavior>
          <Button component="a" variant="outlined" startIcon={<ExportIcon />}>Import/Export</Button>
        </NextLink>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">All Status</MenuItem><MenuItem value="pending">Pending</MenuItem><MenuItem value="approved">Approved</MenuItem><MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
        <TextField select label="Rating" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} sx={{ minWidth: 120 }}>
          <MenuItem value="all">All Ratings</MenuItem><MenuItem value="5">5 Stars</MenuItem><MenuItem value="4">4 Stars</MenuItem><MenuItem value="3">3 Stars</MenuItem><MenuItem value="2">2 Stars</MenuItem><MenuItem value="1">1 Star</MenuItem>
        </TextField>
        <TextField label="Search" placeholder="Product, user, comment..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && loadReviews()} sx={{ minWidth: 250 }} />
        <Button variant="contained" onClick={loadReviews}>Search</Button>
      </Box>

      {selectedRows.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <Typography variant="body2" sx={{ alignSelf: "center" }}>{selectedRows.length} selected</Typography>
          <Button size="small" variant="contained" color="success" onClick={handleBulkApprove}>Approve Selected</Button>
          <Button size="small" variant="outlined" color="error" onClick={handleBulkDelete}>Delete Selected</Button>
        </Box>
      )}

      <DataTable columns={columns} rows={rows} pageSize={20} autoHeight checkboxSelection />

      <Dialog open={moderateDialog.open} onClose={() => setModerateDialog({ open: false, reviewId: null, action: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{moderateDialog.action === "approve" ? "Approve Review" : "Reject Review"}</DialogTitle>
        <DialogContent>
          <TextField label="Admin Notes (optional)" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} fullWidth multiline rows={3} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerateDialog({ open: false, reviewId: null, action: null })}>Cancel</Button>
          <Button variant="contained" color={moderateDialog.action === "approve" ? "success" : "warning"} onClick={handleModerate}>{moderateDialog.action === "approve" ? "Approve" : "Reject"}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} onConfirm={handleDelete} title="Delete Review" message="Are you sure you want to delete this review? This action cannot be undone." confirmText="Delete" confirmColor="error" />

      {/* Edit Review Drawer */}
      <Drawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleCloseEditDrawer}
        PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Edit Review
            </Typography>
            <IconButton onClick={handleCloseEditDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Rating */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={editForm.rating}
                onChange={(e, newValue) => setEditForm({ ...editForm, rating: newValue || 5 })}
                size="large"
              />
            </Box>

            {/* Review Title */}
            <TextField
              label="Review Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
              fullWidth
            />

            {/* Review Comment */}
            <TextField
              label="Review Comment"
              value={editForm.comment}
              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
              required
              fullWidth
              multiline
              rows={4}
            />

            {/* Status */}
            <TextField
              select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
              required
              fullWidth
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>

            {/* Admin Notes */}
            <TextField
              label="Admin Notes (optional)"
              value={editForm.adminNotes}
              onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button onClick={handleCloseEditDrawer} fullWidth>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleUpdateReview}
              >
                Update Review
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}