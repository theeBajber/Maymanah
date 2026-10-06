import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { amiri } from "@/app/ui/fonts";
import { getCurrentUser, isLoginSessionActive, currentLoginSessionId } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

/**
 * The shell every signed-in page renders inside.
 *
 * A revoked device is turned away here rather than on each page, so a revoked
 * session cannot reach any of them.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!(await isLoginSessionActive(currentLoginSessionId(session)))) {
    // Rendered in place rather than redirected, because a redirect to the
    // sign-in page would look like the cookie had expired.
    return (
      <main className="min-h-full flex items-center justify-center px-6">
        <div className="max-w-md text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold">This device has been signed out</h1>
          <p className="text-sm text-text-secondary">Sign in again to carry on.</p>
          <a
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary font-bold text-text-inverse"
          >
            Sign in
          </a>
        </div>
      </main>
    );
  }

  const user = await getCurrentUser(session);

  return (
    <main className="min-h-full flex flex-col *:px-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-12">
        <header className="flex items-center justify-between gap-4 border-b border-divider pb-6">
          <a href="/dashboard" className={`text-2xl font-bold text-primary ${amiri.className}`}>
            Maymanah
          </a>
          {user ? <span className="text-sm text-text-tertiary">{user.name}</span> : null}
        </header>

        {children}
      </div>
    </main>
  );
}