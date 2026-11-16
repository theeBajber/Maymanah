import "server-only";

import {
  completionModeFor,
  evaluateCompletion,
  type CompletionMode,
  type CompletionState,
} from "./course-completion";
import { db } from "./db";
import { memorizationProgress } from "./quran-progress";

export interface CourseCompletion extends CompletionState {
  mode: CompletionMode;
}

/**
 * Reads whatever this course measures and applies the shared finish line.
 *
 * Lesson course counts are scoped to published lessons, so an unpublished
 * draft can never hold a student short. A memorisation course ignores the
 * hidden curriculum entirely and reads the student's Quran ledger instead.
 */
export async function courseCompletion(
  userId: string,
  course: { id: string; slug: string },
): Promise<CourseCompletion> {
  const mode = completionModeFor(course.slug);

  if (mode === "memorization") {
    const memorized = await memorizationProgress(userId);
    return {
      mode,
      ...evaluateCompletion({
        mode,
        completedLessons: 0,
        lessonCount: 0,
        memorizedAyahs: memorized.uniqueAyahs,
      }),
    };
  }

  const [completedLessons, lessonCount] = await Promise.all([
    db.lessonProgress.count({
      where: {
        studentId: userId,
        completed: true,
        lesson: { courseId: course.id, isPublished: true },
      },
    }),
    db.lesson.count({ where: { courseId: course.id, isPublished: true } }),
  ]);

  return {
    mode,
    ...evaluateCompletion({ mode, completedLessons, lessonCount }),
  };
}
