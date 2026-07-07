"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  BookOpen,
  Sparkles,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

type Option = { text: string; isCorrect: boolean };
type QuizQuestion = {
  questionText: string;
  marks: number;
  options: Option[];
  explanation: string;
};
type LessonPreview = {
  title: string;
  content: string;
  questions: QuizQuestion[];
};

type Status = "idle" | "parsing" | "preview" | "saving" | "done";

export function ImportBookClient({
  course,
}: {
  course: { id: string; title: string; slug: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [lessons, setLessons] = useState<LessonPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = useCallback((f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "docx", "txt", "md"];
    if (!ext || !allowed.includes(ext)) {
      return `Unsupported file type (.${ext}). Use PDF, DOCX, or TXT.`;
    }
    const maxSize = 50 * 1024 * 1024;
    if (f.size > maxSize) {
      return "File exceeds 50MB limit.";
    }
    if (f.size === 0) {
      return "File is empty.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        toast({ title: err, variant: "error" });
        return;
      }
      setFile(f);
      setStatus("idle");
    },
    [toast, validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleParse = async () => {
    if (!file) return;
    setStatus("parsing");

    const formData = new FormData();
    formData.set("file", file);
    formData.set("action", "parse");

    try {
      const res = await fetch(
        `/api/admin/courses/${course.id}/import-book`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Parse failed");
      }

      setLessons(data.lessons);
      setStatus("preview");
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Something went wrong", variant: "error" });
      setStatus("idle");
    }
  };

  const handleSave = async () => {
    setStatus("saving");

    const formData = new FormData();
    formData.set("file", file!);
    formData.set("action", "save");
    formData.set("lessons", JSON.stringify(lessons));

    try {
      const res = await fetch(
        `/api/admin/courses/${course.id}/import-book`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }

      setStatus("done");
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Something went wrong", variant: "error" });
      setStatus("preview");
    }
  };

  const reset = () => {
    setFile(null);
    setLessons([]);
    setStatus("idle");
  };

  if (status === "done") {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/courses/${course.id}/lessons`}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Book Imported
            </h1>
            <p className="text-text-secondary mt-1">{course.title}</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto text-center py-16">
          <div className="size-16 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Successfully imported!
          </h2>
          <p className="text-text-secondary mb-6">
            Created {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}{" "}
            with quizzes from your book.
          </p>
          <Link
            href={`/admin/courses/${course.id}/lessons`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <BookOpen className="size-4" />
            View Lessons
          </Link>
        </div>
      </div>
    );
  }

  if (status === "parsing" || status === "saving") {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/courses/${course.id}`}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Import Course Book
            </h1>
            <p className="text-text-secondary mt-1">{course.title}</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto text-center py-16">
          <Loader2 className="size-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {status === "parsing"
              ? "Analyzing your book..."
              : "Creating lessons..."}
          </h2>
          <p className="text-text-secondary text-sm">
            {status === "parsing"
              ? "Extracting text, identifying lessons, and generating quiz questions."
              : "Saving lessons and quizzes to your course."}
            This may take a minute.
          </p>
          {file && (
            <p className="text-xs text-text-muted mt-4">
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </div>
      </div>
    );
  }

  const updateTitle = (index: number, title: string) => {
    setLessons((prev) =>
      prev.map((l, i) => (i === index ? { ...l, title } : l)),
    );
  };

  const removeLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const moveLesson = (index: number, direction: "up" | "down") => {
    setLessons((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/courses/${course.id}`}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Import Course Book
          </h1>
          <p className="text-text-secondary mt-1">{course.title}</p>
        </div>
      </div>

      {status === "preview" && lessons.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Review & Confirm — {lessons.length} Lesson
                {lessons.length !== 1 ? "s" : ""}
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Edit titles, reorder, or remove lessons. Click a lesson to
                expand and preview its content.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleSave}
                disabled={lessons.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="size-4" />
                Create {lessons.length} Lesson
                {lessons.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <div
                key={i}
                className="bg-bg-card border border-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-bg-secondary/30">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveLesson(i, "up")}
                      disabled={i === 0}
                      className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => moveLesson(i, "down")}
                      disabled={i === lessons.length - 1}
                      className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                  <span className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => updateTitle(i, e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-sm font-medium text-text-primary border-none outline-none focus:ring-0 px-1 py-0.5 rounded"
                  />
                  <span className="text-xs text-text-muted shrink-0 mr-1">
                    {lesson.questions.length} Q
                  </span>
                  <button
                    onClick={() => removeLesson(i)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-muted/50 transition-colors"
                    title="Remove lesson"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <ExpandableContent lesson={lesson} />
              </div>
            ))}
          </div>

          {lessons.length === 0 && (
            <div className="text-center py-12 bg-bg-card border border-border rounded-xl">
              <p className="text-text-secondary">
                All lessons removed.{" "}
                <button
                  onClick={reset}
                  className="text-primary hover:underline"
                >
                  Start over
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {status !== "preview" && !file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-border-strong hover:bg-bg-hover/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Upload className="size-10 mx-auto mb-4 text-text-muted" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Upload a course book
          </h2>
          <p className="text-text-secondary text-sm mb-4">
            Drag & drop a PDF, DOCX, or TXT file here, or click to browse
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-hover rounded-xl text-xs font-medium text-text-muted">
            <FileText className="size-3.5" />
            PDF, DOCX, TXT up to 50MB
          </span>
        </div>
      )}

      {status !== "preview" && file && (
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl mb-6">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {file.name}
              </p>
              <p className="text-xs text-text-muted">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <button
            onClick={handleParse}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Sparkles className="size-4" />
            Analyze & Generate Lessons
          </button>
        </div>
      )}
    </div>
  );
}

function ExpandableContent({
  lesson,
}: {
  lesson: LessonPreview;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        <span>
          {open ? "Hide" : "Show"} content &amp; {lesson.questions.length} questions
        </span>
        <svg
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          <div className="prose prose-sm max-w-none text-text-secondary">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
              Quiz Questions
            </p>
            <div className="space-y-2">
              {lesson.questions.map((q, qi) => (
                <div
                  key={qi}
                  className="p-3 rounded-lg bg-bg-secondary/30 border border-border text-sm"
                >
                  <p className="font-medium text-text-primary mb-1.5">
                    Q{qi + 1}. {q.questionText}
                    <span className="text-text-muted font-normal ml-1">
                      ({q.marks} mark{q.marks !== 1 ? "s" : ""})
                    </span>
                  </p>
                  <div className="space-y-0.5 ml-2">
                    {q.options.map((o, oi) => (
                      <p
                        key={oi}
                        className={`text-xs ${
                          o.isCorrect
                            ? "text-success font-medium"
                            : "text-text-secondary"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {o.text}{" "}
                        {o.isCorrect && (
                          <CheckCircle2 className="size-3 inline-block align-text-top" />
                        )}
                      </p>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-text-muted mt-1.5 italic">
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
