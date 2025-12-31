import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Seo from '../../components/common/Seo';

interface Review {
  _id: string;
  productId: string;
  productTitle: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/profile?login=true');
      return;
    }

    loadReviews();
  }, [page]);

  const loadReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/my-reviews?page=${page}&limit=10`,
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
      } else {
        console.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

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

  const handleEdit = (review: Review) => {
    setEditingReview(review);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/${editingReview._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            rating: editingReview.rating,
            title: editingReview.title,
            comment: editingReview.comment,
            images: editingReview.images,
          }),
        }
      );

      if (response.ok) {
        alert('Review updated successfully! It will be re-approved by admin.');
        setEditingReview(null);
        loadReviews();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'status-pending', text: '⏳ Pending Approval' },
      approved: { class: 'status-approved', text: '✓ Approved' },
      rejected: { class: 'status-rejected', text: '✕ Rejected' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <>
      <Seo title="My Reviews - SNM Jewelry" description="Manage your product reviews and ratings for SNM Jewelry" />

      <div className="my-reviews-page">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">My Reviews</h1>
            <p className="page-subtitle">
              Manage your product reviews and ratings
            </p>
          </div>

          {loading ? (
            <div className="loading-state">Loading your reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h2>No Reviews Yet</h2>
              <p>You haven't written any reviews yet. Start shopping and share your experience!</p>
              <button
                className="btn-shop-now"
                onClick={() => router.push('/shop')}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <div key={review._id} className="my-review-card">
                    <div className="review-card-header">
                      <div className="product-info">
                        <h3 className="product-title">{review.productTitle}</h3>
                        <div className="review-meta">
                          <span className="review-date">
                            {formatDate(review.createdAt)}
                          </span>
                          {review.updatedAt !== review.createdAt && (
                            <span className="review-edited"> (edited)</span>
                          )}
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusBadge(review.status).class}`}>
                        {getStatusBadge(review.status).text}
                      </span>
                    </div>

                    <div className="review-card-content">
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? 'star filled' : 'star'}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-comment">{review.comment}</p>

                      {review.adminNotes && (
                        <div className="admin-notes">
                          <strong>Admin Note:</strong> {review.adminNotes}
                        </div>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div className="review-images">
                          {review.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Review ${index + 1}`}
                              className="review-image"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="review-card-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(review)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(review._id)}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        className="btn-view-product"
                        onClick={() => router.push(`/products/${review.productId}`)}
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                ))}
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

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="review-modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2>Edit Review</h2>
              <button
                className="modal-close-btn"
                onClick={() => setEditingReview(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="review-form">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= editingReview.rating
                          ? 'star-input filled'
                          : 'star-input'
                      }
                      onClick={() =>
                        setEditingReview({ ...editingReview, rating: star })
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReview.title}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, title: e.target.value })
                  }
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Review</label>
                <textarea
                  className="form-textarea"
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, comment: e.target.value })
                  }
                  rows={6}
                  maxLength={2000}
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingReview(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit-review">
                  Update Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
