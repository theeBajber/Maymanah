import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourse, getAdminLessons } from "@/lib/admin";
import { Plus, ArrowLeft } from "lucide-react";
import { ReorderableLessonList } from "./ReorderableLessonList";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminLessonsPage({ params }: Props) {
  const { id } = await params;

  const course = await getAdminCourse(id);

  if (!course) notFound();

  const lessons = await getAdminLessons(id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/courses"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-text-primary wrap-break-word">
                {course.title}
              </h1>
              <p className="text-text-secondary mt-1">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href={`/admin/courses/${course.id}/lessons/new`}
              className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Plus className="size-4" />
              New Lesson
            </Link>
          </div>
        </div>
      </div>

      <ReorderableLessonList
        courseId={course.id}
        lessons={lessons.map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration,
          isPublished: l.isPublished,
          order: l.order,
          _count: { lessonProgress: l._count.lessonProgress },
        }))}
      />
    </div>
  );
}
