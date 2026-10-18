import { notFound } from "next/navigation";
import { getAdminCourse } from "@/lib/admin";
import { LessonForm } from "../LessonForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewLessonPage({ params }: Props) {
  const { id } = await params;

  const course = await getAdminCourse(id);

  if (!course) notFound();

  return (
    <LessonForm
      courseId={course.id}
      courseTitle={course.title}
    />
  );
}
