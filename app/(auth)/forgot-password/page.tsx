"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { Field, Input } from "@/app/ui/input";
import { useToast } from "@/app/ui/toast";

import { AuthPanel } from "../AuthPanel";

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
      <AuthPanel heading="Check your email" wide>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-accent/10">
            <Mail className="size-7 text-accent" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
            If an account with{" "}
            <strong className="font-semibold text-text-primary">{email}</strong>{" "}
            exists, we&apos;ve sent a password reset link.
          </p>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-accent px-6 text-sm font-semibold text-text-inverse transition-all hover:brightness-95"
          >
            Back to login
          </Link>
        </div>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel heading="Reset your password" wide>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <p className="text-center text-sm leading-relaxed text-text-secondary">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            icon={<Mail />}
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={loading || !email}
          className="mt-1 w-full"
        >
          {loading ? "Sending..." : "Send reset link"}
        </Button>
        <p className="text-center text-sm text-text-secondary">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-lapis transition-colors hover:text-ivory"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
}
