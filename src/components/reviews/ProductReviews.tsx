import React, { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';
import WriteReviewForm from './WriteReviewForm';

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  userHasOrdered?: boolean; // Whether user has a delivered order with this product
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productTitle,
  userHasOrdered = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [showWriteReview, setShowWriteReview] = useState(false);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId, page, filterRating, sortBy]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder: 'desc',
        status: 'approved',
      });

      if (filterRating) {
        // Filter by rating would require backend support
      }

      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/product/${productId}?${params}`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/product/${productId}/stats`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleReviewSubmitted = () => {
    setShowWriteReview(false);
    loadReviews();
    loadStats();
  };

  const handleVote = async (reviewId: string, voteType: 'helpful' | 'notHelpful') => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/${reviewId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ voteType }),
        }
      );

      if (response.ok) {
        loadReviews(); // Refresh to show updated counts
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote on review');
    }
  };

  const getPercentage = (count: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  return (
    <div className="product-reviews" id="product-reviews-section">
      {/* Reviews Summary */}
      <div className="reviews-summary">
        <h2 className="reviews-title">Customer Reviews</h2>

        {stats && stats.totalReviews > 0 ? (
          <div className="reviews-overview">
            <div className="average-rating-section">
              <div className="average-rating-number">{stats.averageRating.toFixed(1)}</div>
              <div className="average-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(stats.averageRating) ? 'star filled' : 'star'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="total-reviews-count">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="rating-bar-row">
                  <span className="rating-label">{rating} ★</span>
                  <div className="rating-bar-container">
                    <div
                      className="rating-bar-fill"
                      style={{ width: `${getPercentage(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">
                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="no-reviews-yet">No reviews yet. Be the first to review this product!</p>
        )}

        {/* Write Review Button */}
        {userHasOrdered && (
          <button className="btn-write-review" onClick={() => setShowWriteReview(true)}>
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form Modal */}
      {showWriteReview && (
        <WriteReviewForm
          productId={productId}
          productTitle={productTitle}
          onClose={() => setShowWriteReview(false)}
          onSuccess={handleReviewSubmitted}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="reviews-list-section">
          <div className="reviews-list-header">
            <h3>All Reviews ({stats?.totalReviews || 0})</h3>

            <div className="reviews-controls">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Most Recent</option>
                <option value="helpfulCount">Most Helpful</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="reviews-loading">Loading reviews...</div>
          ) : (
            <>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onVote={handleVote}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="reviews-pagination">
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
      )}
    </div>
  );
};

export default ProductReviews;
