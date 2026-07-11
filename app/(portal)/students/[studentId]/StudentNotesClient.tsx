"use client";

import { useState } from "react";
import { Check, RotateCcw, ChevronDown, ChevronRight, Plus } from "lucide-react";

type Note = {
  id: string;
  content: string;
  priority: string;
  createdAt: string;
  sessionDate: string | null;
  resolvedAt?: string | null;
};

type SessionNote = {
  id: string;
  content: string;
  priority: string;
  createdAt: string;
};

type Session = {
  id: string;
  date: string;
  surahNumber: number | null;
  verseNumber: number | null;
  notes: SessionNote[];
};

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    HIGH: "bg-danger-muted text-danger",
    MEDIUM: "bg-warning-muted text-warning",
    LOW: "bg-success-muted text-success",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[priority] ?? "bg-bg-hover text-text-secondary"}`}>
      {priority}
    </span>
  );
}

function NoteCard({ note, onResolve, onReopen }: {
  note: Note;
  onResolve?: (id: string) => void;
  onReopen?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={() => setEditing(false)}
              maxLength={500}
              className="w-full bg-bg-secondary rounded-lg p-2 text-sm border border-border resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <p className="text-sm cursor-pointer" onDoubleClick={() => { setEditing(true); setEditContent(note.content); }}>
              {note.content}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            {priorityBadge(note.priority)}
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            {note.sessionDate && <span>Session: {new Date(note.sessionDate).toLocaleDateString()}</span>}
            {note.resolvedAt && <span>Resolved: {new Date(note.resolvedAt).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {onResolve && (
            <button onClick={() => onResolve(note.id)}
              className="size-8 flex items-center justify-center rounded-lg bg-success-muted text-success hover:bg-success hover:text-text-inverse transition-colors" title="Resolve">
              <Check className="size-3" />
            </button>
          )}
          {onReopen && (
            <button onClick={() => onReopen(note.id)}
              className="size-8 flex items-center justify-center rounded-lg bg-warning-muted text-warning hover:bg-warning hover:text-text-inverse transition-colors" title="Reopen">
              <RotateCcw className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudentNotesClient({
  studentId,
  openNotes: initialOpen,
  resolvedNotes: initialResolved,
  completedSessions,
}: {
  studentId: string;
  openNotes: Note[];
  resolvedNotes: Note[];
  completedSessions: Session[];
}) {
  const [openNotes, setOpenNotes] = useState(initialOpen);
  const [resolvedNotes, setResolvedNotes] = useState(initialResolved);
  const [showResolved, setShowResolved] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [newSessionId, setNewSessionId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleResolve(noteId: string) {
    const res = await fetch(`/api/ustadh/notes/${noteId}/resolve`, { method: "PATCH" });
    if (res.ok) {
      const note = openNotes.find((n) => n.id === noteId);
      if (note) {
        setOpenNotes((prev) => prev.filter((n) => n.id !== noteId));
        setResolvedNotes((prev) => [{ ...note, resolvedAt: new Date().toISOString() }, ...prev]);
      }
    }
  }

  async function handleReopen(noteId: string) {
    const res = await fetch(`/api/ustadh/notes/${noteId}/reopen`, { method: "PATCH" });
    if (res.ok) {
      const note = resolvedNotes.find((n) => n.id === noteId);
      if (note) {
        setResolvedNotes((prev) => prev.filter((n) => n.id !== noteId));
        setOpenNotes((prev) => [{ ...note, resolvedAt: null }, ...prev]);
      }
    }
  }

  async function handleSaveNote() {
    if (!newContent.trim() || newContent.length > 500) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ustadh/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          content: newContent.trim(),
          priority: newPriority,
          sessionId: newSessionId || undefined,
        }),
      });
      if (res.ok) {
        const note = await res.json();
        setOpenNotes((prev) => [{
          id: note.id,
          content: note.content,
          priority: note.priority,
          createdAt: note.createdAt,
          sessionDate: null,
        }, ...prev]);
        setNewContent("");
        setNewPriority("MEDIUM");
        setNewSessionId("");
        setShowAddNote(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xl font-semibold">Open To-Do Notes ({openNotes.length})</h2>
          <button onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center gap-1 text-sm bg-primary text-text-inverse px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
            <Plus className="size-3" /> Add Note
          </button>
        </div>

        {showAddNote && (
          <div className="bg-bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write a note about this student..." maxLength={500}
              className="w-full bg-bg-secondary rounded-lg p-3 text-sm border border-border resize-none" rows={3} />
            <p className="text-xs text-text-muted text-right">{newContent.length}/500</p>
            <div className="flex items-center gap-4">
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <select value={newSessionId} onChange={(e) => setNewSessionId(e.target.value)}
                className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm">
                <option value="">No session linked</option>
                {completedSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.date).toLocaleDateString()}{s.surahNumber ? ` - Surah ${s.surahNumber}` : ""}
                  </option>
                ))}
              </select>
              <button onClick={handleSaveNote} disabled={saving || !newContent.trim()}
                className="ml-auto bg-primary text-text-inverse px-4 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {openNotes.length === 0 ? (
          <p className="text-text-secondary text-sm">No open notes.</p>
        ) : (
          <div className="space-y-2">
            {openNotes.map((note) => <NoteCard key={note.id} note={note} onResolve={handleResolve} />)}
          </div>
        )}
      </section>

      <section>
        <button onClick={() => setShowResolved(!showResolved)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
          {showResolved ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          <span className="text-sm font-medium">Resolved Notes ({resolvedNotes.length})</span>
        </button>
        {showResolved && (
          <div className="mt-3 space-y-2">
            {resolvedNotes.length === 0 ? (
              <p className="text-text-muted text-sm">No resolved notes.</p>
            ) : (
              resolvedNotes.map((note) => <NoteCard key={note.id} note={note} onReopen={handleReopen} />)
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Session History</h2>
        {completedSessions.length === 0 ? (
          <p className="text-text-secondary text-sm">No completed sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {completedSessions.map((s) => (
              <div key={s.id} className="bg-bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">
                    {new Date(s.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  {(s.surahNumber || s.verseNumber) && (
                    <span className="text-xs text-text-secondary">Surah {s.surahNumber ?? "?"}:{s.verseNumber ?? "?"}</span>
                  )}
                </div>
                {s.notes.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {s.notes.map((n) => (
                      <div key={n.id} className="flex items-start gap-2 text-sm">
                        {priorityBadge(n.priority)}
                        <span className="text-text-secondary">{n.content}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">No notes recorded.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
