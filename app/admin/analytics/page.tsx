import { requireAdmin, getAnalytics } from "@/lib/admin";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const data = await getAnalytics();

  return <AnalyticsDashboard data={data} />;
}
