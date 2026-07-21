"use client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function DeleteLessonButton({
  lessonId,
  lessonTitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId,
}: {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      toast({ title: "Failed to delete lesson", variant: "error" });
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={`p-2 rounded-lg transition-colors ${
        confirming
          ? "bg-danger/10 text-danger"
          : "text-text-secondary hover:text-danger hover:bg-danger/5"
      }`}
      title={confirming ? "Click again to confirm" : "Delete lesson"}
    >
      <Trash2 className="size-4" />
      <span className="sr-only">
        {confirming ? `Confirm delete ${lessonTitle}` : `Delete ${lessonTitle}`}
      </span>
    </button>
  );
}
