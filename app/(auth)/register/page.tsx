"use client";

import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented";
import { AuthPanel } from "../AuthPanel";

type Strength = {
  label: string;
  bar: string;
  text: string;
  width: string;
};

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  // Arriving from /teach preselects the teacher role (?role=teacher)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role")?.toUpperCase() === "TEACHER") setRole("TEACHER");
  }, []);

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
    setError("");

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

      await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      router.push("/onboarding");
    } catch {
      setLoading(false);
      failSubmit("Something went wrong on our side. Please try again.");
    }
  };

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
      <form onSubmit={handleSubmit} className="stagger-fade flex flex-col gap-5">
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
