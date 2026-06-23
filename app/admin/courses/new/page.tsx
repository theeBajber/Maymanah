import { requireAdmin } from "@/lib/admin";
import { CourseForm } from "../CourseForm";

export default async function NewCoursePage() {
  await requireAdmin();
  return <CourseForm />;
}
