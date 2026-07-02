import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const today = new Date();
  const todayDay = today.getDay();

  if (session.user.role === "TEACHER") {
    const slots = await prisma.recurringSlot.findMany({
      where: { mentorship: { teacherId: session.user.id, status: "ACTIVE" } },
      include: {
        mentorship: {
          select: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const todaySlots = slots.filter((s) => s.dayOfWeek === todayDay);

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Sessions</h1>

        {todaySlots.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Today</h2>
            <div className="space-y-2">
              {todaySlots.map((s) => (
                <div key={s.id} className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">
                      {s.mentorship.student.name ?? "Student"}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {s.type === "DAILY_HIFDH" ? "Hifdh" : "Muraja'ah"} · {s.startTime}
                    </p>
                  </div>
                  <Link
                    href={`/students/${s.mentorship.student.id}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    View Student
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Weekly Schedule</h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const daySlots = slots.filter((s) => s.dayOfWeek === i);
              return (
                <div key={i} className="rounded-xl border border-border bg-bg-elevated p-3">
                  <p className="text-[11px] font-semibold text-text-muted uppercase mb-2">
                    {DAY_NAMES[i]}
                  </p>
                  <div className="space-y-1.5">
                    {daySlots.length === 0 ? (
                      <p className="text-[11px] text-text-muted">—</p>
                    ) : (
                      daySlots.map((s) => (
                        <div key={s.id} className="text-xs bg-bg-hover rounded-lg px-2 py-1.5">
                          <p className="font-medium text-text-primary truncate">
                            {s.mentorship.student.name?.split(" ")[0] ?? "S"}
                          </p>
                          <p className="text-text-muted">{s.startTime}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Student view
  const mentorship = await prisma.mentorship.findFirst({
    where: { studentId: session.user.id, status: "ACTIVE" },
    include: {
      teacher: { select: { name: true } },
      recurringSlots: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Sessions</h1>
      {!mentorship ? (
        <p className="text-text-secondary">No active mentorship.</p>
      ) : (
        <>
          <p className="text-sm text-text-secondary">
            Teacher: {mentorship.teacher.name}
          </p>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const daySlots = mentorship.recurringSlots.filter((s) => s.dayOfWeek === i);
              const isToday = i === todayDay;
              return (
                <div key={i} className={`rounded-xl border p-3 ${isToday ? "border-primary/30 bg-primary/5" : "border-border bg-bg-elevated"}`}>
                  <p className="text-[11px] font-semibold text-text-muted uppercase mb-2">
                    {DAY_NAMES[i]}
                  </p>
                  <div className="space-y-1.5">
                    {daySlots.length === 0 ? (
                      <p className="text-[11px] text-text-muted">—</p>
                    ) : (
                      daySlots.map((s) => (
                        <div key={s.id} className="text-xs bg-bg-hover rounded-lg px-2 py-1.5">
                          <p className="font-medium text-text-primary">
                            {s.type === "DAILY_HIFDH" ? "Hifdh" : "Muraja'ah"}
                          </p>
                          <p className="text-text-muted">{s.startTime}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
