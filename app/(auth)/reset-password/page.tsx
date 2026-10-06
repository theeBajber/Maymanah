import { Suspense } from "react";
import type { Metadata } from "next";

import { AltLink, AuthCard } from "@/app/ui/form";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
      subtitle="This link works once and expires within a day."
      footer={<p><AltLink href="/forgot-password">Request another link</AltLink></p>}
    >
      <Suspense fallback={<div className="h-40" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
