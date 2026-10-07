import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { verifyEmailToken } from "@/lib/account-recovery";
import { AuthPanel } from "../AuthPanel";

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
      <AuthPanel heading="Confirm your email">
        <Outcome
          icon={<XCircle className="size-9 text-night-danger" />}
          title="That link is not valid"
          body="Open the link straight from your email, or ask for a new one from settings."
        />
      </AuthPanel>
    );
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    return (
      <AuthPanel heading="Confirm your email">
        <Outcome
          icon={<XCircle className="size-9 text-night-danger" />}
          title={result.reason === "expired" ? "That link has expired" : "That link cannot be used"}
          body={
            result.reason === "expired"
              ? "Confirmation links last a day. Ask for another from settings."
              : "It may already have been used. Ask for a new one from settings if you need it."
          }
        />
      </AuthPanel>
    );
  }

  return (
    <AuthPanel heading="Email confirmed">
      <Outcome
        icon={<CheckCircle2 className="size-9 text-night-success" />}
        title={`${result.value} is confirmed`}
        body="You can recover your account if you lose your password now."
        cta
      />
    </AuthPanel>
  );
}

function Outcome({
  icon,
  title,
  body,
  cta = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {icon}
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-ivory">{title}</p>
        <p className="text-sm text-sage">{body}</p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brass px-6 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B]"
      >
        {cta ? "Continue to your account" : "Go to your account"}
      </Link>
    </div>
  );
}
