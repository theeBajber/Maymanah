import { TopNav } from "@/components/ui/PortalNav";
import { getCourseBySlug } from "@/lib/courses";
import Image from "next/image";
import { notFound } from "next/navigation";
import EnrollButton from "./EnrollButton";
import HifdhLiveRoom from "./HifdhLiveRoom";

export const dynamic = "force-dynamic";

async function getCourse(slug: string) {
  const course = await getCourseBySlug(slug);
  if (!course) {
    notFound();
  }
  return course;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  const isEnrolled = course.enrollmentStatus === "ACTIVE" || course.enrollmentStatus === "COMPLETED";

  return (
    <div className="flex flex-col h-full pt-16">
      <TopNav />
      <main className="h-full w-full p-6 flex-col flex">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-1/3 h-64 md:h-80 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={course.image || "/calligraphy.png"}
                alt={course.title}
                fill
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-primary-subtle rounded text-xs font-medium mb-3">
                  {course.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-text-secondary leading-relaxed mb-6 max-w-2xl">
                  {course.description || "No description available for this course."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <EnrollButton
                  courseSlug={course.slug}
                  isEnrolled={isEnrolled}
                />
                {isEnrolled && course.progress !== null && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span>{course.progress}% Complete</span>
                    <div className="w-32 h-2 rounded-full bg-bg-primary relative">
                      <div
                        className="absolute left-0 h-full rounded-full bg-primary"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {course.slug === "hifdh-ul-quran" ? (
          <HifdhLiveRoom isEnrolled={isEnrolled} progress={course.progress} />
        ) : (
          <section className="flex-1">
            <h2 className="text-2xl font-bold mb-6">
              {isEnrolled ? "Your Lessons" : "Course Lessons"}
            </h2>
            {course.lessons.length > 0 ? (
              <div className="grid gap-4">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{lesson.title}</h3>
                      {lesson.duration && (
                        <p className="text-sm text-text-secondary">
                          {lesson.duration} min
                        </p>
                      )}
                    </div>
                    {isEnrolled ? (
                      <button className="px-4 py-2 rounded-lg bg-primary text-text-inverse font-medium hover:bg-primary-dark transition-colors">
                        Start
                      </button>
                    ) : (
                      <span className="text-sm text-text-secondary">Locked</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-xl bg-bg-card">
                <p className="text-text-secondary">No lessons available yet</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
