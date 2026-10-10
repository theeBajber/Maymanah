import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { LessonReader } from "./LessonReader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { title: true } });
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const user = await getCurrentUser(await auth());
  if (!user) notFound();

  const { slug, lessonId } = await params;

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, isPublished: true, course: { slug, isPublished: true, isActive: true } },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      audioUrl: true,
      duration: true,
      courseId: true,
      course: { select: { title: true, slug: true } },
    },
  });
  if (!lesson) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
    select: { status: true },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const [progress, neighbours] = await Promise.all([
    db.lessonProgress.findUnique({
      where: { studentId_lessonId: { studentId: user.id, lessonId } },
      select: { completed: true },
    }),
    db.lesson.findMany({
      where: { courseId: lesson.courseId, isPublished: true },
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const position = neighbours.findIndex((row) => row.id === lessonId);

  return (
    <LessonReader
      lesson={lesson}
      completed={progress?.completed ?? false}
      previous={position > 0 ? neighbours[position - 1] : null}
      next={position >= 0 && position < neighbours.length - 1 ? neighbours[position + 1] : null}
      courseSlug={slug}
    />
  );
}
