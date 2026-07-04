"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Pencil,
  Eye,
  EyeOff,
  GripVertical,
  FileText,
  Plus,
} from "lucide-react";
import { DeleteLessonButton } from "./DeleteLessonButton";

type Lesson = {
  id: string;
  title: string;
  duration: number | null;
  isPublished: boolean;
  order: number;
  _count: { lessonProgress: number };
};

function SortableLesson({
  lesson,
  index,
  courseId,
}: {
  lesson: Lesson;
  index: number;
  courseId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-bg-card border border-border rounded-xl px-4 py-3 hover:border-border-strong transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
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
  const [lessons, setLessons] = useState(initialLessons);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLessons((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });

    setSaving(true);
    try {
      const lessonIds = lessons.map((l) => l.id);
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(lessonIds, oldIndex, newIndex);

      const res = await fetch(
        `/api/admin/courses/${courseId}/lessons/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonIds: reordered }),
        },
      );

      if (!res.ok) throw new Error("Failed to reorder");
      router.refresh();
    } catch {
      setLessons(initialLessons);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <SortableLesson
                key={lesson.id}
                lesson={lesson}
                index={index}
                courseId={courseId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
