"use client";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { OtpInput } from "@/components/ui/OtpInput";
import { useToast } from "@/components/ui/toast";
import { Input, PasswordInput, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthPanel } from "../AuthPanel";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast({ title: "Email verified! You can now sign in.", variant: "success" });
    }
  }, [searchParams, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    const check = await fetch("/api/auth/check-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const checkData = await check.json();

    if (!checkData.exists) {
      toast({ title: "Invalid email or password", variant: "error" });
      setPassword("");
      setLoading(false);
      return;
    }

    if (!checkData.emailVerified) {
      toast({ title: "Please verify your email before signing in.", variant: "error" });
      setLoading(false);
      return;
    }

    if (checkData.twoFactorEnabled) {
      setOtpSending(true);
      try {
        const res = await fetch("/api/auth/2fa/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const otpData = await res.json();
          toast({ title: otpData.error || "Failed to send code. Try again.", variant: "error" });
          setLoading(false);
          return;
        }
      } catch {
        toast({ title: "Failed to send code. Try again.", variant: "error" });
        setLoading(false);
        return;
      } finally {
        setOtpSending(false);
      }
      setStep("otp");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast({ title: "Invalid email or password", variant: "error" });
      setPassword("");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }, [email, password, toast, router]);

  const handleOtpSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      otpCode,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast({ title: "Invalid code. Try again.", variant: "error" });
      setOtpCode("");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }, [email, password, otpCode, toast, router]);

  return (
    <AuthPanel heading={step === "otp" ? "Enter verification code" : "Continue your journey"}>
      {step === "credentials" ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                href="/forgot-password"
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
            loading={loading || otpSending}
            disabled={!email || !password}
            className="mt-1 w-full"
          >
            {loading || otpSending ? "Signing in" : "Sign in"}
            {!loading && !otpSending && (
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
      ) : (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
          <p className="text-sm text-sage text-center leading-relaxed">
            A verification code was sent to <strong className="text-ivory">{email}</strong>
          </p>
          <div className="flex flex-col gap-2 items-center">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage" htmlFor="otp">
              Verification Code
            </label>
            <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
          </div>
          <Button
            type="submit"
            size="lg"
            loading={loading}
            disabled={otpCode.length !== 6}
            className="mt-1 w-full"
          >
            {loading ? "Verifying" : "Verify"}
          </Button>
          <button
            type="button"
            className="text-center text-sm text-lapis transition-colors hover:text-ivory"
            onClick={() => {
              setStep("credentials");
              setOtpCode("");
            }}
          >
            ← Back to login
          </button>
        </form>
      )}
    </AuthPanel>
  );
}

export default function LogIn() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
