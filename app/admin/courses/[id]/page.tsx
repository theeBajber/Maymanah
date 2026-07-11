import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { CourseForm } from "../CourseForm";
import { BookOpen, Sparkles, FileText, ArrowRight, ClipboardCheck } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const course = await safeQuery(() =>
    prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { lessons: true } },
        exams: {
          where: { examType: "FINAL" },
          select: { id: true, title: true },
        },
      },
    }),
  );

  if (!course) notFound();

  const hasLessons = course._count.lessons > 0;
  const finalExam = course.exams[0] ?? null;

  return (
    <div>
      <CourseForm
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description || "",
          category: course.category,
          image: course.image || "",
          enrollmentKey: course.enrollmentKey ?? "",
          isPublished: course.isPublished,
          isActive: course.isActive,
        }}
      />

      <div className="mt-8 max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Course Content
        </h2>

        {!hasLessons ? (
          <div className="space-y-3">
            <Link
              href={`/admin/courses/${course.id}/import-book`}
              className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-bg-hover/50 transition-colors group"
            >
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                  Import a Course Book
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Upload a PDF/DOCX — AI extracts lessons and generates quizzes
                  automatically
                </p>
              </div>
              <ArrowRight className="size-5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
            </Link>

            <Link
              href={`/admin/courses/${course.id}/lessons/new`}
              className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl hover:border-border-strong hover:bg-bg-hover/50 transition-colors group"
            >
              <div className="size-10 rounded-lg bg-bg-hover flex items-center justify-center shrink-0">
                <FileText className="size-5 text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  Create Lessons Manually
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Build lessons one by one with rich text, video, and quizzes
                </p>
              </div>
              <ArrowRight className="size-5 text-text-muted group-hover:text-text-primary transition-colors shrink-0" />
            </Link>
          </div>
        ) : (
          <Link
            href={`/admin/courses/${course.id}/lessons`}
            className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl hover:border-border-strong hover:bg-bg-hover/50 transition-colors group"
          >
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">
                Manage Lessons ({course._count.lessons})
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Edit, reorder, or add more lessons and quizzes
              </p>
            </div>
            <ArrowRight className="size-5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
          </Link>
        )}

        <Link
          href={`/admin/courses/${course.id}/exam`}
          className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl hover:border-border-strong hover:bg-bg-hover/50 transition-colors group"
        >
          <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <ClipboardCheck className="size-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">
              {finalExam ? "Edit Final Exam" : "Create Final Exam"}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {finalExam
                ? `${finalExam.title} — manage questions and settings`
                : "Set up an end-of-course assessment exam"}
            </p>
          </div>
          <ArrowRight className="size-5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
}
