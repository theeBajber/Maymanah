"use client";

import { useState } from "react";

import { Button } from "@/app/ui/button";
import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";

/**
 * Rates a finished course.
 *
 * Only offered after completion: the form is hidden otherwise, so the rule is
 * visible in the interface rather than discovered through an error. Re-rating
 * replaces the earlier verdict.
 */
export function ReviewSection({ slug, enrolled }: { slug: string; enrolled: boolean }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!enrolled) return null;

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
      setDone(true);
      toast({ title: "Thank you. Your review was saved.", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Panel className="p-5">
        <p className="text-sm text-text-secondary">Your review is saved. You can change it any time by rating again.</p>
      </Panel>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-text-primary">Rate this course</h2>
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
                className={`text-2xl transition-colors ${value <= rating ? "text-primary" : "text-text-muted hover:text-text-secondary"}`}
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
            className="w-full resize-y rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-4 py-3 text-sm text-ivory placeholder:text-sage/40 focus:border-brass/60 focus:outline-none"
          />
          <Button type="submit" size="md" loading={saving} className="w-fit">
            Save review
          </Button>
        </form>
      </Panel>
    </section>
  );
}
