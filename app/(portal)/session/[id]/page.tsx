import type { Metadata } from "next";

import { SessionView } from "./SessionView";

export const metadata: Metadata = {
  title: "Session",
  robots: { index: false, follow: false },
};

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionView appointmentId={id} />;
}
