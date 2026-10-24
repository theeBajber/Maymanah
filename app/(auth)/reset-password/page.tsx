"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { Button } from "@/app/ui/button";
import { Field, PasswordInput } from "@/app/ui/input";
import { useToast } from "@/app/ui/toast";

import { AuthPanel } from "../AuthPanel";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (password !== confirmPassword) {
        toast({ title: "Passwords do not match", variant: "error" });
        return;
      }
      if (password.length < 8) {
        toast({
          title: "Password must be at least 8 characters",
          variant: "error",
        });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast({ title: data.error || "Failed to reset password", variant: "error" });
          return;
        }

        toast({
          title: "Password reset successfully! You can now sign in.",
          variant: "success",
        });
        router.push("/login");
      } catch {
        toast({ title: "Something went wrong. Please try again.", variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [token, password, confirmPassword, toast, router],
  );

  return (
    <AuthPanel heading="Set new password" wide>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Field
          label="New password"
          htmlFor="password"
          hint="At least 8 characters."
        >
          <PasswordInput
            id="password"
            icon={<Lock />}
            placeholder="Your new password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            icon={<Lock />}
            placeholder="Retype your password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={loading || !password || !confirmPassword}
          className="mt-1 w-full"
        >
          {loading ? "Resetting..." : "Reset password"}
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

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
