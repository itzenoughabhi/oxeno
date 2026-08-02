import { Camera, Check, Star } from "lucide-react";
import { useState } from "react";

export default function Reviews({ businessName }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  return (
    <section
      className="customer-section customer-section--two-col"
      id="reviews"
    >
      <div className="customer-review-card">
        <span>Share the good stuff</span>
        <h2>How was your last visit?</h2>
        <p>Your feedback makes every experience better at {businessName}.</p>
        <div className="customer-review-card__stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              className={value <= rating ? "is-selected" : ""}
              onClick={() => setRating(value)}
              key={value}
              aria-label={`${value} stars`}
            >
              <Star size={29} fill="currentColor" />
            </button>
          ))}
        </div>
        <button
          className="customer-button"
          type="button"
          disabled={!rating}
          onClick={() => setSubmitted(true)}
        >
          {submitted ? (
            <>
              <Check size={17} /> Thank you for sharing
            </>
          ) : (
            "Write a review"
          )}
        </button>
      </div>
      <div className="customer-review-upload">
        <span>
          <Camera size={19} />
        </span>
        <div>
          <h3>Make it memorable</h3>
          <p>
            Add a photo from your visit. Your story could brighten another
            member’s day.
          </p>
        </div>
        <button type="button">Upload image</button>
      </div>
    </section>
  );
}
