import React from 'react';

interface ReviewCardProps {
  review: {
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
  };
  onVote: (reviewId: string, voteType: 'helpful' | 'notHelpful') => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onVote }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="review-card">
      {/* Review Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.userName}
              {review.isVerifiedPurchase && (
                <span className="verified-badge" title="Verified Purchase">
                  ✓ Verified Purchase
                </span>
              )}
            </div>
            <div className="review-date">{formatDate(review.createdAt)}</div>
          </div>
        </div>

        <div className="review-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Review Content */}
      <div className="review-content">
        <h4 className="review-title">{review.title}</h4>
        <p className="review-comment">{review.comment}</p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="review-image"
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Footer - Helpful Votes */}
      <div className="review-footer">
        <span className="helpful-question">Was this review helpful?</span>
        <div className="helpful-buttons">
          <button
            className="helpful-btn"
            onClick={() => onVote(review._id, 'helpful')}
            title="Mark as helpful"
          >
            👍 Helpful ({review.helpfulCount})
          </button>
          <button
            className="helpful-btn"
            onClick={() => onVote(review._id, 'notHelpful')}
            title="Mark as not helpful"
          >
            👎 Not Helpful ({review.notHelpfulCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
