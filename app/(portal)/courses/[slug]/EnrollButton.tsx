"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { useToast } from "@/app/ui/toast";

/**
 * Joins or leaves a course.
 *
 * Enrolling twice returns the existing row, so a double click keeps one
 * history rather than starting over. Leaving keeps lesson progress, so
 * rejoining later resumes.
 */
export function EnrollButton({ slug, isEnrolled }: { slug: string; isEnrolled: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [loading, setLoading] = useState(false);

  async function act(action: "enroll" | "drop") {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast({ title: body.error ?? "That did not work", variant: "error" });
        return;
      }

      setEnrolled(action === "enroll");
      toast({
        title: action === "enroll" ? "Enrolled. Your progress will be tracked." : "Left the course. Your progress is kept.",
        variant: "success",
      });
      router.refresh();
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <Button variant="ghost" size="md" loading={loading} onClick={() => act("drop")}>
        Leave course
      </Button>
    );
  }

  return (
    <Button variant="primary" size="lg" loading={loading} onClick={() => act("enroll")} className="w-full sm:w-auto">
      Enrol now — free
    </Button>
  );
}
