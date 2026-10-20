"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/app/ui/button";
import { Dropdown } from "@/app/ui/Dropdown";
import { GlassCard } from "@/app/ui/glass";
import { useToast } from "@/app/ui/toast";

interface NoteView {
  id: string;
  content: string;
  priority: string;
  resolved: boolean;
  createdAt: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-night-danger/15 text-night-danger",
  MEDIUM: "bg-warning-muted text-warning",
  LOW: "bg-night-success/15 text-night-success",
};

/**
 * The follow-up notes attached to one session.
 *
 * Both sides see the list; only the teacher, who is given the student's id, can
 * add to it. Reading is a plain fetch, so the panel appears alongside the call
 * without blocking it.
 */
export function SessionNotes({ appointmentId, studentId }: { appointmentId: string; studentId: string | null }) {
  const { toast } = useToast();
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
    if (!studentId || !content.trim()) return;
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
        { id: body.id!, content: content.trim(), priority, resolved: false, createdAt: new Date().toISOString() },
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
    <GlassCard className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Session notes</p>
        {studentId ? (
          <Button size="sm" variant="ghost" onClick={() => setShowAdd((value) => !value)}>
            <Plus className="size-3.5" />
            Add note
          </Button>
        ) : null}
      </div>

      {showAdd && studentId ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a note about this session..."
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-3 py-2 text-sm text-ivory focus:border-brass/60 focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <div className="w-40">
              <Dropdown
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                ]}
                value={priority}
                onChange={setPriority}
              />
            </div>
            <Button size="sm" loading={saving} disabled={!content.trim()} onClick={save} className="ml-auto">
              Save
            </Button>
          </div>
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-text-secondary">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-text-secondary">No notes for this session.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[note.priority] ?? "bg-bg-hover text-text-secondary"}`}>
                {note.priority}
              </span>
              <span className="text-text-secondary">{note.content}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
