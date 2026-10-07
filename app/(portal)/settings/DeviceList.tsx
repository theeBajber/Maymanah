"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, FormNotice } from "@/app/ui/form";

export interface Device {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastSeenAt: string;
  createdAt: string;
  current: boolean;
}

export function DeviceList({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function revokeAll() {
    setPending("all");
    setNotice(null);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });

      if (!response.ok) {
        setNotice({ tone: "danger", text: "Could not sign out your other devices. Try again." });
        return;
      }

      setNotice({ tone: "success", text: "Signed out everywhere. Sign in again to continue." });
      router.push("/login");
      router.refresh();
    } catch {
      setNotice({ tone: "danger", text: "Could not reach the server. Try again shortly." });
    } finally {
      setPending(null);
    }
  }

  async function revokeOne(deviceId: string) {
    setPending(deviceId);
    setNotice(null);

    try {
      const response = await fetch(`/api/account/device/${deviceId}`, { method: "DELETE" });

      if (!response.ok) {
        setNotice({ tone: "danger", text: "Could not sign that device out. Try again." });
        return;
      }

      setNotice({ tone: "success", text: "That device has been signed out." });
      router.refresh();
    } catch {
      setNotice({ tone: "danger", text: "Could not reach the server. Try again shortly." });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

      {devices.length === 0 ? (
        <p className="text-sm text-text-secondary">No other devices are signed in.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {devices.map((device) => (
            <li
              key={device.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card p-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-semibold text-text-primary truncate">
                  {device.deviceName}
                  {device.current ? <span className="text-primary"> · this device</span> : null}
                </span>
                <span className="text-xs text-text-tertiary">
                  {device.ipAddress} · signed in {new Date(device.createdAt).toLocaleDateString()}
                </span>
              </div>

              {device.current ? null : (
                <Button
                  variant="secondary"
                  size="md"
                  disabled={pending === device.id}
                  onClick={() => revokeOne(device.id)}
                >
                  {pending === device.id ? "Signing out…" : "Sign out"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {devices.length > 1 ? (
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="md" disabled={pending === "all"} onClick={revokeAll}>
            {pending === "all" ? "Signing out…" : "Sign out everywhere"}
          </Button>
          <p className="text-xs text-text-tertiary">
            Useful if you think someone else has used your account.
          </p>
        </div>
      ) : null}
    </div>
  );
}