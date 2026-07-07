import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AvailabilityClient from "./AvailabilityClient";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const slots = await prisma.availability.findMany({
    where: { userId: session.user.id },
    select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const initialSlots = slots.map((s) => ({
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  return <AvailabilityClient initialSlots={initialSlots} />;
}
