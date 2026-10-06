import type { Metadata } from "next";

import { AltLink, AuthCard } from "@/app/ui/form";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join Maymanah to get structured Quranic instruction from a qualified teacher.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Free for students. A qualified teacher is matched with you."
      footer={
        <>
          <p>
            Already have an account? <AltLink href="/login">Sign in</AltLink>
          </p>
          <p>
            Want to teach? <AltLink href="/teach">Apply to teach</AltLink>
          </p>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
