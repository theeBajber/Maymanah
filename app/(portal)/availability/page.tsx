import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AvailabilityGrid } from "./AvailabilityGrid";

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

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Weekly Availability</h1>
        <p className="text-sm text-text-secondary mt-1">
          Set your available teaching slots. All times are shown in your local timezone.
        </p>
      </section>
      <AvailabilityGrid initialSlots={initialSlots} />
    </div>
  );
}
