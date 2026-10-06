import type { Metadata } from "next";

import { AltLink, AuthCard } from "@/app/ui/form";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a link to choose a new Maymanah password.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your address and we will send you a link."
      footer={<p><AltLink href="/login">Back to sign in</AltLink></p>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
