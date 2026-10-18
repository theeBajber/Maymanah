import "server-only";

import { db } from "./db";
import { getCurrentUser, type SessionLike } from "./session";

export const NOTE_MAX_LENGTH = 500;

export type NotePriorityValue = "LOW" | "MEDIUM" | "HIGH";

export interface StudentNoteView {
  id: string;
  content: string;
  priority: NotePriorityValue;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
  sessionDate: Date | null;
}

function toView(row: {
  id: string;
  content: string;
  priority: NotePriorityValue;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
  appointment: { startTime: Date } | null;
}): StudentNoteView {
  return {
    id: row.id,
    content: row.content,
    priority: row.priority,
    resolved: row.resolved,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
    sessionDate: row.appointment?.startTime ?? null,
  };
}

export type CreateNoteFailure = "not_teacher" | "no_mentorship" | "bad_session" | "too_long" | "empty";

/**
 * Writes a follow-up note about a student.
 *
 * A note belongs to the teacher who wrote it and may name the session it came
 * from. The named session, when there is one, must belong to the same pairing,
 * so a note cannot be pinned onto an unrelated session.
 */
export async function createStudentNote(
  session: SessionLike | null,
  input: { studentId: string; content: string; priority: NotePriorityValue; appointmentId?: string },
): Promise<{ ok: true; id: string } | { ok: false; reason: CreateNoteFailure }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("createStudentNote requires a signed-in user");
  if (user.role !== "TEACHER") return { ok: false, reason: "not_teacher" };

  const content = input.content.trim();
  if (!content) return { ok: false, reason: "empty" };
  if (content.length > NOTE_MAX_LENGTH) return { ok: false, reason: "too_long" };

  const match = await db.mentorship.findFirst({
    where: { teacherId: user.id, studentId: input.studentId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!match) return { ok: false, reason: "no_mentorship" };

  if (input.appointmentId) {
    const appointment = await db.appointment.findFirst({
      where: { id: input.appointmentId, mentorshipId: match.id },
      select: { id: true },
    });
    if (!appointment) return { ok: false, reason: "bad_session" };
  }

  const note = await db.studentNote.create({
    data: {
      studentId: input.studentId,
      teacherId: user.id,
      appointmentId: input.appointmentId ?? null,
      content,
      priority: input.priority,
    },
    select: { id: true },
  });

  return { ok: true, id: note.id };
}

/**
 * Opens or closes a note.
 *
 * Only the teacher who wrote it may change it, so two teachers mentoring the
 * same student do not resolve each other's notes.
 */
export async function setNoteResolved(
  session: SessionLike | null,
  noteId: string,
  resolved: boolean,
): Promise<{ ok: true } | { ok: false; reason: "missing" }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("setNoteResolved requires a signed-in user");

  const note = await db.studentNote.findFirst({
    where: { id: noteId, teacherId: user.id },
    select: { id: true },
  });
  if (!note) return { ok: false, reason: "missing" };

  await db.studentNote.update({
    where: { id: noteId },
    data: { resolved, resolvedAt: resolved ? new Date() : null },
  });

  return { ok: true };
}

/** Every note a teacher has written about a student, newest first, split by state. */
export async function getNotesForStudent(
  teacherId: string,
  studentId: string,
): Promise<{ open: StudentNoteView[]; resolved: StudentNoteView[] }> {
  const rows = await db.studentNote.findMany({
    where: { teacherId, studentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      priority: true,
      resolved: true,
      resolvedAt: true,
      createdAt: true,
      appointment: { select: { startTime: true } },
    },
  });

  const views = rows.map(toView);
  return {
    open: views.filter((note) => !note.resolved),
    resolved: views.filter((note) => note.resolved),
  };
}

/**
 * Notes tied to one session, for either side of the pairing.
 *
 * Returns null when the viewer is neither the teacher nor the student of that
 * session, so the route can answer "not found" without revealing whether the
 * session exists.
 */
export async function getNotesForAppointment(
  viewerId: string,
  appointmentId: string,
): Promise<StudentNoteView[] | null> {
  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, OR: [{ teacherId: viewerId }, { mentorship: { studentId: viewerId } }] },
    select: { id: true },
  });
  if (!appointment) return null;

  const rows = await db.studentNote.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      priority: true,
      resolved: true,
      resolvedAt: true,
      createdAt: true,
      appointment: { select: { startTime: true } },
    },
  });

  return rows.map(toView);
}
