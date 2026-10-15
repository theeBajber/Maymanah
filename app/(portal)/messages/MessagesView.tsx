"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PortalHeader } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";

interface Partner {
  id: string;
  name: string | null;
  image: string | null;
}

interface MessageItem {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: Partner;
}

interface Conversation {
  partner: Partner;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
}

/** How often an open thread checks for new messages. */
const POLL_MS = 15_000;

/**
 * Conversations and the open thread.
 *
 * New messages arrive by polling while the thread is open, not by a socket:
 * fifteen seconds is fresh enough for study coordination without holding a
 * connection per reader. Opening a thread marks it read, so the unread count
 * and the badge clear together.
 */
export function MessagesView() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  const activePartner = conversations?.find((row) => row.partner.id === activePartnerId)?.partner ?? null;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/messages")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { conversations?: Conversation[] };
        if (!cancelled) setConversations(body.conversations ?? []);
      })
      .catch(() => {
        if (!cancelled) setConversations([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadThread = useCallback(async (partnerId: string) => {
    const response = await fetch(`/api/messages?userId=${encodeURIComponent(partnerId)}`);
    if (!response.ok) return;
    const body = (await response.json().catch(() => ({}))) as { messages?: MessageItem[] };
    const thread = body.messages ?? [];
    setMessages(thread);
    seenIds.current = new Set(thread.map((message) => message.id));

    await fetch("/api/messages/read", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ senderId: partnerId }),
    }).catch(() => {});

    setConversations((prev) =>
      (prev ?? []).map((row) =>
        row.partner.id === partnerId ? { ...row, unreadCount: 0 } : row,
      ),
    );
  }, []);

  useEffect(() => {
    if (!activePartnerId) return;
    // Loading the thread when it changes is data fetching, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadThread(activePartnerId);
    const timer = setInterval(() => void loadThread(activePartnerId), POLL_MS);
    return () => clearInterval(timer);
  }, [activePartnerId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!activePartnerId || !draft.trim() || sending) return;
    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ receiverId: activePartnerId, content: draft.trim() }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: MessageItem; error?: string };
      if (!response.ok || !body.message) {
        toast({ title: body.error ?? "Could not send that message", variant: "error" });
        return;
      }
      setDraft("");
      await loadThread(activePartnerId);
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <PortalHeader title="Messages" subtitle="Conversations with your teacher or students" />

      <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
        <aside aria-label="Conversations" className="flex flex-col gap-1 rounded-2xl border border-border bg-bg-elevated p-2">
          {conversations === null ? (
            <p className="p-4 text-sm text-text-secondary">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm font-medium text-text-primary">No conversations</p>
              <p className="mt-1 text-xs text-text-secondary">Pairing with a teacher or student starts one.</p>
            </div>
          ) : (
            conversations.map((row) => (
              <button
                key={row.partner.id}
                onClick={() => setActivePartnerId(row.partner.id)}
                aria-current={row.partner.id === activePartnerId ? "true" : undefined}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  row.partner.id === activePartnerId ? "bg-primary/10" : "hover:bg-bg-hover"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {row.partner.name ?? "Partner"}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">
                    {row.lastMessage?.content ?? "No messages yet"}
                  </span>
                </span>
                {row.unreadCount > 0 ? (
                  <span
                    aria-label={`${row.unreadCount} unread`}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-text-inverse"
                  >
                    {row.unreadCount > 9 ? "9+" : row.unreadCount}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </aside>

        <section aria-label="Thread" className="flex min-h-[24rem] flex-col rounded-2xl border border-border bg-bg-elevated">
          {!activePartner ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <p className="text-sm text-text-secondary">Select a conversation from the sidebar to start chatting.</p>
            </div>
          ) : (
            <>
              <header className="border-b border-border px-5 py-3">
                <p className="text-sm font-semibold text-text-primary">{activePartner.name ?? "Partner"}</p>
              </header>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-5" role="log" aria-label="Messages" aria-live="polite">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-text-secondary">No messages yet. Say assalamu alaikum.</p>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender.id !== activePartnerId;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <p
                          className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                            mine ? "bg-primary text-text-inverse" : "bg-bg-hover text-text-primary"
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-border p-4">
                <label htmlFor="message-draft" className="sr-only">
                  Write a message
                </label>
                <input
                  id="message-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  maxLength={5000}
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-4 text-sm text-ivory placeholder:text-sage/40 focus:border-brass/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="inline-flex h-11 items-center rounded-[10px] bg-brass px-5 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B] disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export function MessagesPage() {
  return <MessagesView />;
}
