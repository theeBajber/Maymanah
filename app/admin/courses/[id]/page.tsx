import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { CourseForm } from "../CourseForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const course = await safeQuery(() =>
    prisma.course.findUnique({ where: { id } }),
  );

  if (!course) notFound();

  return (
    <CourseForm
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description || "",
        category: course.category,
        image: course.image || "",
        enrollmentKey: course.enrollmentKey ?? "",
        isPublished: course.isPublished,
        isActive: course.isActive,
      }}
    />
  );
}
