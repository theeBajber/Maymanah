"use client";

import { faApple, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6)
      return { label: "Too short", color: "bg-danger", width: "w-1/4" };
    if (pwd.length < 8)
      return { label: "Weak", color: "bg-warning", width: "w-2/4" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: "Fair", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-success", width: "w-full" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
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
        setError(
          data.error?.[0]?.message || data.error || "Registration failed",
        );
        return;
      }

      await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      router.push("/dashboard");
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="bg-bg-card rounded-xl border border-border shadow-2xl p-8 md:p-14 relative overflow-hidden w-full max-w-xl">
      <div className="flex flex-col items-center gap-2 mb-6">
        <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 uppercase tracking-wider">
          <Image
            className="h-12 w-auto"
            src={"/logo.png"}
            height={339}
            width={439}
            alt=""
          />
          Rahiq
        </h1>
        <div className="flex items-center justify-center">
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
          <div className="mx-4 text-[10px] uppercase tracking-[0.3em] text-primary font-bold text-center">
            Begin your Quran Journey!
          </div>
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="w-full justify-center flex items-center">
          <div className="bg-bg-primary p-1.5 rounded-xl flex gap-1 border border-primary/10 w-fit">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === "STUDENT"
                  ? "bg-primary text-text-inverse shadow-lg shadow-primary/20"
                  : "hover:text-text-secondary"
              }`}
            >
              Learner
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === "TEACHER"
                  ? "bg-primary text-text-inverse shadow-lg shadow-primary/20"
                  : "hover:text-text-secondary"
              }`}
            >
              Teacher
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase tracking-widest font-bold px-1"
            htmlFor="name"
          >
            Full Name
          </label>
          <div className="flex items-center gap-4 group px-4 h-14 border border-primary-dark/80 focus-within:border-primary rounded-xl">
            <User className="size-4! text-primary-dark/80 group-focus-within:text-primary transition-colors" />
            <input
              className="w-full placeholder:text-primary/30 focus:outline-none bg-transparent"
              id="name"
              placeholder="Umar Farouq"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase tracking-widest font-bold px-1"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="flex items-center gap-4 group px-4 h-14 border border-primary-dark/80 focus-within:border-primary rounded-xl">
            <Mail className="size-4! text-primary-dark/80 group-focus-within:text-primary transition-colors" />
            <input
              className="w-full placeholder:text-primary/30 focus:outline-none bg-transparent"
              id="email"
              placeholder="scholar@rahiq.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex w-full flex-col gap-2">
            <label
              className="text-[10px] uppercase tracking-widest font-bold"
              htmlFor="password"
            >
              Password
            </label>
            <div className="flex items-center gap-4 group px-4 h-14 border border-primary-dark/80 focus-within:border-primary rounded-xl">
              <Lock className="size-4! text-primary-dark/80 group-focus-within:text-primary transition-colors" />
              <input
                className="w-full placeholder:text-primary/30 focus:outline-none bg-transparent"
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
                className="text-primary hover:text-primary-dark transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-4!" />
                ) : (
                  <Eye className="size-4!" />
                )}
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <label
              className="text-[10px] uppercase tracking-widest font-bold"
              htmlFor="repeat"
            >
              Confirm Password
            </label>
            <div className="flex items-center gap-4 group px-4 h-14 border border-primary-dark/80 focus-within:border-primary rounded-xl">
              <Lock className="size-4! text-primary-dark/80 group-focus-within:text-primary transition-colors" />
              <input
                className="w-full placeholder:text-primary/30 focus:outline-none bg-transparent"
                id="repeat"
                placeholder="•••••••••••"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="text-primary hover:text-primary-dark transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-4!" />
                ) : (
                  <Eye className="size-4!" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex w-full flex-col gap-1 px-1">
            {strength && (
              <>
                <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold ${strength.color.replace("bg-", "text-")}`}
                >
                  {strength.label}
                </span>
              </>
            )}
          </div>

          <div className="flex w-full px-1">
            {confirmPassword && (
              <p
                className={`text-[10px] font-bold ${password === confirmPassword ? "text-success" : "text-danger"}`}
              >
                {password === confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
          </div>
        </div>

        <button
          disabled={
            loading ||
            !name ||
            !email ||
            !password ||
            password !== confirmPassword ||
            password.length < 8
          }
          className="w-full h-14 bg-primary text-text-inverse rounded-xl font-black text-lg tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed! disabled:hover:shadow-primary/20 disabled:hover:translate-y-0"
          type="submit"
        >
          {loading ? "Creating Account" : "Create Account"}
          <FontAwesomeIcon
            icon={loading ? faSpinner : faArrowRight}
            className={`size-4! transition-transform ${loading ? "animate-spin" : ""} ${!loading && email && password && name && password === confirmPassword && password.length >= 7 ? "group-hover:translate-x-1" : ""}`}
          />
        </button>

        <div className="flex justify-between w-full items-center px-1">
          <span className="text-[10px] uppercase tracking-widest font-bold">
            Already enrolled?
          </span>
          <a
            className="text-[10px] uppercase tracking-widest text-primary font-bold hover:text-primary-dark transition-colors"
            href="/login"
          >
            Log In
          </a>
        </div>
      </form>
    </main>
  );
}
