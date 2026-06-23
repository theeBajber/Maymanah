import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { LessonForm } from "../LessonForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewLessonPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const course = await safeQuery(() =>
    prisma.course.findUnique({
      where: { id },
      select: { id: true, title: true },
    }),
  );

  if (!course) notFound();

  return (
    <LessonForm
      courseId={course.id}
      courseTitle={course.title}
    />
  );
}
