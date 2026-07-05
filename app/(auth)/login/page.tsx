"use client";
import { faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { OtpInput } from "@/components/ui/OtpInput";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setpassword("");
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
      setpassword("");
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
    <main className="bg-bg-card rounded-xl border border-border shadow-2xl p-10 md:p-14 w-full max-w-xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-2 mb-8">
        <h1 className="text-4xl md:text-5xl font-black flex items-center uppercase tracking-wider gap-4">
          <Image className="h-12 w-auto" src={"/logo.png"} height={339} width={439} alt="" />
          Maymanah
        </h1>
        <div className="flex items-center justify-center">
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
          <div className="mx-4 text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            {step === "otp" ? "Enter verification code" : "Your journey continues!"}
          </div>
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
        </div>
      </div>

      {step === "credentials" ? (
        <form className="space-y-5" onSubmit={handleSubmit}>
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
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] uppercase tracking-widest font-bold" htmlFor="password">
                Password
              </label>
              <a className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline transition-all" href="/forgot-password">
                Forgot Password?
              </a>
            </div>
            <div className="flex items-center gap-3 px-4 h-12 border border-border focus-within:border-primary rounded-xl bg-bg-primary transition-colors">
              <Lock className="size-4 shrink-0 text-text-muted" />
              <input
                className="w-full bg-transparent placeholder:text-text-muted/50 focus:outline-none text-sm"
                id="password"
                placeholder="•••••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setpassword(e.target.value)}
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
          <button
            disabled={loading || otpSending || !email || !password}
            className="w-full h-12 bg-primary text-text-inverse rounded-xl font-bold text-base tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-primary/20"
            type="submit"
          >
            {loading || otpSending ? "Signing In" : "Sign In"}
            <FontAwesomeIcon
              icon={loading || otpSending ? faSpinner : faArrowRight}
              className={`size-3.5 transition-transform ${loading || otpSending ? "animate-spin" : ""} ${!loading && email && password ? "group-hover:translate-x-0.5" : ""}`}
            />
          </button>
          <div className="flex justify-between items-center px-1 pt-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
              New Here?
            </span>
            <a className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline transition-all" href="/register">
              Create Account
            </a>
          </div>
        </form>
      ) : (
        <form className="space-y-5 animate-in fade-in duration-300" onSubmit={handleOtpSubmit}>
          <p className="text-sm text-text-secondary text-center leading-relaxed">
            A verification code was sent to <strong className="text-text-primary">{email}</strong>
          </p>
          <div className="flex flex-col gap-2 items-center">
            <label className="text-[10px] uppercase tracking-widest font-bold px-1" htmlFor="otp">
              Verification Code
            </label>
            <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
          </div>
          <button
            disabled={loading || otpCode.length !== 6}
            className="w-full h-12 bg-primary text-text-inverse rounded-xl font-bold text-base tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-primary/20"
            type="submit"
          >
            {loading ? "Verifying..." : "Verify"}
            <FontAwesomeIcon
              icon={loading ? faSpinner : faArrowRight}
              className={`size-3.5 transition-transform ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <div className="text-center pt-1">
            <button
              type="button"
              className="text-xs text-text-muted hover:text-primary font-medium transition-colors"
              onClick={() => {
                setStep("credentials");
                setOtpCode("");
              }}
            >
              ← Back to login
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function LogIn() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
