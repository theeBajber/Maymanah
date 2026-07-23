import { prisma, safeQuery } from "@/lib/prisma";

const DAILY_DURATION = 15;
const MURAJA_DURATION = 60;

const WEEKDAYS = [1, 2, 3, 4, 5, 6];

function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function getTimezoneOffset(tz: string): number {
  const now = new Date();
  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(noon);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
  const tzMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (tzMs - noon.getTime()) / 60000;
}

function localSlotToUTCMinutes(dayOfWeek: number, time: string, tz: string): number {
  const [h, m] = time.split(":").map(Number);
  const offset = getTimezoneOffset(tz);
  const localMinutes = dayOfWeek * 1440 + h * 60 + m;
  return ((localMinutes - offset) % 10080 + 10080) % 10080;
}

function normalizeRange(startMin: number, endMin: number): { start: number; end: number }[] {
  if (startMin <= endMin) {
    return [{ start: startMin, end: endMin }];
  }
  return [{ start: startMin, end: 10080 }, { start: 0, end: endMin }];
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

function findFreeWindow(
  occupied: { start: number; end: number }[],
  overlapStart: number,
  overlapEnd: number,
  duration: number,
): number | null {
  for (let t = overlapStart; t + duration <= overlapEnd; t += 15) {
    const conflict = occupied.some(s => t < s.end && t + duration > s.start);
    if (!conflict) return t;
  }
  return null;
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

    const studentProfile = await safeQuery(() =>
      prisma.profile.findUnique({ where: { userId: studentId }, select: { timezone: true } }),
    );
    const studentTz = studentProfile?.timezone ?? "Africa/Nairobi";

    const studentAvail = await safeQuery(() =>
      prisma.availability.findMany({
        where: { userId: studentId, isRecurring: true },
      }),
    );
    if (studentAvail.length === 0) return null;

    const studentUtcRanges = studentAvail.flatMap(sa =>
      normalizeRange(
        localSlotToUTCMinutes(sa.dayOfWeek, sa.startTime, studentTz),
        localSlotToUTCMinutes(sa.dayOfWeek, sa.endTime, studentTz),
      ),
    );

    const MAX_STUDENTS_PER_TEACHER = 10;

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

    const teacherIds = teachers.map(t => t.id);

    const [profiles, allAvail, studentCounts] = await Promise.all([
      safeQuery(() =>
        prisma.profile.findMany({
          where: { userId: { in: teacherIds } },
          select: { userId: true, timezone: true },
        }),
      ),
      safeQuery(() =>
        prisma.availability.findMany({
          where: { userId: { in: teacherIds }, isRecurring: true },
        }),
      ),
      safeQuery(() =>
        prisma.mentorship.groupBy({
          by: ["teacherId"],
          where: { teacherId: { in: teacherIds }, status: "ACTIVE" },
          _count: true,
        }),
      ),
    ]);

    const tzMap = new Map(profiles.map(p => [p.userId, p.timezone ?? "Africa/Nairobi"]));
    const availMap = new Map<string, typeof allAvail>();
    for (const a of allAvail) {
      if (!availMap.has(a.userId)) availMap.set(a.userId, []);
      availMap.get(a.userId)!.push(a);
    }
    const studentCountMap = new Map(studentCounts.map(s => [s.teacherId, s._count]));

    const candidates: { teacherId: string; overlap: number; studentCount: number }[] = [];
    for (const tId of teacherIds) {
      const tz = tzMap.get(tId) ?? "Africa/Nairobi";
      const tAvail = availMap.get(tId) ?? [];
      const sc = studentCountMap.get(tId) ?? 0;

      if (sc >= MAX_STUDENTS_PER_TEACHER) continue;

      const tUtcRanges = tAvail.flatMap(ta =>
        normalizeRange(
          localSlotToUTCMinutes(ta.dayOfWeek, ta.startTime, tz),
          localSlotToUTCMinutes(ta.dayOfWeek, ta.endTime, tz),
        ),
      );

      let totalOverlap = 0;
      for (const sr of studentUtcRanges) {
        for (const tr of tUtcRanges) {
          totalOverlap += overlapMinutes(sr.start, sr.end, tr.start, tr.end);
        }
      }

      if (totalOverlap >= 15) {
        candidates.push({ teacherId: tId, overlap: totalOverlap, studentCount: sc });
      }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => a.studentCount - b.studentCount || b.overlap - a.overlap);
    const bestTeacherId = candidates[0].teacherId;
    const teacherTz = tzMap.get(bestTeacherId) ?? "Africa/Nairobi";

    const teacherAvail = availMap.get(bestTeacherId) ?? [];
    const teacherUtcRanges = teacherAvail.flatMap(ta =>
      normalizeRange(
        localSlotToUTCMinutes(ta.dayOfWeek, ta.startTime, teacherTz),
        localSlotToUTCMinutes(ta.dayOfWeek, ta.endTime, teacherTz),
      ),
    );

    const mentorship = existing ?? await safeQuery(() =>
      prisma.mentorship.create({
        data: { teacherId: bestTeacherId, studentId, status: "ACTIVE" },
      }),
    );

    const existingStudents = await safeQuery(() =>
      prisma.mentorship.findMany({
        where: { teacherId: bestTeacherId, status: "ACTIVE" },
        include: { recurringSlots: { where: { type: "MURAJA" } } },
      }),
    );

    const usedMurajaDays = new Set(
      existingStudents.flatMap(m =>
        m.recurringSlots.map(s => s.dayOfWeek),
      ),
    );

    const daysWithOverlap = new Set<number>();
    const daySlots: { day: number; start: number; end: number }[] = [];
    for (const sr of studentUtcRanges) {
      for (const tr of teacherUtcRanges) {
        if (!rangesOverlap(sr, tr)) continue;
        const start = Math.max(sr.start, tr.start);
        const end = Math.min(sr.end, tr.end);
        if (end - start < 15) continue;
        const utcDay = Math.floor(start / 1440);
        daysWithOverlap.add(utcDay);
        daySlots.push({ day: utcDay, start, end });
      }
    }

    daySlots.sort((a, b) => a.day - b.day || a.start - b.start);
    const weekdaySlots = daySlots.filter(s => WEEKDAYS.includes(s.day));

    const existingTeacherDailySlots = await safeQuery(() =>
      prisma.recurringSlot.findMany({
        where: {
          mentorship: { teacherId: bestTeacherId, status: "ACTIVE" },
          type: "DAILY_HIFDH",
        },
        select: { dayOfWeek: true, startTime: true, duration: true },
      }),
    );

    const occupiedByDay: Record<number, { start: number; end: number }[]> = {};
    for (const s of existingTeacherDailySlots) {
      const utcStart = localSlotToUTCMinutes(s.dayOfWeek, s.startTime, teacherTz);
      const utcEnd = utcStart + s.duration;
      const ranges = normalizeRange(utcStart, utcEnd);
      for (const r of ranges) {
        const day = Math.floor(r.start / 1440);
        if (!occupiedByDay[day]) occupiedByDay[day] = [];
        occupiedByDay[day].push({ start: r.start, end: r.end });
      }
    }

    if (daySlots.length > 0) {
      await safeQuery(() =>
        prisma.recurringSlot.deleteMany({ where: { mentorshipId: mentorship.id } }),
      );

      const seenDays = new Set<number>();
      for (const slot of weekdaySlots) {
        if (seenDays.has(slot.day)) continue;

        const existing = occupiedByDay[slot.day] ?? [];
        const freeStart = findFreeWindow(existing, slot.start, slot.end, DAILY_DURATION);
        if (freeStart === null) continue;

        seenDays.add(slot.day);
        await safeQuery(() =>
          prisma.recurringSlot.create({
            data: {
              mentorshipId: mentorship.id,
              type: "DAILY_HIFDH",
              dayOfWeek: slot.day,
              startTime: minutesToTime(freeStart),
              duration: DAILY_DURATION,
            },
          }),
        );
      }

      if (usedMurajaDays.size >= 7) return null;

      let murajaDay = [...daysWithOverlap].sort().find(d => !usedMurajaDays.has(d));
      if (murajaDay === undefined) {
        murajaDay = weekdaySlots.length > 0 ? weekdaySlots[0].day : daySlots[0].day;
      }
      const murajaSlot = daySlots.find(s => s.day === murajaDay) ?? daySlots[0];
      const murajaOffset = murajaSlot.start % 1440;
      await safeQuery(() =>
        prisma.recurringSlot.create({
          data: {
            mentorshipId: mentorship.id,
            type: "MURAJA",
            dayOfWeek: murajaDay,
            startTime: minutesToTime(murajaOffset),
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

export async function getTodayHifdhSlot(studentId: string, tz?: string) {
  if (!tz) {
    const profile = await safeQuery(() =>
      prisma.profile.findUnique({ where: { userId: studentId }, select: { timezone: true } }),
    );
    tz = profile?.timezone ?? "Africa/Nairobi";
  }

  const ref = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    weekday: "long",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(ref);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };
  const dayOfWeek = dayMap[parts.find(p => p.type === "weekday")!.value];

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

  const localH = get("hour"), localMi = get("minute");
  const [sh, sm] = slot.startTime.split(":").map(Number);
  const diff = (sh * 60 + sm) - (localH * 60 + localMi);
  const startTime = new Date(ref.getTime() + diff * 60000);
  const endTime = new Date(startTime.getTime() + slot.duration * 60000);

  return { startTime, endTime, duration: slot.duration };
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

export async function markMissedAppointments() {
  const now = new Date();
  await prisma.appointment.updateMany({
    where: {
      status: "SCHEDULED",
      endTime: { lt: now },
      joinedAt: null,
      missed: false,
    },
    data: { missed: true },
  });
}

export async function getReliabilityScore(userId: string): Promise<number> {
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [{ teacherId: userId }, { mentorship: { studentId: userId } }],
      status: { in: ["SCHEDULED", "ONGOING", "COMPLETED"] },
    },
    orderBy: { startTime: "desc" },
    take: 20,
    select: { joinedAt: true, startTime: true, status: true },
  });

  if (appointments.length === 0) return 100;

  const joined = appointments.filter(a => a.joinedAt !== null).length;
  return Math.round((joined / appointments.length) * 100);
}
