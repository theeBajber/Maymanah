import { createClient, E2E_COURSE_SLUG } from "./database";

/**
 * Publishes a course for the enrolment journey to find.
 *
 * The catalogue starts empty, so without this the course screens would only
 * ever be checked in their empty state.
 */
export default async function globalSetup(): Promise<void> {
  const db = createClient();

  try {
    await db.course.deleteMany({ where: { slug: E2E_COURSE_SLUG } });

    await db.course.create({
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
    });
  } finally {
    await db.$disconnect();
  }
}
