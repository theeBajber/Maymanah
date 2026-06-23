import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { LessonForm } from "../LessonForm";

type Props = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function EditLessonPage({ params }: Props) {
  await requireAdmin();
  const { id, lessonId } = await params;

  const [course, lesson] = await Promise.all([
    safeQuery(() =>
      prisma.course.findUnique({
        where: { id },
        select: { id: true, title: true },
      }),
    ),
    safeQuery(() =>
      prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          exam: {
            include: {
              questions: { orderBy: { orderIndex: "asc" } },
            },
          },
        },
      }),
    ),
  ]);

  if (!course || !lesson) notFound();

  const exam = lesson.exam
    ? {
        title: lesson.exam.title,
        durationMinutes: lesson.exam.durationMinutes,
        passMark: lesson.exam.passMark,
        totalMarks: lesson.exam.totalMarks,
        questions: lesson.exam.questions.map((q) => ({
          questionText: q.questionText,
          marks: q.marks,
          options: (q.options as { text: string; isCorrect: boolean }[]),
        })),
      }
    : null;

  return (
    <LessonForm
      lesson={{
        id: lesson.id,
        courseId: lesson.courseId,
        title: lesson.title,
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        audioUrl: lesson.audioUrl || "",
        order: lesson.order,
        duration: lesson.duration || 0,
        isPublished: lesson.isPublished,
        exam,
      }}
      courseId={course.id}
      courseTitle={course.title}
    />
  );
}
