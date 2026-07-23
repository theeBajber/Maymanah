import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { getCourseBySlug } from "@/lib/courses";
import { getShuffledQuestions } from "@/lib/exams";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLock, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { CourseExam } from "./CourseExam";
import type { QuestionData } from "./CourseExam";

export const dynamic = "force-dynamic";

export default async function FinalExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrollment = await safeQuery(() =>
    prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    }),
  );

  if (!enrollment || enrollment.status === "DROPPED") {
    redirect(`/courses/${slug}`);
  }

  if (enrollment.status === "COMPLETED") {
    const fexam = await safeQuery(() =>
      prisma.exam.findFirst({
        where: { courseId: course.id, examType: "FINAL", isPublished: true },
        select: { id: true, passMark: true, totalMarks: true },
      }),
    );

    if (fexam) {
      const gradedSub = await safeQuery(() =>
        prisma.submission.findFirst({
          where: {
            examId: fexam.id,
            studentId: session.user.id,
            status: "GRADED",
          },
          orderBy: { attemptNumber: "desc" },
          select: { totalScore: true },
        }),
      );

      if (gradedSub) {
        const pct = (fexam.totalMarks ?? 1) > 0
          ? ((gradedSub.totalScore ?? 0) / (fexam.totalMarks ?? 1)) * 100
          : 0;
        if (pct >= (fexam.passMark ?? 50)) {
          redirect(`/courses/${slug}`);
        }
      }
      // Re-activate so the student can take the exam
      await safeQuery(() =>
        prisma.enrollment.updateMany({
          where: { userId: session.user.id, courseId: course.id },
          data: { status: "ACTIVE", progress: 99 },
        }),
      );
    } else {
      redirect(`/courses/${slug}`);
    }
  }

  // Check all lessons completed
  const completedCount = await safeQuery(() =>
    prisma.lessonProgress.count({
      where: {
        studentId: session.user.id,
        lesson: { courseId: course.id },
        completed: true,
      },
    }),
  );

  const totalLessons = await safeQuery(() =>
    prisma.lesson.count({
      where: { courseId: course.id, isPublished: true },
    }),
  );

  const allLessonsComplete = completedCount >= totalLessons;

  if (!allLessonsComplete) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
          Back to Course
        </Link>
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <div className="size-16 rounded-full bg-warning-muted flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faLock} className="size-6 text-warning" />
          </div>
          <h3 className="text-lg font-bold mb-2">Complete All Modules First</h3>
          <p className="text-sm text-text-secondary mb-4">
            You must complete all {totalLessons} modules before taking the final exam.
            You have completed {completedCount} of {totalLessons}.
          </p>
          <div className="h-2 max-w-xs mx-auto rounded-full bg-bg-primary mb-6">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(completedCount / totalLessons) * 100}%` }}
            />
          </div>
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-text-inverse font-bold hover:bg-primary-dark transition-all"
          >
            <FontAwesomeIcon icon={faGraduationCap} className="size-4" />
            Continue Learning
          </Link>
        </div>
      </div>
    );
  }

  // Fetch the final exam
  const exam = await safeQuery(() =>
    prisma.exam.findFirst({
      where: { courseId: course.id, examType: "FINAL", isPublished: true },
      include: {
        _count: { select: { questions: true } },
      },
    }),
  );

  if (!exam) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
          Back to Course
        </Link>
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <div className="size-16 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faGraduationCap} className="size-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Final Exam Coming Soon</h3>
          <p className="text-sm text-text-secondary">
            The final exam for this course has not been published yet.
          </p>
        </div>
      </div>
    );
  }

  const rawQuestions = await getShuffledQuestions(exam.id);
  const questions = (exam.shuffleQuestions
    ? rawQuestions
    : rawQuestions.sort((a, b) => a.orderIndex - b.orderIndex)) as unknown as QuestionData[];

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <h3 className="text-lg font-bold mb-2">No Questions Available</h3>
          <p className="text-sm text-text-secondary">
            This exam has no questions yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const submissions = await safeQuery(() =>
    prisma.submission.findMany({
      where: { examId: exam.id, studentId: session.user.id },
      orderBy: { attemptNumber: "desc" },
      include: {
        answers: {
          include: { question: true },
          orderBy: { answeredAt: "asc" },
        },
      },
    }),
  );
  const rawSubmissions = submissions.map((s) => ({
    ...s,
    startedAt: s.startedAt.toISOString(),
    submittedAt: s.submittedAt?.toISOString() ?? null,
    answers: s.answers.map((a) => ({
      ...a,
      answeredAt: a.answeredAt.toISOString(),
    })),
  }));

  const examData = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    durationMinutes: exam.durationMinutes,
    totalMarks: exam.totalMarks,
    passMark: exam.passMark,
    shuffleQuestions: exam.shuffleQuestions,
    allowReview: exam.allowReview,
    examType: exam.examType,
    _count: exam._count,
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
        Back to Course
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {exam.title}
      </h1>

      <CourseExam
        exam={examData}
        questions={questions}
        submissions={rawSubmissions}
        courseSlug={slug}
      />
    </div>
  );
}
