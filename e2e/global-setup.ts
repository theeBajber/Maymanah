import { hashPassword } from "../lib/password";
import {
  createClient,
  E2E_COURSE_SLUG,
  E2E_PAIR_PASSWORD,
  E2E_PAIR_STUDENT_EMAIL,
  E2E_PAIR_TEACHER_EMAIL,
} from "./database";

/**
 * Publishes a course for the enrolment journey to find.
 *
 * The catalogue starts empty, so without this the course screens would only
 * ever be checked in their empty state. A lesson quiz and a final exam are
 * seeded too, so the assessment journey has something to sit.
 */
export default async function globalSetup(): Promise<void> {
  const db = createClient();

  try {
    await db.course.deleteMany({ where: { slug: E2E_COURSE_SLUG } });

    const course = await db.course.create({
      data: {
        title: "E2E Available Course",
        slug: E2E_COURSE_SLUG,
        description: "Published by the end-to-end suite so the catalogue is not empty.",
        category: "Quran",
        isPublished: true,
        lessons: {
          create: [
            {
              title: "First Lesson",
              order: 0,
              isPublished: true,
              content: "## Welcome\n\nA short lesson used by the end-to-end suite.",
            },
          ],
        },
      },
      select: { id: true, lessons: { select: { id: true } } },
    });

    await db.exam.create({
      data: {
        courseId: course.id,
        lessonId: course.lessons[0].id,
        title: "Module Quiz",
        examType: "QUIZ",
        isPublished: true,
        questions: {
          create: [
            {
              questionText: "Which letter opens the alphabet?",
              questionType: "MCQ",
              options: [{ text: "Alif" }, { text: "Ba" }],
              correctAnswer: "0",
              marks: 1,
              orderIndex: 0,
            },
          ],
        },
      },
    });

    await db.exam.create({
      data: {
        courseId: course.id,
        title: "Final Exam",
        examType: "FINAL",
        isPublished: true,
        questions: {
          create: [
            {
              questionText: "How many letters are in the Arabic alphabet?",
              questionType: "MCQ",
              options: [{ text: "28" }, { text: "26" }],
              correctAnswer: "0",
              marks: 1,
              orderIndex: 0,
            },
            {
              questionText: "Which direction is Arabic read?",
              questionType: "MCQ",
              options: [{ text: "Left to right" }, { text: "Right to left" }],
              correctAnswer: "1",
              marks: 1,
              orderIndex: 1,
            },
          ],
        },
      },
    });

    // A fixed pairing gives the notes journey a teacher with a student to
    // write about, without driving the admin pairing screens first.
    await db.user.deleteMany({
      where: { email: { in: [E2E_PAIR_TEACHER_EMAIL, E2E_PAIR_STUDENT_EMAIL] } },
    });
    const passwordHash = await hashPassword(E2E_PAIR_PASSWORD);
    const teacher = await db.user.create({
      data: { name: "Ustadh Notes", email: E2E_PAIR_TEACHER_EMAIL, passwordHash, role: "TEACHER" },
      select: { id: true },
    });
    const student = await db.user.create({
      data: { name: "Yusuf Notes", email: E2E_PAIR_STUDENT_EMAIL, passwordHash, role: "STUDENT" },
      select: { id: true },
    });
    await db.mentorship.create({
      data: { teacherId: teacher.id, studentId: student.id, status: "ACTIVE" },
    });
  } finally {
    await db.$disconnect();
  }
}
