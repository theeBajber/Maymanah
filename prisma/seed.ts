import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { catalogueCourses, type SeedCourse } from "./seed-courses";
import { hifdhCourse } from "./seed-content";

// The seed runs outside Next, so the WebSocket shim the Neon driver needs has
// to be supplied here rather than inherited from the application runtime.
neonConfig.webSocketConstructor = ws;

const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Publishes one course and its lessons.
 *
 * Run repeatedly without side effects: the course and its lessons are matched
 * on their stable keys and updated in place, so re-seeding after a copy change
 * refreshes the text without duplicating rows or resetting enrolments.
 */
async function seedCourse(course: SeedCourse): Promise<void> {
  const shared = {
    title: course.title,
    description: course.description,
    image: course.image,
    category: course.category,
    isPublished: true,
    isActive: true,
  };

  const row = await db.course.upsert({
    where: { slug: course.slug },
    update: shared,
    create: { ...shared, slug: course.slug },
    select: { id: true },
  });

  for (const [index, lesson] of course.lessons.entries()) {
    const order = index + 1;
    const existing = await db.lesson.findFirst({
      where: { courseId: row.id, order },
      select: { id: true },
    });

    const lessonData = {
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl ?? null,
      audioUrl: lesson.audioUrl ?? null,
      duration: lesson.duration,
      isPublished: true,
    };

    const lessonRow = existing
      ? await db.lesson.update({
          where: { id: existing.id },
          data: lessonData,
          select: { id: true },
        })
      : await db.lesson.create({
          data: { courseId: row.id, ...lessonData, order },
          select: { id: true },
        });

    if (lesson.questions.length === 0) {
      await db.exam.deleteMany({ where: { lessonId: lessonRow.id } });
      continue;
    }

    const totalMarks = lesson.questions.length;
    const exam = await db.exam.upsert({
      where: { lessonId: lessonRow.id },
      update: {
        title: `${lesson.title} Quiz`,
        description: `Test your knowledge of "${lesson.title}"`,
        totalMarks,
        passMark: Math.ceil(totalMarks * 0.6),
        isPublished: true,
      },
      create: {
        courseId: row.id,
        lessonId: lessonRow.id,
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

  console.log(`Seeded "${course.title}" with ${course.lessons.length} lessons.`);
}

async function main(): Promise<void> {
  await seedCourse({
    title: hifdhCourse.title,
    slug: hifdhCourse.slug,
    description: hifdhCourse.description,
    image: "/quran-hifdh.jpg",
    category: "Quran",
    lessons: hifdhCourse.lessons,
  });

  for (const course of catalogueCourses) {
    await seedCourse(course);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
