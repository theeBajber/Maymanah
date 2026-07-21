"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faCommentDots,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null };
}

export default function TeacherChat() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchingTeacher, setFetchingTeacher] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isStudent = session?.user?.role === "STUDENT";

  useEffect(() => {
    if (!isStudent) return;
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        const conv = data.conversations?.[0];
        if (conv?.partner) {
          setTeacherId(conv.partner.id);
          setTeacherName(conv.partner.name ?? "My Teacher");
        }
      })
      .catch(() => {})
      .finally(() => setFetchingTeacher(false));
  }, [isStudent]);

  useEffect(() => {
    if (!open || !teacherId) return;
    fetch(`/api/messages?userId=${teacherId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]));
  }, [open, teacherId]);

  useEffect(() => {
    if (!open || !teacherId) return;
    const id = setInterval(() => {
      fetch(`/api/messages?userId=${teacherId}`)
        .then((r) => r.json())
        .then((data) => {
          setMessages((prev) => {
            const arr = prev ?? [];
            const existing = new Set(arr.map((m) => m.id));
            const newMsgs = (data.messages ?? []).filter(
              (m: Message) => !existing.has(m.id),
            );
            return newMsgs.length > 0 ? [...arr, ...newMsgs] : arr;
          });
        })
        .catch(() => {});
    }, 10_000);
    return () => clearInterval(id);
  }, [open, teacherId]);

  useEffect(() => {
    if (!open && messages && messages.length > 0 && teacherId) {
      const last = messages[messages.length - 1];
      if (last && last.sender.id === teacherId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, open, teacherId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = newMessage.trim();
    if (!content || !teacherId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: teacherId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...(prev ?? []), data.message]);
        setNewMessage("");
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to send", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setSending(false);
    }
  }

  if (!isStudent || fetchingTeacher || !teacherId) return null;

  function toggle() {
    setOpen(!open);
    if (open) setUnreadCount(0);
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end justify-end p-0 sm:p-6">
          <div
            className="absolute inset-0 bg-black/20 sm:bg-transparent"
            onClick={() => { setOpen(false); setUnreadCount(0); }}
          />
          <div className="relative w-full sm:w-96 h-[70vh] sm:h-[500px] sm:max-h-[70vh] rounded-t-2xl sm:rounded-2xl border border-border bg-bg-elevated shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCommentDots} className="text-primary size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{teacherName}</p>
                  <p className="text-[11px] text-text-muted">Online</p>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); setUnreadCount(0); }}
                className="size-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
              >
                <FontAwesomeIcon icon={faXmark} className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages === null ? (
                <div className="text-center text-sm text-text-muted py-8">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-text-muted py-8">
                  No messages yet. Say Assalamu Alaykum!
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender.id !== teacherId;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-primary text-text-inverse rounded-br-md"
                            : "bg-bg-hover text-text-primary rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-text-inverse/60" : "text-text-muted"}`}>
                          {new Date(m.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Message ${teacherName}...`}
                  maxLength={5000}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="size-10 rounded-xl bg-primary text-text-inverse flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={toggle}
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-40 size-14 rounded-full bg-primary text-text-inverse shadow-xl shadow-primary/30 hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-danger text-text-inverse text-[10px] font-bold flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
        <FontAwesomeIcon icon={faCommentDots} className="size-6" />
      </button>
    </>
  );
}
