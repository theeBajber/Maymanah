"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faCommentDots,
  faChevronLeft,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
}

interface Conversation {
  partner: { id: string; name: string | null; image: string | null };
  lastMessage: Message | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activePartnerId) return;
    fetch(`/api/messages?userId=${activePartnerId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []));
    fetch("/api/messages/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: activePartnerId }),
    }).catch(() => {});
    setConversations((prev) =>
      prev.map((c) =>
        c.partner.id === activePartnerId ? { ...c, unreadCount: 0 } : c,
      ),
    );
  }, [activePartnerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = newMessage.trim();
    if (!content || !activePartnerId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activePartnerId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch {
    } finally {
      setSending(false);
    }
  }

  const activePartner = conversations.find(
    (c) => c.partner.id === activePartnerId,
  )?.partner;

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className={`w-full sm:w-80 border-r border-border flex flex-col ${activePartnerId ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-text-primary">Messages</h1>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-text-muted">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="size-12 rounded-full bg-bg-hover flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faCommentDots} className="size-5 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary">No conversations</p>
            <p className="text-xs text-text-muted mt-1">Messages with your mentor or student will appear here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.partner.id}
                onClick={() => setActivePartnerId(c.partner.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-hover transition-colors border-b border-border/50 ${
                  activePartnerId === c.partner.id ? "bg-primary/5" : ""
                }`}
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                  {c.partner.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {c.partner.name ?? "Unknown"}
                  </p>
                  {c.lastMessage && (
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {c.lastMessage.content}
                    </p>
                  )}
                </div>
                {c.unreadCount > 0 && (
                  <span className="size-5 rounded-full bg-primary text-text-inverse text-[10px] font-bold flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`flex-1 flex flex-col ${!activePartnerId ? "hidden sm:flex" : "flex"}`}>
        {activePartnerId && activePartner ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button
                onClick={() => setActivePartnerId(null)}
                className="sm:hidden size-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
              </button>
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                {activePartner.name?.[0] ?? "?"}
              </div>
              <p className="font-semibold text-text-primary">{activePartner.name ?? "Unknown"}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMine = m.sender.id === session?.user?.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
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
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-border">
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
                  placeholder="Type a message..."
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
          </>
        ) : (
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center p-8 text-center">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faCommentDots} className="size-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Your Messages</h2>
            <p className="text-sm text-text-secondary mt-1 max-w-sm">
              Select a conversation from the sidebar to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
