"use client";

import { faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { OtpInput } from "@/components/ui/OtpInput";
import { useToast } from "@/components/ui/toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsOTP, setNeedsOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "error" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          otpCode: otpCode || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "2FA_REQUIRED") {
          setNeedsOTP(true);
          toast({ title: "Verification code sent to your email.", variant: "info" });
          return;
        }
        toast({ title: data.error || "Failed to reset password", variant: "error" });
        return;
      }

      toast({ title: "Password reset successfully! You can now sign in.", variant: "success" });
      router.push("/login");
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [token, password, confirmPassword, otpCode, toast, router]);

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
            Set new password
          </div>
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {needsOTP && (
          <div className="space-y-3 p-4 rounded-xl bg-bg-primary border border-border">
            <label className="text-[10px] uppercase tracking-widest font-bold px-1 block text-center" htmlFor="otp">
              Verification Code
            </label>
            <p className="text-xs text-text-secondary text-center">
              A code was sent to your email. Enter it below.
            </p>
            <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold" htmlFor="password">
            New Password
          </label>
          <div className="flex items-center gap-3 px-4 h-12 border border-border focus-within:border-primary rounded-xl bg-bg-primary transition-colors">
            <Lock className="size-4 shrink-0 text-text-muted" />
            <input
              className="w-full bg-transparent placeholder:text-text-muted/50 focus:outline-none text-sm"
              id="password"
              placeholder="•••••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="text-text-muted hover:text-text-primary transition-colors shrink-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="flex items-center gap-3 px-4 h-12 border border-border focus-within:border-primary rounded-xl bg-bg-primary transition-colors">
            <Lock className="size-4 shrink-0 text-text-muted" />
            <input
              className="w-full bg-transparent placeholder:text-text-muted/50 focus:outline-none text-sm"
              id="confirmPassword"
              placeholder="•••••••••••"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          disabled={loading || !password || !confirmPassword}
          className="w-full h-12 bg-primary text-text-inverse rounded-xl font-bold text-base tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-primary/20"
          type="submit"
        >
          {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
