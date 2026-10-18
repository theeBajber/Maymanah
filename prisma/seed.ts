import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { hifdhCourse } from "./seed-content";

// The seed runs outside Next, so the WebSocket shim the Neon driver needs has
// to be supplied here rather than inherited from the application runtime.
neonConfig.webSocketConstructor = ws;

const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Publishes the Quran Hifdh course and its lessons.
 *
 * Run repeatedly without side effects: the course and its lessons are matched
 * on their stable keys and updated in place, so re-seeding after a copy change
 * refreshes the text without duplicating rows or resetting enrolments.
 */
async function seedHifdhCourse(): Promise<void> {
  const course = await db.course.upsert({
    where: { slug: hifdhCourse.slug },
    update: {
      title: hifdhCourse.title,
      description: hifdhCourse.description,
      category: "Quran",
      isPublished: true,
      isActive: true,
    },
    create: {
      title: hifdhCourse.title,
      slug: hifdhCourse.slug,
      description: hifdhCourse.description,
      category: "Quran",
      isPublished: true,
      isActive: true,
    },
    select: { id: true },
  });

  for (const [index, lesson] of hifdhCourse.lessons.entries()) {
    const order = index + 1;
    const existing = await db.lesson.findFirst({
      where: { courseId: course.id, order },
      select: { id: true },
    });

    const row = existing
      ? await db.lesson.update({
          where: { id: existing.id },
          data: {
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            isPublished: true,
          },
          select: { id: true },
        })
      : await db.lesson.create({
          data: {
            courseId: course.id,
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            order,
            isPublished: true,
          },
          select: { id: true },
        });

    const totalMarks = lesson.questions.length;
    const exam = await db.exam.upsert({
      where: { lessonId: row.id },
      update: {
        title: `${lesson.title} Quiz`,
        description: `Test your knowledge of "${lesson.title}"`,
        totalMarks,
        passMark: Math.ceil(totalMarks * 0.6),
        isPublished: true,
      },
      create: {
        courseId: course.id,
        lessonId: row.id,
        title: `${lesson.title} Quiz`,
        description: `Test your knowledge of "${lesson.title}"`,
        totalMarks,
        passMark: Math.ceil(totalMarks * 0.6),
        durationMinutes: 15,
        isPublished: true,
        shuffleQuestions: true,
        examType: "QUIZ",
      },
      select: { id: true },
    });

    // Rebuild the questions wholesale: an edited question has no stable key to
    // match on, and every attempt to answer one already stores its id, so
    // replacing them keeps a re-seed from leaving stale options behind.
    await db.question.deleteMany({ where: { examId: exam.id } });
    await db.question.createMany({
      data: lesson.questions.map((question, orderIndex) => ({
        examId: exam.id,
        questionText: question.questionText,
        questionType: "MCQ",
        options: question.options.map((option) => ({ text: option.text })),
        correctAnswer: question.correctAnswer,
        marks: 1,
        orderIndex,
      })),
    });
  }

  console.log(
    `Seeded "${hifdhCourse.title}" with ${hifdhCourse.lessons.length} lessons.`,
  );
}

seedHifdhCourse()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
