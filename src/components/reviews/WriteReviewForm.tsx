import React, { useState } from "react";
import Swal from "sweetalert2";

interface WriteReviewFormProps {
  productId: string;
  productTitle: string;
  orderId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

const WriteReviewForm: React.FC<WriteReviewFormProps> = ({
  productId,
  productTitle,
  orderId,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- SUBMIT REVIEW -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* Validation */
    if (rating === 0) {
      Swal.fire("Rating Required", "Please select a rating", "warning");
      return;
    }

    if (!title.trim()) {
      Swal.fire("Missing Title", "Please enter a review title", "warning");
      return;
    }

    if (!comment.trim()) {
      Swal.fire("Missing Review", "Please enter your review", "warning");
      return;
    }

    if (comment.length > 2000) {
      Swal.fire(
        "Too Long",
        "Review must be less than 2000 characters",
        "warning"
      );
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to submit a review",
        confirmButtonText: "Login",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          productTitle,
          orderId: orderId || "ORD-DEFAULT",
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Review Submitted",
          text: "Your review will be visible after admin approval",
        }).then(() => {
          onSuccess();
        });
      } else {
        Swal.fire(
          "Submission Failed",
          data.message || "Failed to submit review",
          "error"
        );
      }
    } catch (err) {
      console.error("Review submission error:", err);
      Swal.fire(
        "Error",
        "Failed to submit review. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- IMAGE HANDLERS -------------------- */
  const addImage = () => {
    if (!imageUrl.trim()) return;

    if (images.length >= 5) {
      Swal.fire("Limit Reached", "You can add up to 5 images", "info");
      return;
    }

    setImages([...images, imageUrl.trim()]);
    setImageUrl("");
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
                      ? "star-input filled"
                      : "star-input"
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
                  ? "Select rating"
                  : rating === 1
                  ? "Poor"
                  : rating === 2
                  ? "Fair"
                  : rating === 3
                  ? "Good"
                  : rating === 4
                  ? "Very Good"
                  : "Excellent"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Review Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <small>{title.length}/200 characters</small>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label">Your Review *</label>
            <textarea
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              maxLength={2000}
              required
            />
            <small>{comment.length}/2000 characters</small>
          </div>

          {/* Images */}
          <div className="form-group">
            <label className="form-label">Add Images (Optional)</label>
            <div className="image-input-group">
              <input
                type="url"
                className="form-input"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button type="button" onClick={addImage}>
                Add
              </button>
            </div>

            {images.length > 0 && (
              <div className="review-images-preview">
                {images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewForm;
