"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Pencil,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  FileText,
  Plus,
} from "lucide-react";
import { useToast } from "@/app/ui/toast";
import { DeleteLessonButton } from "./DeleteLessonButton";

type Lesson = {
  id: string;
  title: string;
  duration: number | null;
  isPublished: boolean;
  order: number;
  _count: { lessonProgress: number };
};

function LessonRow({
  lesson,
  index,
  total,
  courseId,
  onMove,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  courseId: string;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-bg-card border border-border rounded-xl px-4 py-3 hover:border-border-strong transition-colors">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="size-4" />
          <span className="sr-only">Move {lesson.title} up</span>
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="size-4" />
          <span className="sr-only">Move {lesson.title} down</span>
        </button>
      </div>
      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {lesson.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {lesson.duration && (
            <span className="text-xs text-text-muted">
              {lesson.duration} min
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              lesson.isPublished
                ? "bg-success-muted text-success"
                : "bg-warning-muted text-warning"
            }`}
          >
            {lesson.isPublished ? (
              <Eye className="size-3" />
            ) : (
              <EyeOff className="size-3" />
            )}
            {lesson.isPublished ? "Published" : "Draft"}
          </span>
          <span className="text-xs text-text-muted">
            {lesson._count.lessonProgress} completions
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <Pencil className="size-4" />
        </Link>
        <DeleteLessonButton
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          courseId={courseId}
        />
      </div>
    </div>
  );
}

export function ReorderableLessonList({
  courseId,
  lessons: initialLessons,
}: {
  courseId: string;
  lessons: Lesson[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [lessons, setLessons] = useState(initialLessons);
  const [saving, setSaving] = useState(false);

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;

    const previous = lessons;
    const next = [...lessons];
    [next[index], next[target]] = [next[target], next[index]];
    setLessons(next);

    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/lessons/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonIds: next.map((l) => l.id) }),
        },
      );

      if (!res.ok) throw new Error("Failed to reorder");
      router.refresh();
    } catch {
      setLessons(previous);
      toast({ title: "Failed to reorder lessons", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-card border border-border rounded-xl">
        <FileText className="size-10 mx-auto mb-3 text-text-muted" />
        <p className="font-medium text-text-primary">No lessons yet</p>
        <p className="text-sm text-text-muted mt-1">
          Add your first lesson to this course
        </p>
        <Link
          href={`/admin/courses/${courseId}/lessons/new`}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="size-4" />
          Create Lesson
        </Link>
      </div>
    );
  }

  return (
    <div>
      {saving && (
        <div className="mb-3 text-xs text-text-muted animate-pulse">
          Saving order...
        </div>
      )}
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            index={index}
            total={lessons.length}
            courseId={courseId}
            onMove={handleMove}
          />
        ))}
      </div>
    </div>
  );
}
