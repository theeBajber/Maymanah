import { Suspense } from "react";
import type { Metadata } from "next";

import { AltLink, AuthCard } from "@/app/ui/form";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Maymanah account.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to reach your lessons and sessions."
      footer={
        <>
          <p>
            No account yet? <AltLink href="/register">Create one</AltLink>
          </p>
          <p>
            <AltLink href="/forgot-password">Forgotten your password?</AltLink>
          </p>
        </>
      }
    >
      {/* useSearchParams needs a boundary during prerender. */}
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}