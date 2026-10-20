"use client";

import { Check, ChevronDown, ChevronRight, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { Dropdown } from "@/app/ui/Dropdown";
import { EmptyState, Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";

export interface NoteView {
  id: string;
  content: string;
  priority: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  sessionDate: string | null;
}

export interface SessionOption {
  id: string;
  startTime: string;
  label: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-night-danger/15 text-night-danger",
  MEDIUM: "bg-warning-muted text-warning",
  LOW: "bg-night-success/15 text-night-success",
};

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority] ?? "bg-bg-hover text-text-secondary"}`}>
      {priority}
    </span>
  );
}

function NoteCard({ note, onResolve, onReopen }: {
  note: NoteView;
  onResolve?: (id: string) => void;
  onReopen?: (id: string) => void;
}) {
  const meta = [
    note.sessionDate ? `Session ${new Date(note.sessionDate).toLocaleDateString()}` : null,
    note.resolvedAt ? `Resolved ${new Date(note.resolvedAt).toLocaleDateString()}` : null,
  ].filter(Boolean) as string[];

  return (
    <Panel className="flex items-start justify-between gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary">{note.content}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
          <PriorityBadge priority={note.priority} />
          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        {onResolve ? (
          <button
            type="button"
            onClick={() => onResolve(note.id)}
            title="Resolve"
            className="flex size-8 items-center justify-center rounded-lg bg-night-success/15 text-night-success transition-colors hover:bg-night-success hover:text-layl-deep"
          >
            <Check className="size-3.5" />
          </button>
        ) : null}
        {onReopen ? (
          <button
            type="button"
            onClick={() => onReopen(note.id)}
            title="Reopen"
            className="flex size-8 items-center justify-center rounded-lg bg-warning-muted text-warning transition-colors hover:bg-warning hover:text-layl-deep"
          >
            <RotateCcw className="size-3.5" />
          </button>
        ) : null}
      </div>
    </Panel>
  );
}

/**
 * A teacher's follow-up notes about one student.
 *
 * Open and resolved notes are kept apart so a concern stays visible until it is
 * deliberately closed. The list updates in place as notes are added, resolved,
 * or reopened.
 */
export function StudentNotes({
  studentId,
  openNotes: initialOpen,
  resolvedNotes: initialResolved,
  sessions,
}: {
  studentId: string;
  openNotes: NoteView[];
  resolvedNotes: NoteView[];
  sessions: SessionOption[];
}) {
  const { toast } = useToast();
  const [openNotes, setOpenNotes] = useState(initialOpen);
  const [resolvedNotes, setResolvedNotes] = useState(initialResolved);
  const [showResolved, setShowResolved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [sessionId, setSessionId] = useState("");
  const [saving, setSaving] = useState(false);

  async function resolve(noteId: string) {
    const response = await fetch(`/api/ustadh/notes/${noteId}/resolve`, { method: "PATCH" });
    if (!response.ok) {
      toast({ title: "Could not resolve that note", variant: "error" });
      return;
    }
    const note = openNotes.find((row) => row.id === noteId);
    if (!note) return;
    setOpenNotes((prev) => prev.filter((row) => row.id !== noteId));
    setResolvedNotes((prev) => [{ ...note, resolved: true, resolvedAt: new Date().toISOString() }, ...prev]);
  }

  async function reopen(noteId: string) {
    const response = await fetch(`/api/ustadh/notes/${noteId}/reopen`, { method: "PATCH" });
    if (!response.ok) {
      toast({ title: "Could not reopen that note", variant: "error" });
      return;
    }
    const note = resolvedNotes.find((row) => row.id === noteId);
    if (!note) return;
    setResolvedNotes((prev) => prev.filter((row) => row.id !== noteId));
    setOpenNotes((prev) => [{ ...note, resolved: false, resolvedAt: null }, ...prev]);
  }

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/ustadh/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentId, content: content.trim(), priority, appointmentId: sessionId || undefined }),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!response.ok || !body.id) {
        toast({ title: body.error ?? "Could not save the note", variant: "error" });
        return;
      }
      const session = sessions.find((row) => row.id === sessionId);
      setOpenNotes((prev) => [
        {
          id: body.id!,
          content: content.trim(),
          priority,
          resolved: false,
          resolvedAt: null,
          createdAt: new Date().toISOString(),
          sessionDate: session?.startTime ?? null,
        },
        ...prev,
      ]);
      setContent("");
      setPriority("MEDIUM");
      setSessionId("");
      setShowAdd(false);
      toast({ title: "Note saved", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const field = "rounded-[10px] border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-text-primary">Open notes ({openNotes.length})</h2>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd((value) => !value)}>
            <Plus className="size-3.5" />
            Add note
          </Button>
        </div>

        {showAdd ? (
          <Panel className="flex flex-col gap-3 p-4">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a note about this student..."
              maxLength={500}
              rows={3}
              className={`${field} resize-none`}
            />
            <p className="text-right text-xs text-text-muted">{content.length}/500</p>
            <div className="flex flex-wrap items-center gap-3">
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
              <div className="w-64">
                <Dropdown
                  options={[
                    { value: "", label: "No session linked" },
                    ...sessions.map((session) => ({ value: session.id, label: session.label })),
                  ]}
                  value={sessionId}
                  onChange={setSessionId}
                />
              </div>
              <Button size="sm" loading={saving} disabled={!content.trim()} onClick={save} className="ml-auto">
                Save
              </Button>
            </div>
          </Panel>
        ) : null}

        {openNotes.length === 0 ? (
          <EmptyState title="No open notes." />
        ) : (
          <div className="flex flex-col gap-2">
            {openNotes.map((note) => (
              <NoteCard key={note.id} note={note} onResolve={resolve} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowResolved((value) => !value)}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          {showResolved ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          Resolved notes ({resolvedNotes.length})
        </button>
        {showResolved ? (
          resolvedNotes.length === 0 ? (
            <p className="text-sm text-text-muted">No resolved notes.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {resolvedNotes.map((note) => (
                <NoteCard key={note.id} note={note} onReopen={reopen} />
              ))}
            </div>
          )
        ) : null}
      </section>
    </div>
  );
}
