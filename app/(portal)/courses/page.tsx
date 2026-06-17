import { CourseCard } from "@/components/ui/cards";
import { TopNav } from "@/components/ui/PortalNav";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { getCoursesData } from "@/lib/courses";
import { redirect } from "next/navigation";

export default async function Courses() {
  const data = await getCoursesData();

  if (!data) {
    redirect("/login");
  }

  const { enrolledCourses, availableCourses } = data;

  return (
    <div className="flex flex-col h-full pt-16">
      <TopNav />
      <main className="h-full w-full p-6 flex-col flex">
        <section className="mb-8">
          <h1 className={`text-3xl font-bold text-primary mb-2`}>
            My Courses
          </h1>
          <p className="text-text-secondary">
            Continue your learning journey
          </p>
        </section>

        {enrolledCourses.length > 0 ? (
          <section className="mb-12 pl-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Currently Enrolled</h2>
                <p className="text-sm text-text-secondary">
                  Pick up where you left off
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  image={course.image ?? undefined}
                  title={course.title}
                  progress={course.progress ?? undefined}
                  lessons={course.lessons}
                  href={`/courses/${course.slug}`}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-12 pl-8">
            <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-bg-card p-6 text-center">
              <FontAwesomeIcon icon={faBookOpen} className="text-4xl text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">No enrolled courses yet</h3>
              <p className="text-text-secondary mb-4">
                Browse available courses below to start learning
              </p>
            </div>
          </section>
        )}

        <section className="pl-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Available Courses</h2>
              <p className="text-sm text-text-secondary">
                Courses you can enroll in
              </p>
            </div>
          </div>
          {availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="h-72 rounded-xl overflow-hidden w-full bg-bg-card border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="w-full h-40 relative overflow-hidden">
                    <Image
                      src={course.image || "/calligraphy.png"}
                      alt={course.title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-bg-card"></div>
                  </div>
                  <div className="p-8 flex flex-col gap-2">
                    <h4 className="mb-2 font-bold text-xl">{course.title}</h4>
                    <div className="flex w-full items-center justify-between text-sm text-text-secondary">
                      <span>{course.lessons} Lessons</span>
                      <span className="px-2 py-1 bg-primary-subtle rounded text-xs">
                        {course.category}
                      </span>
                    </div>
                    <span className="mt-2 inline-block rounded-lg py-2 px-4 bg-primary text-text-inverse font-semibold hover:bg-primary-dark transition-colors text-center">
                      Enroll Now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-64 rounded-xl flex items-center justify-center bg-bg-card">
              <p className="text-text-secondary">All courses have been enrolled</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}