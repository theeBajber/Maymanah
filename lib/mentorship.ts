import { prisma, safeQuery } from "@/lib/prisma";

const DAILY_DURATION = 15;
const MURAJA_DURATION = 60;

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function overlapMinutes(a: string, b: string, aEnd: string, bEnd: string) {
  const start = Math.max(timeToMinutes(a), timeToMinutes(b));
  const end = Math.min(timeToMinutes(aEnd), timeToMinutes(bEnd));
  return Math.max(0, end - start);
}

function intersection(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string,
) {
  const start = Math.max(timeToMinutes(aStart), timeToMinutes(bStart));
  const end = Math.min(timeToMinutes(aEnd), timeToMinutes(bEnd));
  if (end - start < 15) return null;
  return { start: minutesToTime(start), end: minutesToTime(end) };
}

export async function autoPairHifdhStudent(studentId: string) {
  try {
    const existing = await safeQuery(() =>
      prisma.mentorship.findFirst({
        where: { studentId, status: "ACTIVE" },
        include: { recurringSlots: true },
      }),
    );
    if (existing?.recurringSlots?.length) return existing;

    const student = await safeQuery(() =>
      prisma.user.findUnique({
        where: { id: studentId },
        select: { gender: true },
      }),
    );
    if (!student) return null;

    const studentAvail = await safeQuery(() =>
      prisma.availability.findMany({
        where: { userId: studentId, isRecurring: true },
      }),
    );
    if (studentAvail.length === 0) return null;

    const teachers = await safeQuery(() =>
      prisma.user.findMany({
        where: {
          role: "TEACHER",
          gender: student.gender,
          ustadhProfile: { isApproved: true, availableForTeaching: true },
        },
        select: { id: true },
      }),
    );
    if (teachers.length === 0) return null;

    const dayOverlapCounts: { teacherId: string; overlap: number; studentCount: number }[] = [];
    for (const t of teachers) {
      const tAvail = await safeQuery(() =>
        prisma.availability.findMany({
          where: { userId: t.id, isRecurring: true },
        }),
      );

      let totalOverlap = 0;
      for (const sa of studentAvail) {
        for (const ta of tAvail) {
          if (sa.dayOfWeek !== ta.dayOfWeek) continue;
          totalOverlap += overlapMinutes(sa.startTime, ta.startTime, sa.endTime, ta.endTime);
        }
      }
      const studentCount = (await safeQuery(() =>
        prisma.mentorship.count({ where: { teacherId: t.id, status: "ACTIVE" } }),
      )) ?? 0;
      if (totalOverlap >= 15) {
        dayOverlapCounts.push({ teacherId: t.id, overlap: totalOverlap, studentCount });
      }
    }

    if (dayOverlapCounts.length === 0) return null;

    dayOverlapCounts.sort((a, b) => a.studentCount - b.studentCount);

  const bestTeacherId = dayOverlapCounts[0].teacherId;

  const teacherAvail = await safeQuery(() =>
    prisma.availability.findMany({
      where: { userId: bestTeacherId, isRecurring: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  );

  const mentorship = existing ?? await safeQuery(() =>
    prisma.mentorship.create({
      data: { teacherId: bestTeacherId, studentId, status: "ACTIVE" },
    }),
  );

  const existingStudents = await safeQuery(() =>
    prisma.mentorship.findMany({
      where: { teacherId: bestTeacherId, status: "ACTIVE" },
      include: {
        recurringSlots: { where: { type: "MURAJA" } },
      },
    }),
  );

  const usedMurajaDays = new Set(
    existingStudents.flatMap((m) =>
      m.recurringSlots.map((s) => s.dayOfWeek),
    ),
  );

  const daysWithOverlap = new Set<number>();
  const daySlots: { day: number; start: string; end: string }[] = [];
  for (const sa of studentAvail) {
    for (const ta of teacherAvail) {
      if (sa.dayOfWeek !== ta.dayOfWeek) continue;
      const inter = intersection(sa.startTime, sa.endTime, ta.startTime, ta.endTime);
      if (inter) {
        daysWithOverlap.add(sa.dayOfWeek);
        daySlots.push({ day: sa.dayOfWeek, start: inter.start, end: inter.end });
      }
    }
  }

  daySlots.sort((a, b) => a.day - b.day || timeToMinutes(a.start) - timeToMinutes(b.start));

  const weekdaySlots = daySlots.filter((s) => WEEKDAYS.includes(s.day));

  if (daySlots.length > 0) {
    await safeQuery(() =>
      prisma.recurringSlot.deleteMany({ where: { mentorshipId: mentorship.id } }),
    );

    const seenDays = new Set<number>();
    for (const slot of weekdaySlots) {
      if (seenDays.has(slot.day)) continue;
      seenDays.add(slot.day);
      await safeQuery(() =>
        prisma.recurringSlot.create({
          data: {
            mentorshipId: mentorship.id,
            type: "DAILY_HIFDH",
            dayOfWeek: slot.day,
            startTime: slot.start,
            duration: DAILY_DURATION,
          },
        }),
      );
    }

    let murajaDay = [...daysWithOverlap].sort().find((d) => !usedMurajaDays.has(d));
    if (murajaDay === undefined) {
      murajaDay = weekdaySlots.length > 0 ? weekdaySlots[0].day : daySlots[0].day;
    }
    const murajaSlot = daySlots.find((s) => s.day === murajaDay) ?? daySlots[0];
    await safeQuery(() =>
      prisma.recurringSlot.create({
        data: {
          mentorshipId: mentorship.id,
          type: "MURAJA",
          dayOfWeek: murajaDay,
          startTime: murajaSlot.start,
          duration: MURAJA_DURATION,
        },
      }),
    );
  }

  return mentorship;
  } catch (e) {
    console.error("autoPairHifdhStudent error:", e);
    return null;
  }
}

export async function getTodayHifdhSlot(studentId: string) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const mentorship = await safeQuery(() =>
    prisma.mentorship.findFirst({
      where: { studentId, status: "ACTIVE" },
      select: { id: true, teacherId: true },
    }),
  );
  if (!mentorship) return null;

  const slot = await safeQuery(() =>
    prisma.recurringSlot.findFirst({
      where: { mentorshipId: mentorship.id, type: "DAILY_HIFDH", dayOfWeek },
    }),
  );
  if (!slot) return null;

  const todaySlot = today;
  const [h, m] = slot.startTime.split(":").map(Number);
  todaySlot.setHours(h, m, 0, 0);
  const todayEnd = new Date(todaySlot.getTime() + slot.duration * 60000);

  return { startTime: todaySlot, endTime: todayEnd, duration: slot.duration };
}

export async function createTodaysAppointment(studentId: string) {
  const slot = await getTodayHifdhSlot(studentId);
  if (!slot) return null;

  const mentorship = await safeQuery(() =>
    prisma.mentorship.findFirst({
      where: { studentId, status: "ACTIVE" },
      select: { id: true, teacherId: true },
    }),
  );
  if (!mentorship) return null;

  const existing = await safeQuery(() =>
    prisma.appointment.findFirst({
      where: {
        mentorshipId: mentorship.id,
        sessionType: "DAILY_HIFDH",
        startTime: slot.startTime,
      },
    }),
  );
  if (existing) return existing;

  const appointment = await safeQuery(() =>
    prisma.appointment.create({
      data: {
        mentorshipId: mentorship.id,
        teacherId: mentorship.teacherId,
        title: "Daily Hifdh Session",
        startTime: slot.startTime,
        endTime: slot.endTime,
        sessionType: "DAILY_HIFDH",
        meetingUrl: `hifdh-${mentorship.id}-${Date.now()}`,
        status: "SCHEDULED",
      },
    }),
  );

  return appointment;
}

export async function createMurajaAppointment(studentId: string) {
  const mentorship = await safeQuery(() =>
    prisma.mentorship.findFirst({
      where: { studentId, status: "ACTIVE" },
      include: {
        recurringSlots: { where: { type: "MURAJA" } },
      },
    }),
  );
  if (!mentorship || mentorship.recurringSlots.length === 0) return null;

  const murajaSlot = mentorship.recurringSlots[0];
  const today = new Date();
  const dayOfWeek = today.getDay();

  const nextMurajaDate = new Date(today);
  const diff = murajaSlot.dayOfWeek - dayOfWeek;
  nextMurajaDate.setDate(today.getDate() + (diff >= 0 ? diff : diff + 7));
  const [h, m] = murajaSlot.startTime.split(":").map(Number);
  nextMurajaDate.setHours(h, m, 0, 0);
  const endDate = new Date(nextMurajaDate.getTime() + murajaSlot.duration * 60000);

  const existing = await safeQuery(() =>
    prisma.appointment.findFirst({
      where: {
        mentorshipId: mentorship.id,
        sessionType: "MURAJA",
        startTime: nextMurajaDate,
      },
    }),
  );
  if (existing) return existing;

  const appointment = await safeQuery(() =>
    prisma.appointment.create({
      data: {
        mentorshipId: mentorship.id,
        teacherId: mentorship.teacherId,
        title: "Muraja'ah Session",
        startTime: nextMurajaDate,
        endTime: endDate,
        sessionType: "MURAJA",
        meetingUrl: `muraja-${mentorship.id}-${Date.now()}`,
        status: "SCHEDULED",
      },
    }),
  );

  return appointment;
}

export async function generateUpcomingAppointments(mentorshipId: string, daysAhead = 7) {
  const slots = await safeQuery(() =>
    prisma.recurringSlot.findMany({ where: { mentorshipId } }),
  );
  if (!slots?.length) return 0;

  const mentorship = await safeQuery(() =>
    prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      select: { teacherId: true },
    }),
  );
  if (!mentorship) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let created = 0;

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dayOfWeek = date.getDay();

    for (const slot of slots) {
      if (slot.dayOfWeek !== dayOfWeek) continue;

      const [h, m] = slot.startTime.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(h, m, 0, 0);
      const endTime = new Date(startTime.getTime() + slot.duration * 60000);

      const existing = await safeQuery(() =>
        prisma.appointment.findFirst({
          where: { mentorshipId, sessionType: slot.type, startTime },
        }),
      );
      if (existing) continue;

      await safeQuery(() =>
        prisma.appointment.create({
          data: {
            mentorshipId,
            teacherId: mentorship.teacherId,
            title: slot.type === "DAILY_HIFDH" ? "Daily Hifdh Session" : "Muraja'ah Session",
            startTime,
            endTime,
            sessionType: slot.type,
            status: "SCHEDULED",
          },
        }),
      );
      created++;
    }
  }

  return created;
}
