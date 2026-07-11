"use client";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { AuthPanel } from "../AuthPanel";

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(
        "That email and password don't match. Check for typos, or reset your password below.",
      );
      setPassword("");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthPanel heading="Continue your journey">
      {error && (
        <div
          role="alert"
          className={`mb-5 rounded-[10px] border border-night-danger/40 bg-night-danger/10 px-4 py-3 text-center text-sm text-night-danger ${shake ? "shake" : ""}`}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="stagger-fade flex flex-col gap-5">
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
        <Field
          label="Password"
          htmlFor="password"
          trailing={
            <Link
              href="/contact"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lapis transition-colors hover:text-ivory"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            icon={<Lock />}
            placeholder="Your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={!email || !password}
          className="mt-1 w-full"
        >
          {loading ? "Signing in" : "Sign in"}
          {!loading && (
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
          )}
        </Button>
        <p className="text-center text-sm text-sage">
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-lapis transition-colors hover:text-ivory"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
}
