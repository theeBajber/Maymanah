"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { ExamEditor } from "@/components/ui/ExamEditor";
import { useToast } from "@/components/ui/toast";
import { use } from "react";

type Option = { text: string; isCorrect: boolean };
type Question = { questionText: string; marks: number; options: Option[] };
type ExamData = {
  title: string;
  description: string;
  durationMinutes: number;
  passMark: number;
  shuffleQuestions: boolean;
  allowReview: boolean;
  isPublished: boolean;
  questions: Question[];
};

const emptyExam: ExamData = {
  title: "",
  description: "",
  durationMinutes: 60,
  passMark: 50,
  shuffleQuestions: true,
  allowReview: false,
  isPublished: true,
  questions: [],
};

export default function AdminExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [exam, setExam] = useState<ExamData>(emptyExam);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/courses/${id}/exam`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setHasExisting(true);
          setExam({
            title: data.title || "",
            description: data.description || "",
            durationMinutes: data.durationMinutes || 60,
            passMark: data.passMark || 50,
            shuffleQuestions: data.shuffleQuestions ?? true,
            allowReview: data.allowReview ?? false,
            isPublished: data.isPublished ?? true,
            questions: (data.questions || []).map((q: Record<string, unknown>) => ({
              questionText: (q.questionText as string) || "",
              marks: (q.marks as number) || 1,
              options: (q.options as Option[]) || [],
            })),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = hasExisting ? "PUT" : "POST";
      const res = await fetch(`/api/admin/courses/${id}/exam`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exam),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save exam");
      }

      toast({ title: "Exam saved successfully", variant: "success" });
      setHasExisting(true);
      router.refresh();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this final exam? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}/exam`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete exam");

      toast({ title: "Exam deleted", variant: "success" });
      setExam(emptyExam);
      setHasExisting(false);
      router.refresh();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/courses/${id}`}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-sm text-text-secondary mb-0.5">Course Management</p>
          <h1 className="text-2xl font-bold text-text-primary">
            {hasExisting ? "Edit Final Exam" : "Create Final Exam"}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <ExamEditor value={exam} onChange={setExam} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving
                ? "Saving..."
                : hasExisting
                  ? "Update Exam"
                  : "Create Exam"}
            </button>
            <Link
              href={`/admin/courses/${id}`}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </Link>
          </div>

          {hasExisting && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              {deleting ? "Deleting..." : "Delete Exam"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
