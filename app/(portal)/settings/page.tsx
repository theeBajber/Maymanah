import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { currentLoginSessionId, getCurrentUser } from "@/lib/session";
import { ConfirmEmailButton } from "./ConfirmEmailButton";
import { DeviceList } from "./DeviceList";
import { PasswordPanel } from "./PasswordPanel";
import { TwoFactorPanel } from "./TwoFactorPanel";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await auth();
  const user = await getCurrentUser(session);

  if (!user) {
    return (
      <div className="text-center">
        <p>Sign in to manage your account.</p>
        <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
          Sign in
        </Link>
      </div>
    );
  }

  const currentSessionId = currentLoginSessionId(session);

  const devices = await db.loginSession.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { lastSeenAt: "desc" },
    select: { id: true, deviceName: true, ipAddress: true, createdAt: true, lastSeenAt: true },
  });

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-text-tertiary">Settings</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Your account</h1>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Email address</h2>
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-bg-card p-5">
          <span className="font-semibold">{user.email}</span>
          {user.emailVerified ? (
            <span className="text-sm text-success">Confirmed</span>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-warning">Not confirmed yet</span>
              <p className="text-xs text-text-tertiary">
                Confirming proves the address belongs to you, which lets you reset your password if you lose it.{" "}
                <ConfirmEmailButton email={user.email} />
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Two-factor authentication</h2>
        <div className="rounded-3xl border border-border bg-bg-card p-6">
          <TwoFactorPanel enabled={user.twoFactorEnabled} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Password</h2>
        <div className="rounded-3xl border border-border bg-bg-card p-6">
          <PasswordPanel />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Signed-in devices</h2>
        <p className="text-sm text-text-secondary">
          A session cookie keeps working on its own, so each device is checked against this list on every request.
          Signing one out here ends it immediately.
        </p>
        <DeviceList
          devices={devices.map((device) => ({
            id: device.id,
            deviceName: device.deviceName,
            ipAddress: device.ipAddress,
            createdAt: device.createdAt.toISOString(),
            lastSeenAt: device.lastSeenAt.toISOString(),
            current: device.id === currentSessionId,
          }))}
        />
      </section>
    </div>
  );
}
