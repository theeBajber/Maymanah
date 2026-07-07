"use client";

import { faArrowRight, faSpinner, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error || "Something went wrong", variant: "error" });
        return;
      }
      setSent(true);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="bg-bg-card rounded-xl border border-border shadow-2xl p-10 md:p-14 w-full max-w-xl animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-4xl md:text-5xl font-black flex items-center uppercase tracking-wider gap-4">
            <Image className="h-12 w-auto" src={"/logo.png"} height={339} width={439} alt="" />
            Maymanah
          </h1>
        </div>
        <div className="text-center py-6 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faEnvelope} className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Check your email</h2>
          <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
            If an account with <strong className="text-text-primary">{email}</strong> exists,
            we've sent a password reset link.
          </p>
          <a
            href="/login"
            className="inline-block mt-4 px-8 py-3 bg-primary text-text-inverse rounded-xl font-bold hover:brightness-110 transition-all active:scale-[0.97]"
          >
            Back to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-bg-card rounded-xl border border-border shadow-2xl p-10 md:p-14 w-full max-w-xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-2 mb-8">
        <h1 className="text-4xl md:text-5xl font-black flex items-center uppercase tracking-wider gap-4">
          <Image className="h-12 w-auto" src={"/logo.png"} height={339} width={439} alt="" />
          Maymanah
        </h1>
        <div className="flex items-center justify-center">
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
          <div className="mx-4 text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            Reset your password
          </div>
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <p className="text-sm text-text-secondary text-center leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold px-1" htmlFor="email">
            Email Address
          </label>
          <div className="flex items-center gap-3 px-4 h-12 border border-border focus-within:border-primary rounded-xl bg-bg-primary transition-colors">
            <Mail className="size-4 shrink-0 text-text-muted" />
            <input
              className="w-full bg-transparent placeholder:text-text-muted/50 focus:outline-none text-sm"
              id="email"
              placeholder="scholar@Maymanah.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          disabled={loading || !email}
          className="w-full h-12 bg-primary text-text-inverse rounded-xl font-bold text-base tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-primary/20"
          type="submit"
        >
          {loading ? "Sending..." : "Send Reset Link"}
          <FontAwesomeIcon
            icon={loading ? faSpinner : faArrowRight}
            className={`size-3.5 transition-transform ${loading ? "animate-spin" : ""}`}
          />
        </button>
        <div className="text-center pt-1">
          <a href="/login" className="text-xs text-primary font-medium hover:underline transition-all">
            Back to Login
          </a>
        </div>
      </form>
    </main>
  );
}
