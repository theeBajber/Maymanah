import { requireAdmin, getTeachers } from "@/lib/admin";
import { TeachersList } from "./TeachersList";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage() {
  await requireAdmin();
  const teachers = await getTeachers();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Teachers</h1>
        <p className="text-text-secondary mt-1">Manage teacher applications and profiles</p>
      </div>

      <TeachersList teachers={teachers} />
    </div>
  );
}
