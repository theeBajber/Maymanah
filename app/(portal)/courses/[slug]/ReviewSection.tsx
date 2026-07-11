"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface ReviewData {
  rating: number;
  comment: string | null;
}

interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string | null; image: string | null };
  createdAt: Date;
}

export default function ReviewSection({
  slug,
  userReview,
  allReviews,
  averageRating,
}: {
  slug: string;
  userReview: ReviewData | null;
  allReviews: ReviewWithUser[];
  averageRating: number | null;
}) {
  const { toast } = useToast();
  const [rating, setRating] = useState(userReview?.rating ?? 0);
  const [comment, setComment] = useState(userReview?.comment ?? "");
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${slug}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (res.ok) {
        toast({ title: "Review submitted", variant: "success" });
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to submit review", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 space-y-4">
      {averageRating !== null && allReviews.length > 0 && (
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">{averageRating}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={`size-3.5 ${star <= Math.round(averageRating) ? "text-amber-400" : "text-amber-400/30"}`}
                />
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-1">{allReviews.length} review{allReviews.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <FontAwesomeIcon
                icon={faStar}
                className={`size-5 ${star <= (hoverRating || rating) ? "text-amber-400" : "text-amber-400/30"}`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={saving || rating === 0}
          className="px-5 py-2.5 bg-primary text-text-inverse rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : userReview ? "Update Review" : "Submit Review"}
        </button>
      </div>

      {allReviews.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          {allReviews.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-hover">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                {r.user.name?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {r.user.name ?? "Anonymous"}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStar}
                        className={`size-3 ${star <= r.rating ? "text-amber-400" : "text-amber-400/30"}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-text-secondary mt-1">{r.comment}</p>
                )}
                <p className="text-[11px] text-text-muted mt-1">
                  {new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
