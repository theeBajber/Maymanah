import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <AdminTopBar user={session.user} />
      <AdminSidebar />
      <main className="md:pl-60 pt-16">
        <div className="max-w-screen-2xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
