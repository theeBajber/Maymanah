import { auth } from "@/lib/auth";
import { getCoursesData } from "@/lib/courses";
import { redirect } from "next/navigation";
import CoursesClient from "./CoursesClient";

export default async function Courses() {
  const session = await auth();
  if (session?.user?.role === "TEACHER") redirect("/dashboard");

  const data = await getCoursesData();
  if (!data) redirect("/login");
  const { enrolledCourses, availableCourses } = data;
  const completedCount = enrolledCourses.filter((c) => (c.progress ?? 0) >= 100).length;

  return (
    <CoursesClient
      enrolledCourses={enrolledCourses}
      availableCourses={availableCourses}
      completedCount={completedCount}
    />
  );
}
