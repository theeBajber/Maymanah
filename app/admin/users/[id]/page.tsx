import { requireAdmin, getUserDetails } from "@/lib/admin";
import { notFound } from "next/navigation";
import { UserDetail } from "./UserDetail";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const user = await getUserDetails(id);
  if (!user) notFound();

  return <UserDetail user={user} />;
}
