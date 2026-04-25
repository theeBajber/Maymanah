"use client";

import { faApple, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
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
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(
          data.error?.[0]?.message || data.error || "Registration failed",
        );
        return;
      }

      router.push("/login");
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
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
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

        <button
          disabled={loading}
          className="w-full h-14 bg-primary text-text-inverse rounded-xl font-black text-lg tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          type="submit"
        >
          {loading ? "Creating Account..." : "Create Account"}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="size-4! group-hover:translate-x-1 transition-transform"
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

      <div className="my-4 text-center relative">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-bg-card text-text-secondary font-medium uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex gap-4 w-full flex-col sm:flex-row items-center">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/portal/dashboard" })}
          className="bg-text-primary text-text-inverse rounded-xl w-full h-14 flex items-center justify-center gap-px tracking-wider font-bold hover:opacity-90 transition-opacity"
        >
          <FontAwesomeIcon icon={faGoogle} className="size-5!" />
          oogle
        </button>
        <button
          type="button"
          onClick={() => signIn("apple", { callbackUrl: "/portal/dashboard" })}
          className="bg-bg-primary rounded-xl w-full h-14 flex items-center justify-center gap-2 tracking-wider font-bold hover:bg-bg-primary/80 transition-colors"
        >
          <FontAwesomeIcon icon={faApple} className="size-5!" />
          Apple
        </button>
      </div>
    </main>
  );
}
