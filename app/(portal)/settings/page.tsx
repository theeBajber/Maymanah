import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { currentLoginSessionId, getCurrentUser } from "@/lib/session";
import { PortalHeader } from "@/app/ui/portal";
import { ConfirmEmailButton } from "./ConfirmEmailButton";
import { DeviceList, PasswordPanel, TwoFactorPanel } from "./panels";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await auth();
  const user = await getCurrentUser(session);

  if (!user) redirect("/login");

  const currentSessionId = currentLoginSessionId(session);

  const devices = await db.loginSession.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { lastSeenAt: "desc" },
    select: { id: true, deviceName: true, ipAddress: true, createdAt: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
      <PortalHeader title="Your account" subtitle="Security, password, and signed-in devices" />

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Email address</h2>
        <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-bg-elevated p-5">
          <span className="text-sm font-semibold text-text-primary">{user.email}</span>
          {user.emailVerified ? (
            <span className="text-[13px] text-night-success">Confirmed</span>
          ) : (
            <>
              <span className="text-[13px] text-warning">Not confirmed yet</span>
              <p className="text-[13px] leading-snug text-sage">
                Confirming proves the address belongs to you, which is what lets you reset your password if you lose
                it. Sign-in works either way. <ConfirmEmailButton email={user.email} />
              </p>
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Two-factor authentication
        </h2>
        <TwoFactorPanel enabled={user.twoFactorEnabled} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Password</h2>
        <PasswordPanel />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Signed-in devices</h2>
        <p className="text-[13px] leading-snug text-sage">
          A session cookie keeps working on its own, so each device is checked against this list on every request.
          Signing one out here ends it immediately rather than whenever its cookie happens to expire.
        </p>
        <DeviceList
          devices={devices.map((device) => ({
            id: device.id,
            deviceName: device.deviceName,
            ipAddress: device.ipAddress,
            createdAt: device.createdAt.toISOString(),
            current: device.id === currentSessionId,
          }))}
        />
      </section>
    </div>
  );
}
