import { notFound } from "next/navigation";
import { getAdminLesson } from "@/lib/admin";
import { db } from "@/lib/db";
import { LessonForm } from "../LessonForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function EditLessonPage({ params }: Props) {
  const { lessonId } = await params;

  const lesson = await getAdminLesson(lessonId);

  if (!lesson) notFound();

  const examRecord = await db.exam.findUnique({
    where: { lessonId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });

  const exam = examRecord
    ? {
        title: examRecord.title,
        durationMinutes: examRecord.durationMinutes,
        passMark: examRecord.passMark,
        totalMarks: examRecord.totalMarks,
        questions: examRecord.questions.map((q) => ({
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
      courseId={lesson.course.id}
      courseTitle={lesson.course.title}
    />
  );
}
