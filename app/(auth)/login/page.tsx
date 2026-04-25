"use client";
import { faApple, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.SubmitEvent) => {
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
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="bg-bg-card rounded-xl border border-border shadow-2xl p-10 md:p-14 relative overflow-hidden w-full max-w-xl">
      <div className="flex flex-col items-center gap-2 mb-10">
        <h1 className="text-4xl md:text-5xl font-black flex items-center uppercase tracking-wider gap-4">
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
          <div className="mx-4 text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            Your journey continues!
          </div>
          <div className="h-px w-12 bg-linear-to-r from-transparent via-primary-dark to-transparent"></div>
        </div>
      </div>
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center font-medium">
          {error}
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
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
              className="w-full placeholder:text-primary/30 focus:outline-none"
              id="email"
              placeholder="scholar@rahiq.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label
              className="text-[10px] uppercase tracking-widest font-bold"
              htmlFor="password"
            >
              Password
            </label>
            <a
              className="text-[10px] uppercase tracking-widest text-primary font-bold hover:text-primary-dark transition-colors"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
          <div className="flex items-center gap-4 group px-4 h-14 border border-primary-dark/80 focus-within:border-primary rounded-xl">
            <Lock className="size-4! text-primary-dark/80 group-focus-within:text-primary transition-colors" />
            <input
              className="w-full placeholder:text-primary/30 focus:outline-none"
              id="password"
              placeholder="•••••••••••"
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          disabled={loading}
          className="w-full h-14 bg-primary text-text-inverse rounded-xl font-black text-lg tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          type="submit"
        >
          {loading ? "Signing In..." : "Sign In"}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="size-4! group-hover:translate-x-1 transition-transform"
          />
        </button>
        <div className="flex justify-between w-full items-center px-1">
          <span className="text-[10px] uppercase tracking-widest font-bold">
            New Here?
          </span>
          <a
            className="text-[10px] uppercase tracking-widest text-primary font-bold hover:text-primary-dark transition-colors"
            href="/register"
          >
            Create Account
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
      <div className="flex gap-4 w-full items-center">
        <button
          onClick={() => signIn("google", { callbackUrl: "/portal/dashboard" })}
          className="bg-text-primary text-text-inverse rounded-xl w-full h-14 flex items-center justify-center gap-px tracking-wider font-bold"
        >
          <FontAwesomeIcon icon={faGoogle} className="size-5!" />
          oogle
        </button>
        <button
          onClick={() => signIn("apple", { callbackUrl: "/portal/dashboard" })}
          className="bg-bg-primary rounded-xl w-full h-14 flex items-center justify-center gap-2 tracking-wider font-bold"
        >
          <FontAwesomeIcon icon={faApple} className="size-5!" />
          Apple
        </button>
      </div>
    </main>
  );
}
