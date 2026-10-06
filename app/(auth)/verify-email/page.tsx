import type { Metadata } from "next";

import { verifyEmailToken } from "@/lib/account-recovery";
import { AltLink, AuthCard, FormNotice } from "@/app/ui/form";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

/**
 * Reached as a link in a confirmation message.
 *
 * Confirmation happens when the link is followed rather than when a form is
 * submitted, so a link preview or a mail scanner cannot consume the token.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Confirm your email">
        <FormNotice tone="danger">That confirmation link is not valid.</FormNotice>
        <p className="text-center text-sm">
          <AltLink href="/dashboard">Continue to your account</AltLink>
        </p>
      </AuthCard>
    );
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    return (
      <AuthCard title="Confirm your email">
        <FormNotice tone="danger">
          {result.reason === "expired"
            ? "That link has expired. Ask for another from your account."
            : "That link is not valid or has already been used."}
        </FormNotice>
        <p className="text-center text-sm">
          <AltLink href="/dashboard">Continue to your account</AltLink>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Email confirmed" subtitle={`${result.value} is now confirmed.`}>
      <FormNotice tone="success">Thank you. Your address is confirmed.</FormNotice>
      <p className="text-center text-sm">
        <AltLink href="/dashboard">Continue to your account</AltLink>
      </p>
    </AuthCard>
  );
}