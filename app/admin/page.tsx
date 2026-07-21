import { requireAdmin, getAnalytics } from "@/lib/admin";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const data = await getAnalytics();

  return <AnalyticsDashboard data={data} />;
}
