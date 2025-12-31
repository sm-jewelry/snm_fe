import React, { useState } from 'react';

interface WriteReviewFormProps {
  productId: string;
  productTitle: string;
  orderId?: string; // Optional: if we know the specific order
  onClose: () => void;
  onSuccess: () => void;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const WriteReviewForm: React.FC<WriteReviewFormProps> = ({
  productId,
  productTitle,
  orderId,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a review title');
      return;
    }

    if (!comment.trim()) {
      setError('Please enter your review');
      return;
    }

    if (comment.length > 2000) {
      setError('Review must be less than 2000 characters');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login to submit a review');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          productTitle,
          orderId: orderId || 'ORD-DEFAULT', // In production, should be actual order ID
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Review submitted successfully! It will be visible after admin approval.');
        onSuccess();
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const addImage = () => {
    if (imageUrl.trim() && images.length < 5) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Write a Review</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="review-modal-product">
          <p className="modal-product-name">{productTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Rating */}
          <div className="form-group">
            <label className="form-label">
              Rating <span className="required">*</span>
            </label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= (hoverRating || rating)
                      ? 'star-input filled'
                      : 'star-input'
                  }
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
              <span className="rating-text">
                {rating === 0
                  ? 'Select rating'
                  : rating === 1
                  ? 'Poor'
                  : rating === 2
                  ? 'Fair'
                  : rating === 3
                  ? 'Good'
                  : rating === 4
                  ? 'Very Good'
                  : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="review-title">
              Review Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="review-title"
              className="form-input"
              placeholder="Sum up your experience in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <small className="form-hint">{title.length}/200 characters</small>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label" htmlFor="review-comment">
              Your Review <span className="required">*</span>
            </label>
            <textarea
              id="review-comment"
              className="form-textarea"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              maxLength={2000}
              required
            ></textarea>
            <small className="form-hint">{comment.length}/2000 characters</small>
          </div>

          {/* Images */}
          <div className="form-group">
            <label className="form-label">
              Add Images (Optional)
            </label>
            <div className="image-input-group">
              <input
                type="url"
                className="form-input"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn-add-image"
                onClick={addImage}
                disabled={images.length >= 5}
              >
                Add
              </button>
            </div>
            <small className="form-hint">You can add up to 5 images</small>

            {images.length > 0 && (
              <div className="review-images-preview">
                {images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && <div className="form-error">{error}</div>}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit-review"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewForm;
