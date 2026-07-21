"use client";

import { ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { AuthPanel } from "../AuthPanel";

type Strength = {
  label: string;
  bar: string;
  text: string;
  width: string;
};

export default function Register() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("role")?.toUpperCase() === "TEACHER"
      ? "TEACHER"
      : "STUDENT",
  );
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);

  const getPasswordStrength = (pwd: string): Strength | null => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6)
      return {
        label: "Too short — use at least 8 characters",
        bar: "bg-night-danger",
        text: "text-night-danger",
        width: "w-1/4",
      };
    if (pwd.length < 8)
      return {
        label: "Weak — add a few more characters",
        bar: "bg-night-warning",
        text: "text-night-warning",
        width: "w-2/4",
      };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return {
        label: "Fair — add an uppercase letter and a number",
        bar: "bg-lapis",
        text: "text-lapis",
        width: "w-3/4",
      };
    return {
      label: "Strong password",
      bar: "bg-night-success",
      text: "text-night-success",
      width: "w-full",
    };
  };

  const isValidName = (n: string) =>
    /^[a-zA-Z]+([\s'-][a-zA-Z]+)+$/.test(n.trim());

  const strength = getPasswordStrength(password);
  const nameError =
    nameTouched && name && !isValidName(name)
      ? "Enter your first and last name — letters, spaces, and hyphens only."
      : undefined;
  const confirmError =
    confirmPassword && password !== confirmPassword
      ? "These don't match yet — retype your password."
      : undefined;

  const failSubmit = (message: string) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      failSubmit("The passwords don't match — retype both fields.");
      return;
    }
    if (password.length < 8) {
      failSubmit("Your password needs at least 8 characters.");
      return;
    }
    if (!isValidName(name)) {
      failSubmit("Enter your full name — first and last.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        failSubmit(
          data.error?.[0]?.message || data.error || "Registration failed",
        );
        return;
      }

      setRegisteredEmail(email.trim().toLowerCase());
    } catch {
      setLoading(false);
      failSubmit("Something went wrong on our side. Please try again.");
    }
  };

  if (registeredEmail) {
    return (
      <AuthPanel heading="Check your email" wide>
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-brass/10">
            <FontAwesomeIcon icon={faEnvelope} className="size-7 text-brass" />
          </div>
          <p className="text-sm text-sage leading-relaxed max-w-sm">
            We sent a verification link to{" "}
            <strong className="text-ivory">{registeredEmail}</strong>.
            Click the link to activate your account.
          </p>
          <p className="text-xs text-sage/60">
            Didn&apos;t get the email? Check your spam folder or{" "}
            <button
              type="button"
              disabled={resending}
              onClick={async () => {
                setResending(true);
                try {
                  const res = await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: registeredEmail }),
                  });
                  if (res.ok) {
                    toast({ title: "Verification email resent!", variant: "success" });
                  } else {
                    toast({ title: "Failed to resend. Try again later.", variant: "error" });
                  }
                } catch {
                  toast({ title: "Failed to resend. Try again later.", variant: "error" });
                } finally {
                  setResending(false);
                }
              }}
              className="font-medium text-lapis transition-colors hover:text-ivory disabled:opacity-50"
            >
              {resending ? "Sending..." : "resend"}
            </button>
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-[10px] bg-brass px-6 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B]"
          >
            Go to Login
          </Link>
        </div>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel heading="Begin your journey" wide>
      {error && (
        <div
          role="alert"
          className={`mb-5 rounded-[10px] border border-night-danger/40 bg-night-danger/10 px-4 py-3 text-center text-sm text-night-danger ${shake ? "shake" : ""}`}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <SegmentedControl
          label="Join as"
          value={role}
          onChange={setRole}
          options={[
            { value: "STUDENT", label: "Learner" },
            { value: "TEACHER", label: "Teacher" },
          ]}
        />

        <Field label="Full name" htmlFor="name" error={nameError}>
          <Input
            id="name"
            type="text"
            icon={<User />}
            placeholder="Umar Farouq"
            autoComplete="name"
            value={name}
            invalid={!!nameError}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            required
          />
        </Field>

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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              icon={<Lock />}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field
            label="Confirm password"
            htmlFor="repeat"
            error={confirmError}
          >
            <PasswordInput
              id="repeat"
              icon={<Lock />}
              placeholder="Retype your password"
              autoComplete="new-password"
              value={confirmPassword}
              invalid={!!confirmError}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Field>
        </div>

        {(strength || (confirmPassword && !confirmError)) && (
          <div className="flex flex-col gap-1.5 px-0.5">
            {strength && (
              <>
                <div className="h-1 w-full overflow-hidden rounded-full bg-ivory/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.width}`}
                  />
                </div>
                <span className={`text-[13px] ${strength.text}`}>
                  {strength.label}
                </span>
              </>
            )}
            {confirmPassword && !confirmError && (
              <span className="text-[13px] text-night-success">
                Passwords match.
              </span>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={
            loading ||
            !name ||
            !email ||
            !password ||
            password !== confirmPassword ||
            password.length < 8
          }
          className="mt-1 w-full"
        >
          {loading ? "Creating your account" : "Create account"}
          {!loading && (
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
          )}
        </Button>

        <p className="text-center text-sm text-sage">
          Already enrolled?{" "}
          <Link
            href="/login"
            className="font-medium text-lapis transition-colors hover:text-ivory"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthPanel>
  );
}
