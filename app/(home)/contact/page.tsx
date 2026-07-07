"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
  faEnvelope,
  faMessage,
  faUser,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faWhatsapp,
  faYoutube,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { amiri } from "@/components/ui/fonts";
import { useToast } from "@/components/ui/toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.error || "Something went wrong.", variant: "error" });
        return;
      }

      toast({ title: "Message sent successfully!", description: "We'll get back to you as soon as possible.", variant: "success" });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast({ title: "Network error. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  const inputBase = "flex items-center gap-3 px-4 w-full border border-border focus-within:border-primary rounded-xl bg-bg-primary transition-colors";
  const inputEl = "w-full bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm";
  const labelBase = "text-[10px] uppercase tracking-widest font-bold text-text-secondary";

  return (
    <div className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className={`${amiri.className} text-4xl md:text-5xl font-bold text-text-primary mb-4`}>
            Get in Touch
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Have a question, suggestion, or want to collaborate? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
            <div>
              <label htmlFor="name" className={`${labelBase} block mb-2`}>Your Name</label>
              <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                <FontAwesomeIcon icon={faUser} className="size-4 text-text-muted shrink-0" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmad"
                  required
                  minLength={2}
                  className={inputEl}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={`${labelBase} block mb-2`}>Email Address</label>
              <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                <FontAwesomeIcon icon={faEnvelope} className="size-4 text-text-muted shrink-0" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmad@example.com"
                  required
                  className={inputEl}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className={`${labelBase} block mb-2`}>Subject</label>
              <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                <FontAwesomeIcon icon={faTag} className="size-4 text-text-muted shrink-0" />
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  required
                  minLength={2}
                  className={inputEl}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className={`${labelBase} block mb-2`}>Message</label>
              <div className={`${inputBase} p-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                <FontAwesomeIcon icon={faMessage} className="size-4 text-text-muted shrink-0 self-start mt-0.5" />
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  required
                  minLength={10}
                  rows={5}
                  className={`${inputEl} resize-none min-h-[120px] leading-relaxed`}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-text-inverse rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="size-5 animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} className="size-4" />
              )}
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <aside className="md:col-span-2 space-y-8">
            <div className="rounded-2xl border border-border bg-bg-elevated p-6">
              <h2 className="font-extrabold text-sm uppercase tracking-widest text-text-secondary mb-4">Contact Info</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faEnvelope} className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Email</p>
                    <a href="mailto:support@maymanah.com" className="text-text-primary text-sm hover:text-primary transition-colors">
                      support@maymanah.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-elevated p-6">
              <h2 className="font-extrabold text-sm uppercase tracking-widest text-text-secondary mb-4">Follow Us</h2>
              <div className="flex items-center gap-3">
                <Link href={""} className="size-10 flex rounded-xl border border-primary/30 items-center justify-center hover:bg-primary group transition-colors">
                  <FontAwesomeIcon icon={faYoutube} className="size-4 text-primary group-hover:text-text-inverse transition-colors" />
                </Link>
                <Link href={""} className="size-10 flex rounded-xl border border-primary/30 items-center justify-center hover:bg-primary group transition-colors">
                  <FontAwesomeIcon icon={faInstagram} className="size-4 text-primary group-hover:text-text-inverse transition-colors" />
                </Link>
                <Link href={""} className="size-10 flex rounded-xl border border-primary/30 items-center justify-center hover:bg-primary group transition-colors">
                  <FontAwesomeIcon icon={faWhatsapp} className="size-4 text-primary group-hover:text-text-inverse transition-colors" />
                </Link>
                <Link href={""} className="size-10 flex rounded-xl border border-primary/30 items-center justify-center hover:bg-primary group transition-colors">
                  <FontAwesomeIcon icon={faXTwitter} className="size-4 text-primary group-hover:text-text-inverse transition-colors" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-bg-elevated p-6">
              <p className={`${amiri.className} text-lg text-text-primary leading-relaxed`}>
                &ldquo;Whoever guides someone to goodness will have a reward like the one who acts upon it.&rdquo;
              </p>
              <p className="text-xs text-text-muted mt-3">&mdash; Prophet Muhammad ﷺ (Sahih Muslim)</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
