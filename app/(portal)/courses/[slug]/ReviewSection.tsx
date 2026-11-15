"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";

/**
 * Rates a finished course.
 *
 * The page only mounts this after completion and, when the course has one,
 * after the final exam. Saving a review releases the certificate, so the
 * router refreshes once it succeeds. Re-rating replaces the earlier verdict
 * rather than adding a second voice.
 */
export function ReviewSection({
  slug,
  initialRating = 0,
  initialComment = "",
  hasReview = false,
}: {
  slug: string;
  initialRating?: number;
  initialComment?: string;
  hasReview?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(hasReview);
  const [editing, setEditing] = useState(!hasReview);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      toast({ title: "Choose a rating from 1 to 5", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${slug}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast({ title: body.error ?? "Could not save your review", variant: "error" });
        return;
      }
      setSaved(true);
      setEditing(false);
      toast({ title: "Thank you. Your review was saved.", variant: "success" });
      // The certificate is issued with the review; the refresh reveals it.
      router.refresh();
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-text-primary">
        {hasReview ? "Your review" : "Rate this course"}
      </h2>

      {saved && !editing ? (
        <Panel className="flex flex-col items-start gap-3 p-5">
          <p className="text-sm text-text-secondary">
            Your review is saved. It helps the next student choose well.
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex min-h-11 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Edit review
          </button>
        </Panel>
      ) : (
        <Panel className="p-5">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating out of 5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onClick={() => setRating(value)}
                  className={`flex size-10 items-center justify-center rounded-[8px] text-2xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    value <= rating
                      ? "text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What worked, and what could be better? (optional)"
              className="w-full resize-y rounded-[10px] border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="md" loading={saving} className="w-fit">
                {hasReview ? "Update review" : "Save review"}
              </Button>
              {hasReview ? (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </Panel>
      )}
    </section>
  );
}
