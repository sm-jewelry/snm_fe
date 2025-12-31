import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Seo from '../../../components/common/Seo';

interface Review {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Moderation
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [rejectingReview, setRejectingReview] = useState<Review | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/profile?login=true');
      return;
    }

    loadReviews();
  }, [page, statusFilter, ratingFilter]);

  const loadReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (statusFilter) params.append('status', statusFilter);
      if (ratingFilter) params.append('rating', ratingFilter);

      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/admin/all?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalReviews(data.pagination?.total || 0);
      } else {
        console.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/admin/${reviewId}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        alert('Review approved successfully');
        loadReviews();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    }
  };

  const handleReject = async () => {
    if (!rejectingReview || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/admin/${rejectingReview._id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      if (response.ok) {
        alert('Review rejected successfully');
        setRejectingReview(null);
        setRejectReason('');
        loadReviews();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/admin/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        alert('Review deleted successfully');
        loadReviews();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to approve');
      return;
    }

    if (!confirm(`Approve ${selectedReviews.length} selected reviews?`)) {
      return;
    }

    const token = localStorage.getItem('access_token');
    let successCount = 0;

    for (const reviewId of selectedReviews) {
      try {
        const response = await fetch(
          `${API_GATEWAY_URL}/api/reviews/admin/${reviewId}/approve`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error('Error approving review:', error);
      }
    }

    alert(`${successCount} out of ${selectedReviews.length} reviews approved successfully`);
    setSelectedReviews([]);
    loadReviews();
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to delete');
      return;
    }

    if (!confirm(`Delete ${selectedReviews.length} selected reviews? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem('access_token');
    let successCount = 0;

    for (const reviewId of selectedReviews) {
      try {
        const response = await fetch(
          `${API_GATEWAY_URL}/api/reviews/admin/${reviewId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }

    alert(`${successCount} out of ${selectedReviews.length} reviews deleted successfully`);
    setSelectedReviews([]);
    loadReviews();
  };

  const toggleSelectReview = (reviewId: string) => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    } else {
      setSelectedReviews([...selectedReviews, reviewId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r._id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending' },
      approved: { class: 'badge-approved', text: 'Approved' },
      rejected: { class: 'badge-rejected', text: 'Rejected' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.productTitle.toLowerCase().includes(query) ||
      review.userName.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Seo title="Review Management - Admin | SNM Jewelry" description="Manage customer reviews and ratings for your products" />

      <div className="admin-reviews-page">
        <div className="admin-container">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Review Management</h1>
              <p className="admin-subtitle">
                Manage customer reviews and ratings ({totalReviews} total)
              </p>
            </div>

            <button
              className="btn-import-export"
              onClick={() => router.push('/admin/reviews/import-export')}
            >
              📁 Import/Export
            </button>
          </div>

          {/* Filters & Search */}
          <div className="admin-filters">
            <div className="filters-row">
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Rating:</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="filter-group search-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedReviews.length > 0 && (
              <div className="bulk-actions">
                <span className="bulk-count">
                  {selectedReviews.length} selected
                </span>
                <button
                  className="bulk-btn bulk-approve"
                  onClick={handleBulkApprove}
                >
                  ✓ Approve Selected
                </button>
                <button
                  className="bulk-btn bulk-delete"
                  onClick={handleBulkDelete}
                >
                  🗑️ Delete Selected
                </button>
              </div>
            )}
          </div>

          {/* Reviews Table */}
          {loading ? (
            <div className="loading-state">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="empty-state">
              <p>No reviews found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="reviews-table-container">
                <table className="reviews-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedReviews.length === reviews.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Product</th>
                      <th>User</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review._id}>
                        <td className="checkbox-col">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review._id)}
                            onChange={() => toggleSelectReview(review._id)}
                          />
                        </td>
                        <td>
                          <div className="product-cell">
                            <strong>{review.productTitle}</strong>
                            <small>Order: {review.orderId}</small>
                          </div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <strong>{review.userName}</strong>
                            <small>{review.userEmail}</small>
                          </div>
                        </td>
                        <td>
                          <div className="rating-cell">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < review.rating ? 'star filled' : 'star'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="review-cell">
                            <strong>{review.title}</strong>
                            <p>{review.comment.substring(0, 100)}...</p>
                            {review.adminNotes && (
                              <small className="admin-note">
                                Note: {review.adminNotes}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              getStatusBadge(review.status).class
                            }`}
                          >
                            {getStatusBadge(review.status).text}
                          </span>
                        </td>
                        <td>
                          <div className="date-cell">
                            {formatDate(review.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {review.status === 'pending' && (
                              <>
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => handleApprove(review._id)}
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => setRejectingReview(review)}
                                  title="Reject"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                            <button
                              className="action-btn edit-btn"
                              onClick={() => setEditingReview(review)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(review._id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Previous
                  </button>

                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingReview && (
        <div className="modal-overlay" onClick={() => setRejectingReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Review</h2>
            <p>Provide a reason for rejecting this review:</p>
            <textarea
              className="reject-textarea"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setRejectingReview(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
              <button className="btn-reject-confirm" onClick={handleReject}>
                Reject Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
