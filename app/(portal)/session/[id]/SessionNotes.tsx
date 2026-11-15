"use client";

import { Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Dropdown } from "@/app/ui/Dropdown";
import { LocalTime } from "@/app/ui/LocalTime";
import { StatusChip, type StatusTone } from "@/app/ui/chips";
import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";

interface NoteView {
  id: string;
  content: string;
  priority: string;
  resolved: boolean;
  createdAt: string;
}

const PRIORITY: Record<string, { label: string; tone: StatusTone }> = {
  HIGH: { label: "High", tone: "danger" },
  MEDIUM: { label: "Medium", tone: "warning" },
  LOW: { label: "Low", tone: "neutral" },
};

const PRIORITY_OPTIONS: { value: "LOW" | "MEDIUM" | "HIGH"; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const FIELD =
  "w-full rounded-[10px] border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus-visible:border-primary";

/**
 * The follow-up notes attached to one session.
 *
 * Both sides see the list; only the teacher, who is given the student's id, can
 * add to it. Reading is a plain fetch, so the panel appears alongside the call
 * without blocking it.
 */
export function SessionNotes({
  appointmentId,
  studentId,
}: {
  appointmentId: string;
  studentId: string | null;
}) {
  const { toast } = useToast();
  const noteId = useId();
  const [notes, setNotes] = useState<NoteView[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/appointments/${appointmentId}/notes`)
      .then((response) => response.json())
      .then((body: { notes?: NoteView[] }) => {
        if (!cancelled) setNotes(body.notes ?? []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  async function save() {
    if (!studentId || !content.trim() || saving) return;
    setSaving(true);

    try {
      const response = await fetch("/api/ustadh/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentId, content: content.trim(), priority, appointmentId }),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; error?: string };

      if (!response.ok || !body.id) {
        toast({ title: body.error ?? "Could not save the note", variant: "error" });
        return;
      }

      setNotes((prev) => [
        {
          id: body.id!,
          content: content.trim(),
          priority,
          resolved: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setContent("");
      setPriority("MEDIUM");
      setShowAdd(false);
      toast({ title: "Note saved", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Session notes
        </p>
        {studentId ? (
          <button
            type="button"
            onClick={() => setShowAdd((value) => !value)}
            aria-expanded={showAdd}
            aria-controls="session-note-form"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <Plus aria-hidden className="size-3.5" />
            {showAdd ? "Close" : "Add note"}
          </button>
        ) : null}
      </div>

      {showAdd && studentId ? (
        <div id="session-note-form" className="flex flex-col gap-3">
          <label htmlFor={noteId} className="text-sm font-semibold text-text-primary">
            Note for yourself
          </label>
          <textarea
            id={noteId}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What to remember for this student"
            maxLength={500}
            rows={3}
            className={`${FIELD} resize-none`}
          />
          <div className="flex flex-wrap items-end gap-3">
            <Dropdown
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={setPriority}
              className="w-40"
            />
            <button
              type="button"
              onClick={save}
              disabled={saving || !content.trim()}
              className="ms-auto inline-flex min-h-11 items-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            Notes are visible to the student on this session page.
          </p>
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-text-secondary">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-text-secondary">No notes for this session.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => {
            const badge = PRIORITY[note.priority] ?? PRIORITY.LOW;
            return (
              <li key={note.id} className="flex items-start gap-3 text-sm">
                <StatusChip tone={badge.tone} className="mt-0.5 shrink-0">
                  {badge.label}
                </StatusChip>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line text-sm text-text-primary">{note.content}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    <LocalTime iso={note.createdAt} mode="date-short" />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
