import { prisma, safeQuery } from "@/lib/prisma";
import { extractTextFromFile } from "@/lib/text-extractor";
import {
  splitDocumentIntoLessons,
  cleanAndGenerateQuiz,
  type ParsedLesson,
  type QuizQuestion,
} from "@/lib/ai";

export type LessonPreview = ParsedLesson & {
  questions: QuizQuestion[];
};

export async function parseCourseBook(
  buffer: Buffer,
  filename: string,
): Promise<LessonPreview[]> {
  const text = await extractTextFromFile(buffer, filename);

  if (!text.trim()) {
    throw new Error(
      "No text could be extracted from this file. It may be empty or scanned.",
    );
  }

  const lessons = await splitDocumentIntoLessons(text);

  await new Promise((r) => setTimeout(r, 2000));

  const withQuizzes: LessonPreview[] = [];
  for (const lesson of lessons) {
    const result = await cleanAndGenerateQuiz(lesson.title, lesson.content);
    withQuizzes.push({
      title: lesson.title,
      content: result.content,
      questions: result.questions,
    });
    await new Promise((r) => setTimeout(r, 1500));
  }

  return withQuizzes;
}

export async function saveImportedLessons(
  courseId: string,
  lessons: LessonPreview[],
  adminId: string,
) {
  const created = await safeQuery(() =>
    prisma.$transaction(
      async (tx) => {
        const result: Array<{ id: string; title: string; order: number }> = [];

        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          const duration = Math.max(
            10,
            Math.ceil(lesson.content.length / 1500),
          );

          const lsn = await tx.lesson.create({
            data: {
              courseId,
              title: lesson.title,
              content: lesson.content,
              order: i,
              duration,
              isPublished: true,
            },
          });

          result.push({ id: lsn.id, title: lsn.title, order: lsn.order });

          if (lesson.questions.length > 0) {
            const totalMarks = lesson.questions.reduce(
              (sum, q) => sum + q.marks,
              0,
            );
            const quizDuration = Math.max(
              5,
              Math.ceil(lesson.questions.length * 2),
            );

            await tx.exam.create({
              data: {
                title: `${lesson.title} Quiz`,
                courseId,
                lessonId: lsn.id,
                durationMinutes: quizDuration,
                passMark: 50,
                totalMarks,
                isPublished: true,
                questions: {
                  create: lesson.questions.map((q, idx) => ({
                    questionText: q.questionText,
                    questionType: "MCQ",
                    marks: q.marks,
                    options: q.options,
                    orderIndex: idx,
                  })),
                },
              },
            });
          }
        }

        return result;
      },
      { timeout: 120000 },
    ),
  );

  await safeQuery(() =>
    prisma.auditLog.create({
      data: {
        action: "COURSE_IMPORTED",
        userId: adminId,
        metadata: {
          courseId,
          lessonCount: lessons.length,
          lessonTitles: lessons.map((l) => l.title),
        },
      },
    }),
  );

  return created;
}
