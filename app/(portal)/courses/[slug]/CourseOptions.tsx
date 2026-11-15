"use client";

import { Ellipsis, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/app/ui/toast";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * The quiet course menu in the page header.
 *
 * Leaving a course is destructive and easy to tap by accident, so it lives
 * behind this menu and a confirmation dialog rather than beside the join
 * button. The request is the same one the enrol button uses.
 */
export function CourseOptions({ slug, courseTitle }: { slug: string; courseTitle: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (!document.getElementById("course-options-menu")?.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function leaveCourse() {
    setLeaving(true);
    try {
      const response = await fetch(`/api/courses/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "drop" }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast({ title: body.error ?? "Could not leave the course", variant: "error" });
        return;
      }

      toast({ title: "Left the course. Your progress is kept.", variant: "success" });
      router.push("/courses");
      router.refresh();
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setLeaving(false);
      setConfirming(false);
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="course-options-menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-border bg-bg-elevated px-3.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Ellipsis aria-hidden className="size-4" />
        Course options
      </button>

      {open ? (
        <div
          id="course-options-menu"
          className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-elevated p-1.5 shadow-xl"
        >
          <Link
            href="#curriculum"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-[8px] px-3 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            View curriculum
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirming(true);
            }}
            className="flex min-h-11 w-full items-center gap-2 rounded-[8px] px-3 text-start text-sm text-danger transition-colors hover:bg-danger-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <LogOut aria-hidden className="size-4" />
            Leave course
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirming}
        danger
        loading={leaving}
        title="Leave this course?"
        description={
          <>
            You will leave <span className="font-semibold text-text-primary">{courseTitle}</span>.
            Your lesson progress and history are kept, and you can rejoin later.
          </>
        }
        confirmLabel="Leave course"
        cancelLabel="Stay enrolled"
        onConfirm={leaveCourse}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
