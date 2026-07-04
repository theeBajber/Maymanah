import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { sanitizeHtml } from "@/lib/sanitize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faGraduationCap,
  faListCheck,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { MediaPlayer } from "@/components/ui/MediaPlayer";
import { LessonQuiz } from "./LessonQuiz";

export const dynamic = "force-dynamic";

function normalizeQuestionOptions(options: unknown) {
  if (!Array.isArray(options)) return null;

  return options
    .map((option) => {
      if (!option || typeof option !== "object") return null;
      const text = (option as { text?: unknown }).text;
      if (typeof text !== "string") return null;

      return {
        ...(option as Record<string, unknown>),
        text,
      };
    })
    .filter((option): option is Record<string, unknown> & { text: string } => Boolean(option));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "TEACHER") redirect("/dashboard");

  const lesson = await safeQuery(() =>
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        exam: {
          include: {
            questions: { orderBy: { orderIndex: "asc" } },
            submissions: {
              where: { studentId: session.user.id },
              include: { answers: true },
              take: 1,
            },
          },
        },
      },
    }),
  );
  if (!lesson || lesson.course.slug !== slug) return notFound();

  const enrollment = await safeQuery(() =>
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: lesson.course.id } },
      select: { status: true },
    }),
  );
  if (!enrollment) redirect(`/courses/${slug}`);

  const [progress, allLessons, lessonProgress] = await Promise.all([
    safeQuery(() =>
      prisma.lessonProgress.findUnique({
        where: { studentId_lessonId: { studentId: session.user.id, lessonId } },
      }),
    ),
    safeQuery(() =>
      prisma.lesson.findMany({
        where: { courseId: lesson.course.id, isPublished: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true },
      }),
    ),
    safeQuery(() =>
      prisma.lessonProgress.findMany({
        where: { studentId: session.user.id, lesson: { courseId: lesson.course.id }, completed: true },
        select: { lessonId: true },
      }),
    ),
  ]);

  const isCompleted = progress?.completed ?? false;
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const completedIds = new Set(lessonProgress.map((lp) => lp.lessonId));
  const isNextUnlocked = !nextLesson || currentIdx < 0 || completedIds.has(lessonId) || !lesson.exam;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
        Back to {lesson.course.title}
      </Link>

      <section className="rounded-2xl border border-border bg-bg-elevated overflow-hidden">
        <div className={`px-6 py-4 border-b border-border flex items-center justify-between ${
          isCompleted ? "bg-success/5" : "bg-gradient-to-r from-primary/5 to-transparent"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${
              isCompleted ? "bg-success/10" : "bg-primary/10"
            }`}>
              {isCompleted ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-success size-5" />
              ) : (
                <span className="text-primary font-bold text-sm">{lesson.order}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">
                Module {lesson.order} of {allLessons.length}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary leading-snug">
                {lesson.title}
              </h1>
            </div>
          </div>
          {isCompleted && (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-semibold">
              <FontAwesomeIcon icon={faCheckCircle} className="size-4" />
              Completed
            </span>
          )}
        </div>

        {lesson.videoUrl && (
          <div className="border-b border-border">
            <MediaPlayer src={lesson.videoUrl} type="video" />
          </div>
        )}
        {lesson.audioUrl && !lesson.videoUrl && (
          <div className="border-b border-border p-6">
            <MediaPlayer src={lesson.audioUrl} type="audio" />
          </div>
        )}

        {lesson.content ? (
          <div className="relative bg-gradient-to-b from-bg-elevated to-bg-elevated/80">
            <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
            <div className="p-6 md:p-8 md:px-10">
              <div
                className="prose prose-lg max-w-none lesson-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
              />
            </div>
          </div>
        ) : !lesson.videoUrl ? (
          <div className="p-12 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-xl" />
            </div>
            <p className="text-text-secondary text-sm">Content for this module is being prepared.</p>
          </div>
        ) : null}
      </section>

      {lesson.exam && lesson.exam.questions.length > 0 && (
        <section className="rounded-2xl border border-border bg-bg-elevated overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faListCheck} className="text-primary size-4" />
            </div>
            <div>
              <h2 className="font-bold text-text-primary">Module Quiz</h2>
              <p className="text-xs text-text-secondary">
                {lesson.exam.questions.length} question{lesson.exam.questions.length > 1 ? "s" : ""}
                {lesson.exam.durationMinutes ? ` · ${lesson.exam.durationMinutes} min` : ""}
              </p>
            </div>
          </div>
          <div className="p-6">
            <LessonQuiz
              exam={{
                id: lesson.exam.id,
                title: lesson.exam.title,
                durationMinutes: lesson.exam.durationMinutes,
                totalMarks: lesson.exam.totalMarks,
                passMark: lesson.exam.passMark,
              }}
              questions={lesson.exam.questions.map((q) => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType,
                options: normalizeQuestionOptions(q.options),
                marks: q.marks,
                orderIndex: q.orderIndex,
              }))}
              submission={lesson.exam.submissions[0] ?? null}
            />
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-4">
        {prevLesson ? (
          <Link
            href={`/courses/${slug}/lessons/${prevLesson.id}`}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-bg-elevated hover:border-primary/30 hover:bg-bg-hover transition-all group flex-1 max-w-xs"
          >
            <div className="size-8 rounded-lg bg-bg-hover flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <FontAwesomeIcon icon={faChevronLeft} className="size-3.5 text-text-secondary group-hover:text-primary" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Previous</p>
              <p className="font-semibold text-sm text-text-primary truncate group-hover:text-primary transition-colors">
                {prevLesson.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && (isNextUnlocked ? (
          <Link
            href={`/courses/${slug}/lessons/${nextLesson.id}`}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-bg-elevated hover:border-primary/30 hover:bg-bg-hover transition-all group flex-1 max-w-xs ml-auto"
          >
            <div className="text-right min-w-0">
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Next</p>
              <p className="font-semibold text-sm text-text-primary truncate group-hover:text-primary transition-colors">
                {nextLesson.title}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-bg-hover flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <FontAwesomeIcon icon={faChevronRight} className="size-3.5 text-text-secondary group-hover:text-primary" />
            </div>
          </Link>
        ) : (
          <span className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border/50 bg-bg-elevated/50 opacity-50 cursor-not-allowed flex-1 max-w-xs ml-auto">
            <div className="text-right min-w-0">
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Next</p>
              <p className="font-semibold text-sm text-text-muted truncate">{nextLesson.title}</p>
            </div>
            <div className="size-8 rounded-lg bg-bg-hover flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="size-3.5 text-text-muted" />
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}
