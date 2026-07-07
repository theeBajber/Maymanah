"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, Edit3, Save } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { QuizEditor } from "@/components/ui/QuizEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { useToast } from "@/components/ui/toast";

type Option = { text: string; isCorrect: boolean };
type Question = {
  questionText: string;
  marks: number;
  options: Option[];
};
type QuizData = {
  title: string;
  durationMinutes: number;
  passMark: number;
  totalMarks?: number;
  questions: Question[];
};

type LessonData = {
  id?: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string;
  audioUrl: string;
  order: number;
  duration: number;
  isPublished: boolean;
  exam?: QuizData | null;
};

export function LessonForm({
  lesson,
  courseId,
  courseTitle,
}: {
  lesson?: LessonData;
  courseId: string;
  courseTitle: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LessonData>(
    lesson || {
      courseId,
      title: "",
      content: "",
      videoUrl: "",
      audioUrl: "",
      order: 0,
      duration: 0,
      isPublished: true,
      exam: null,
    },
  );

  const isEditing = !!lesson?.id;
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/admin/lessons/${lesson.id}`
        : `/api/admin/courses/${courseId}/lessons`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save lesson");
      }

      router.push(`/admin/courses/${courseId}/lessons`);
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Something went wrong", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/courses/${courseId}/lessons`}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-sm text-text-secondary mb-0.5">{courseTitle}</p>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEditing ? "Edit Lesson" : "New Lesson"}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6 bg-bg-card border border-border rounded-xl p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="Lesson title"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={form.duration || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                min={0}
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Published</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Video URL
            </label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, videoUrl: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Audio URL
            </label>
            <input
              type="text"
              value={form.audioUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, audioUrl: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="https://example.com/audio.mp3"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary">
                Content
              </label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-bg-hover">
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    !preview
                      ? "bg-bg-elevated text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Edit3 className="size-3.5" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    preview
                      ? "bg-bg-elevated text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Eye className="size-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {preview ? (
              <div className="border border-border rounded-lg overflow-hidden bg-bg-elevated">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg-secondary/50">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-danger" />
                    <div className="size-2.5 rounded-full bg-warning" />
                    <div className="size-2.5 rounded-full bg-success" />
                  </div>
                  <span className="text-xs text-text-muted ml-2">
                    Learner Preview
                  </span>
                </div>
                <div className="p-8">
                  {form.content ? (
                    <div
                      className="prose prose-lg max-w-none lesson-content"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(form.content),
                      }}
                    />
                  ) : (
                    <p className="text-text-muted text-sm text-center py-12">
                      No content yet. Switch to Write mode and start typing.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <RichTextEditor
                content={form.content}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, content: html }))
                }
              />
            )}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <QuizEditor
            value={
              form.exam || {
                title: "",
                durationMinutes: 10,
                passMark: 50,
                totalMarks: 0,
                questions: [],
              }
            }
            onChange={(exam) =>
              setForm((prev) => ({
                ...prev,
                exam: exam.title ? exam : null,
              }))
            }
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="size-4" />
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Lesson"
                : "Create Lesson"}
          </button>
          <Link
            href={`/admin/courses/${courseId}/lessons`}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
