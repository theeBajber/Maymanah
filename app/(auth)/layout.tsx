import type { Metadata } from "next";

import { amiri } from "@/app/ui/fonts";
import { AltLink } from "@/app/ui/form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Maymanah account.",
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-full flex flex-col items-center justify-center gap-10 py-16 px-6 *:px-0">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className={`text-4xl font-bold text-primary ${amiri.className}`}>Maymanah</p>
        <p className="text-sm text-text-tertiary">The Quran Without Borders</p>
      </div>

      {children}

      <p className="text-xs text-text-tertiary">
        <AltLink href="/">Return to the home page</AltLink>
      </p>
    </main>
  );
}