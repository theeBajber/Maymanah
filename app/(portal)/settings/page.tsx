"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Monitor, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ThemeSelector } from "@/app/ui/theme-selector";
import { useToast } from "@/app/ui/toast";
import { Dropdown } from "@/app/ui/Dropdown";
import Image from "next/image";
import { Settings as SettingsIcon, Palette, ShieldCheck, GraduationCap, Pen, X } from "lucide-react";
import { Skeleton } from "@/app/ui/Skeleton";
import { AvailabilityEditor } from "@/app/ui/AvailabilityEditor";
import { OtpInput } from "@/app/ui/OtpInput";
import { defaultAvatar } from "@/lib/avatar";
import { Button } from "@/app/ui/button";
import { Field, Input, PasswordInput } from "@/app/ui/input";
import { EmptyState, Panel, PanelHeading, PortalHeader } from "@/app/ui/portal";

type TabType = "profile" | "preferences" | "account" | "teacher";

/** One entry of the settings tab row — the same pill nav the dashboard uses. */
interface SettingsTab {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

const baseTabs: SettingsTab[] = [
  { id: "profile", label: "Profile", icon: SettingsIcon },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "account", label: "Account", icon: ShieldCheck },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs: SettingsTab[] =
    session?.user?.role === "TEACHER"
      ? [...baseTabs, { id: "teacher", label: "Teacher", icon: GraduationCap }]
      : baseTabs;

  return (
    <div className="stagger-fade mx-auto w-full max-w-4xl space-y-6 p-6 md:py-10">
      <PortalHeader title="Settings" subtitle="Your profile, preferences, and signed-in devices." />

      <nav
        aria-label="Settings sections"
        className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-bg-elevated p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? "true" : undefined}
            className={`flex shrink-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-text-inverse"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <tab.icon className="size-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div key={activeTab} className="space-y-6">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "preferences" && <PreferencesSettings />}
        {activeTab === "account" && <AccountSettings />}
        {activeTab === "teacher" && <TeacherSettings />}
      </div>
    </div>
  );
}

/** One settings surface: the portal Panel, a labelled heading, and an optional save row. */
function SettingsPanel({
  label,
  description,
  children,
  save,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  save?: React.ReactNode;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <PanelHeading>{label}</PanelHeading>
      {description ? <p className="mb-4 text-sm text-text-secondary">{description}</p> : null}
      {children}
      {save ? (
        <div className="mt-5 flex justify-end border-t border-border pt-4">{save}</div>
      ) : null}
    </Panel>
  );
}

/** A labelled row with its control on the far side. */
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-primary/40 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description ? <p className="mt-0.5 text-xs text-text-muted">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function ProfileSettings() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    gender: (session?.user?.gender as string) || "",
    bio: "",
    phone: "",
    country: "",
    portrait: defaultAvatar(session?.user?.id),
  });
  const [loading, setLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const avatarPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarPickerRef.current && !avatarPickerRef.current.contains(e.target as Node)) {
        setShowAvatarPicker(false);
      }
    }
    if (showAvatarPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAvatarPicker]);

  useEffect(() => {
    fetch("/api/user/update-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) {
          setFormData((prev) => ({
            ...prev,
            gender: data.gender ?? prev.gender,
            name: data.name ?? prev.name,
            email: data.email ?? prev.email,
            bio: data.bio ?? "",
            phone: data.phone ?? "",
            country: data.country ?? "",
            portrait: data.image ?? defaultAvatar(session?.user?.id),
          }));
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const portraitOptions = [
    "/portraits/pattern-1.png",
    "/portraits/pattern-2.png",
    "/portraits/pattern-3.png",
    "/portraits/pattern-4.png",
    "/portraits/pattern-5.png",
    "/portraits/pattern-6.png",
    "/portraits/pattern-7.png",
    "/portraits/pattern-8.png",
    "/portraits/pattern-9.png",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortraitSelect = (portrait: string) => {
    setFormData((prev) => ({ ...prev, portrait }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: formData.portrait }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }

      toast({ title: "Profile updated successfully", variant: "success" });
      await update({ name: formData.name, image: formData.portrait, gender: formData.gender || undefined });
      setShowAvatarPicker(false);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to update profile",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPanel
      label="Profile"
      description="How you appear to your teacher and classmates."
      save={
        <Button type="submit" form="profile-form" loading={loading}>
          Save changes
        </Button>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              width={72}
              height={72}
              src={formData.portrait}
              alt="Profile"
              className="size-18 rounded-full object-cover ring-2 ring-border"
            />
            <button
              type="button"
              onClick={() => setShowAvatarPicker((p) => !p)}
              className="absolute -bottom-1 -right-1 bg-primary text-text-inverse rounded-full p-1.5 hover:brightness-110 transition-all text-xs shadow-raise"
              title="Change avatar"
            >
              <Pen className="size-3" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{session?.user?.name}</p>
            <p className="truncate text-sm text-text-secondary">{session?.user?.email}</p>
          </div>
        </div>

        {showAvatarPicker && (
          <div className="relative">
            <div
              ref={avatarPickerRef}
              className="absolute z-10 mt-2 w-full max-w-sm bg-bg-elevated border border-border rounded-2xl p-4 shadow-float"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-primary">Choose avatar</span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {portraitOptions.map((portrait) => (
                  <button
                    key={portrait}
                    type="button"
                    onClick={() => {
                      handlePortraitSelect(portrait);
                      setShowAvatarPicker(false);
                    }}
                    className={`relative size-14 rounded-full overflow-hidden ring-2 transition-all hover:scale-110 ${
                      formData.portrait === portrait
                        ? "ring-primary scale-110"
                        : "ring-border hover:ring-primary/50"
                    }`}
                  >
                    <Image src={portrait} alt="Avatar option" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Field label="Gender" htmlFor="gender">
          <div className="flex gap-3">
            {(["male", "female"] as const).map((g) => {
              const isGenderLocked = !!formData.gender;
              const isSelected = formData.gender === g;
              return (
                <button
                  key={g}
                  id={g}
                  type="button"
                  disabled={isGenderLocked}
                  onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                  className={`rounded-[10px] px-6 py-2.5 text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-text-inverse"
                      : "border border-border text-text-secondary hover:border-primary"
                  } ${isGenderLocked ? "opacity-60 cursor-not-allowed hover:border-border" : ""}`}
                >
                  {g === "male" ? "Male" : "Female"}
                </button>
              );
            })}
          </div>
          <p className="text-[13px] leading-snug text-text-secondary/80 px-0.5">
            {formData.gender
              ? "Gender is locked after your first save — it matches you with a same-gender teacher for live sessions. Contact support if this needs to change."
              : "Used to match you with a same-gender teacher for live sessions."}
          </p>
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </Field>
          <Field label="Email" htmlFor="email" hint="Cannot be changed">
            <Input id="email" name="email" value={formData.email} disabled />
          </Field>
        </div>

        <Field label="Bio" htmlFor="bio">
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-[10px] border border-border bg-bg-elevated/60 px-4 py-3 text-[15px] text-text-primary transition-all duration-300 focus:border-accent/60 focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--accent-rgb)_/_0.12),0_0_28px_-8px_rgb(var(--accent-rgb)_/_0.35)] resize-none"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input id="country" name="country" value={formData.country} onChange={handleChange} />
          </Field>
        </div>
      </form>
    </SettingsPanel>
  );
}

function TimezoneSetting() {
  const { toast } = useToast();
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/update-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.timezone) setTimezone(data.timezone);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      });
      if (res.ok) {
        toast({ title: "Timezone saved", variant: "success" });
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to save", variant: "error" });
      }
    } catch {
      toast({ title: "Failed to save", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPanel
      label="Timezone"
      description="Your local timezone, for accurate session scheduling."
      save={
        <Button onClick={handleSave} loading={saving}>
          Save
        </Button>
      }
    >
      <Dropdown
        label="Timezone"
        options={[
          { value: "Africa/Nairobi", label: "Africa/Nairobi" },
          { value: "Africa/Cairo", label: "Africa/Cairo" },
          { value: "Asia/Dubai", label: "Asia/Dubai" },
          { value: "Europe/London", label: "Europe/London" },
          { value: "America/New_York", label: "America/New York" },
          { value: "Asia/Kolkata", label: "Asia/Kolkata" },
        ]}
        value={timezone}
        onChange={(v) => setTimezone(v)}
      />
    </SettingsPanel>
  );
}

function InterfaceSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    language: "en",
    quranFont: "default",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/update-preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data?.language) {
          setPreferences((prev) => ({
            ...prev,
            language: data.language ?? "en",
            quranFont: data.quranFont ?? "default",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        throw new Error("Failed to update preferences");
      }

      toast({ title: "Interface settings saved", variant: "success" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to save settings",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPanel
      label="Appearance and interface"
      save={
        <Button onClick={handleSave} loading={loading}>
          Save settings
        </Button>
      }
    >
      <div className="space-y-5">
        <SettingRow title="Theme" description="Light, dark, or one of the decorated themes.">
          <ThemeSelector />
        </SettingRow>
        <Dropdown
          label="Language"
          options={[
            { value: "en", label: "English" },
            { value: "ar", label: "العربية (Arabic)" },
            { value: "fr", label: "Français (French)" },
            { value: "es", label: "Español (Spanish)" },
          ]}
          value={preferences.language}
          onChange={(v) => setPreferences((prev) => ({ ...prev, language: v }))}
        />
        <Dropdown
          label="Quran font"
          options={[
            { value: "default", label: "Default" },
            { value: "uthmani", label: "Uthmani" },
            { value: "madina", label: "Madina" },
          ]}
          value={preferences.quranFont}
          onChange={(v) => setPreferences((prev) => ({ ...prev, quranFont: v }))}
        />
      </div>
    </SettingsPanel>
  );
}

function NotificationsSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    studyReminders: true,
    reminderTime: "09:00",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/update-preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data?.emailNotifications !== undefined) {
          setPreferences((prev) => ({
            ...prev,
            emailNotifications: data.emailNotifications,
            studyReminders: data.studyReminders,
            reminderTime: data.reminderTime ?? "09:00",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggle = (field: string) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        throw new Error("Failed to update preferences");
      }

      toast({ title: "Notification preferences saved", variant: "success" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to save preferences",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPanel
      label="Notifications"
      save={
        <Button onClick={handleSave} loading={loading}>
          Save preferences
        </Button>
      }
    >
      <div className="space-y-3">
        <SettingRow title="Email notifications" description="Course updates and messages, by email.">
          <ToggleSwitch value={preferences.emailNotifications} onChange={() => handleToggle("emailNotifications")} />
        </SettingRow>
        <SettingRow title="Daily study reminder" description="A nudge at the same time every day.">
          <ToggleSwitch value={preferences.studyReminders} onChange={() => handleToggle("studyReminders")} />
        </SettingRow>
        {preferences.studyReminders ? (
          <Field label="Reminder time" htmlFor="reminder-time" className="max-w-40">
            <Input
              id="reminder-time"
              type="time"
              value={preferences.reminderTime}
              onChange={(e) => setPreferences((prev) => ({ ...prev, reminderTime: e.target.value }))}
            />
          </Field>
        ) : null}
      </div>
    </SettingsPanel>
  );
}

function PreferencesSettings() {
  return (
    <div className="space-y-6">
      <TimezoneSetting />
      <InterfaceSettings />
      <NotificationsSettings />
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <SecuritySettings />
      <SessionsSettings />
      <DangerZoneSettings />
    </div>
  );
}

function TeacherSettings() {
  return (
    <div className="space-y-6">
      <Panel className="p-5 sm:p-6">
        <PanelHeading>Weekly availability</PanelHeading>
        <AvailabilityEditor heading={false} />
      </Panel>
      <UstadhSettings />
      <MeetingSettings />
    </div>
  );
}

function SecuritySettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(true);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAOTP, setTwoFAOTP] = useState("");
  const [twoFAStep, setTwoFAStep] = useState<"prompt" | "otp" | "disable">("prompt");
  const [disablePassword, setDisablePassword] = useState("");
  const [twoFAActionLoading, setTwoFAActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/two-factor-status")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.enabled === "boolean") {
          setTwoFAEnabled(data.enabled);
        }
      })
      .catch(() => {})
      .finally(() => setTwoFALoading(false));
  }, []);

  const handleEnable2FA = async () => {
    setTwoFAActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/enable", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to enable 2FA", variant: "error" });
        return;
      }
      setTwoFAStep("otp");
      setTwoFAOTP("");
      toast({ title: "Verification code sent to your email.", variant: "success" });
    } catch {
      toast({ title: "Something went wrong.", variant: "error" });
    } finally {
      setTwoFAActionLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (twoFAOTP.length !== 6) return;
    setTwoFAActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify-enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: twoFAOTP }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Invalid code", variant: "error" });
        return;
      }
      setTwoFAEnabled(true);
      setShow2FAModal(false);
      setTwoFAStep("prompt");
      toast({ title: "Two-factor authentication enabled!", variant: "success" });
    } catch {
      toast({ title: "Something went wrong.", variant: "error" });
    } finally {
      setTwoFAActionLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) return;
    setTwoFAActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to disable 2FA", variant: "error" });
        return;
      }
      setTwoFAEnabled(false);
      setShow2FAModal(false);
      setTwoFAStep("prompt");
      setDisablePassword("");
      toast({ title: "Two-factor authentication disabled.", variant: "success" });
    } catch {
      toast({ title: "Something went wrong.", variant: "error" });
    } finally {
      setTwoFAActionLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to change password");
      }

      toast({ title: "Password changed successfully", variant: "success" });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to change password",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SettingsPanel
        label="Password"
        save={
          <Button type="submit" form="password-form" loading={loading}>
            Update password
          </Button>
        }
      >
        <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
          <Field label="Current password" htmlFor="current-password">
            <PasswordInput
              id="current-password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="New password" htmlFor="new-password">
              <PasswordInput
                id="new-password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm new password" htmlFor="confirm-password">
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </Field>
          </div>
        </form>
      </SettingsPanel>

      <SettingsPanel
        label="Two-factor authentication"
        description="A second code by email whenever you sign in."
      >
        <SettingRow
          title={twoFAEnabled ? "Enabled" : "Disabled"}
          description={
            twoFALoading
              ? "Checking your account…"
              : twoFAEnabled
                ? "Sign-ins ask for a code after your password."
                : "Turn it on to require a code after your password."
          }
        >
          {twoFALoading ? (
            <Skeleton className="h-9 w-24 rounded-[10px]" />
          ) : twoFAEnabled ? (
            <button
              type="button"
              onClick={() => {
                setTwoFAStep("disable");
                setDisablePassword("");
                setShow2FAModal(true);
              }}
              className="inline-flex h-9 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-danger"
            >
              Disable
            </button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setTwoFAStep("prompt");
                setShow2FAModal(true);
              }}
            >
              Enable
            </Button>
          )}
        </SettingRow>
      </SettingsPanel>

      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-elevated p-6 shadow-float">
            {twoFAStep === "prompt" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Enable two-factor</h3>
                <p className="text-sm text-text-secondary">
                  A verification code will be sent to your email. Enter it to confirm.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShow2FAModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleEnable2FA} loading={twoFAActionLoading}>
                    Send code
                  </Button>
                </div>
              </div>
            )}

            {twoFAStep === "otp" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Enter verification code</h3>
                <p className="text-center text-sm text-text-secondary">
                  Check your email for the 6-digit code.
                </p>
                <OtpInput value={twoFAOTP} onChange={setTwoFAOTP} disabled={twoFAActionLoading} />
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShow2FAModal(false);
                      setTwoFAStep("prompt");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleVerifyOTP}
                    loading={twoFAActionLoading}
                    disabled={twoFAOTP.length !== 6}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {twoFAStep === "disable" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Disable two-factor</h3>
                <p className="text-sm text-text-secondary">Enter your password to confirm.</p>
                <PasswordInput
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShow2FAModal(false)}>
                    Cancel
                  </Button>
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={twoFAActionLoading || !disablePassword}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-danger px-5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {twoFAActionLoading ? "Disabling…" : "Disable"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/** One row of the device list, as the sessions endpoint returns it. */
interface DeviceSession {
  id: string;
  device: string;
  location: string | null;
  lastActivity: string;
  createdAt: string;
  current: boolean;
}

function SessionsSettings() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch {
        // fetch failed
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogoutSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/user/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast({ title: "Device signed out", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to sign out the device", variant: "error" });
    }
  };

  return (
    <SettingsPanel
      label="Signed-in devices"
      description="Sessions older than 7 days are removed from this list on their own."
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState title="No signed-in devices found." />
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const isPhone = /iPhone|iPad|Android|Mobile/.test(s.device);
            const DeviceIcon: LucideIcon = isPhone ? Smartphone : Monitor;
            return (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-bg-primary/40 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border text-text-secondary">
                    <DeviceIcon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-primary">
                      <span className="truncate">{s.device}</span>
                      {s.current ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          This device
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {s.location ?? "Location not shared"}
                    </p>
                    <p className="mt-1 text-[11px] text-text-muted">
                      Active {timeAgo(s.lastActivity)} · signed in {timeAgo(s.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLogoutSession(s.id)}
                  className="shrink-0 rounded-[10px] border border-border px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-danger"
                >
                  Sign out
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsPanel>
  );
}

function DangerZoneSettings() {
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password) {
      toast({ title: "Password is required", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete account");
      }

      toast({ title: "Account deleted successfully", variant: "success" });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to delete account",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPanel label="Danger zone">
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
        <p className="text-sm font-semibold text-danger">Delete account</p>
        <p className="mt-1 text-xs text-danger/80">
          Once you delete your account, there is no going back. Everything is removed.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] bg-danger px-5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-[0.985]"
        >
          Delete my account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-elevated p-6 shadow-float">
            <h3 className="text-lg font-semibold text-text-primary">Confirm account deletion</h3>
            <p className="mt-2 text-sm text-text-secondary">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="mt-4">
              <Field label="Password" htmlFor="delete-password">
                <PasswordInput
                  id="delete-password"
                  placeholder="Enter your password to confirm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                }}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-danger px-5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsPanel>
  );
}

function ToggleSwitch({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
        value ? "bg-primary" : "bg-border"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-text-inverse ring-0 transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function UstadhSettings() {
  const { toast } = useToast();
  const [availableForTeaching, setAvailableForTeaching] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/ustadh/settings")
      .then((r) => r.json())
      .then((data) => {
        setAvailableForTeaching(data.availableForTeaching ?? false);
        setIsApproved(data.isApproved ?? false);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    const newValue = !availableForTeaching;
    try {
      const res = await fetch("/api/ustadh/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableForTeaching: newValue }),
      });
      if (res.ok) {
        setAvailableForTeaching(newValue);
        toast({ title: newValue ? "Now accepting students" : "No longer accepting students", variant: "success" });
      } else {
        const data = await res.json();
        toast({ title: data.error ?? "Failed to update.", variant: "error" });
      }
    } catch {
      toast({ title: "Failed to update.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPanel label="Teaching status" description="Your acceptance of new mentorship pairings.">
      {!loaded ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : (
        <div className="space-y-3">
          <SettingRow title="Approval status" description="Admins approve teachers before they can pair.">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                isApproved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              }`}
            >
              <span className={`size-2 rounded-full ${isApproved ? "bg-success" : "bg-warning"}`} />
              {isApproved ? "Approved" : "Pending review"}
            </span>
          </SettingRow>
          <SettingRow
            title="Available for teaching"
            description="Toggle on to accept new mentorship requests."
          >
            <ToggleSwitch value={availableForTeaching} onChange={handleToggle} disabled={loading} />
          </SettingRow>
        </div>
      )}
    </SettingsPanel>
  );
}

function MeetingSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<{
    configured: boolean;
    preference: "AUTO" | "MANUAL";
    connected: boolean;
    status: "CONNECTED" | "REAUTH_REQUIRED" | null;
    calendarName: string | null;
    defaultUrl: string | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [defaultUrl, setDefaultUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("meeting");

    if (outcome) {
      if (outcome === "connected") {
        toast({ title: "Calendar connected", variant: "success" });
      } else if (outcome === "forbidden") {
        toast({ title: "Only teachers can connect a calendar", variant: "error" });
      } else if (outcome === "cancelled") {
        toast({ title: "Calendar connection was cancelled", variant: "info" });
      } else {
        toast({ title: "Could not connect the calendar", variant: "error" });
      }

      params.delete("meeting");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }

    fetch("/api/meetings/settings")
      .then((response) => response.json())
      .then((body) => {
        setSettings(body);
        setDefaultUrl(body.defaultUrl ?? "");
      })
      .catch(() => {});
  }, [toast]);

  async function saveDefaultUrl(url: string) {
    setSaving(true);
    try {
      const response = await fetch("/api/meetings/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultUrl: url }),
      });
      const body = await response.json();
      if (!response.ok) {
        toast({ title: body.error ?? "Could not save the link", variant: "error" });
        return;
      }
      setSettings(body);
      setDefaultUrl(body.defaultUrl ?? "");
      toast({
        title: body.defaultUrl ? "Your lesson link is saved" : "Your lesson link was removed",
        variant: "success",
      });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function choose(preference: "AUTO" | "MANUAL") {
    if (!settings || settings.preference === preference) return;
    setSaving(true);
    try {
      const response = await fetch("/api/meetings/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference }),
      });
      const body = await response.json();
      if (!response.ok) {
        toast({ title: body.error ?? "Could not save the preference", variant: "error" });
        return;
      }
      setSettings(body);
      toast({
        title: preference === "AUTO" ? "Rooms will be created automatically" : "Lessons will use your own link",
        variant: "success",
      });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function disconnect() {
    setSaving(true);
    try {
      const response = await fetch("/api/meetings/google/disconnect", { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        toast({ title: body.error ?? "Could not disconnect the calendar", variant: "error" });
        return;
      }
      setSettings(body);
      toast({ title: "Calendar disconnected", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <SettingsPanel label="Lesson rooms">
        <Skeleton className="h-40 w-full rounded-xl" />
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      label="Lesson rooms"
      description="Students only see a Join lesson button. The room address is released when they join."
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose("AUTO")}
            disabled={saving}
            className={`rounded-xl border p-4 text-left transition-colors ${
              settings.preference === "AUTO"
                ? "border-primary/60 bg-primary/5"
                : "border-border hover:bg-bg-hover"
            }`}
          >
            <p className="text-sm font-semibold text-text-primary">Create rooms automatically</p>
            <p className="mt-1 text-xs text-text-secondary">
              A meeting room is created for each lesson in your connected calendar.
            </p>
          </button>
          <button
            type="button"
            onClick={() => choose("MANUAL")}
            disabled={saving}
            className={`rounded-xl border p-4 text-left transition-colors ${
              settings.preference === "MANUAL"
                ? "border-primary/60 bg-primary/5"
                : "border-border hover:bg-bg-hover"
            }`}
          >
            <p className="text-sm font-semibold text-text-primary">Use my own link</p>
            <p className="mt-1 text-xs text-text-secondary">
              Save a link below and every session uses it automatically. Nothing external is connected.
            </p>
          </button>
        </div>

        {/* The teacher's standing room: reused for every session, overridable
            per session from the session page. */}
        <div className="rounded-xl border border-border bg-bg-primary/40 p-4">
          <Field
            label="Your lesson link"
            htmlFor="default-meeting-url"
            hint="A Google Meet address reused for every session. A link pasted on a single session page overrides this one."
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="default-meeting-url"
                type="url"
                inputMode="url"
                autoComplete="off"
                value={defaultUrl}
                onChange={(event) => setDefaultUrl(event.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="md"
                  onClick={() => saveDefaultUrl(defaultUrl)}
                  disabled={saving || defaultUrl.trim() === (settings.defaultUrl ?? "")}
                >
                  Save link
                </Button>
                {settings.defaultUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => saveDefaultUrl("")}
                    disabled={saving}
                    className="hover:text-danger"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </Field>
        </div>

        {!settings.configured ? (
          <p className="text-xs text-text-secondary">
            Automatic rooms are not available on this deployment. Your saved link above is what
            students join with.
          </p>
        ) : (
          <SettingRow
            title={
              settings.connected
                ? `Connected${settings.calendarName ? ` · ${settings.calendarName}` : ""}`
                : settings.status === "REAUTH_REQUIRED"
                  ? "Connection needs renewing"
                  : "No calendar connected"
            }
            description={
              settings.connected
                ? "Rooms are created there; a link you paste is kept as a fallback."
                : settings.status === "REAUTH_REQUIRED"
                  ? "Access expired. Reconnect to keep automatic rooms working; lessons fall back to your link."
                  : "Connect to create rooms automatically. Lessons fall back to your link."
            }
          >
            {settings.connected ? (
              <Button type="button" variant="outline" size="sm" onClick={disconnect} disabled={saving} className="hover:text-danger">
                Disconnect
              </Button>
            ) : (
              <a
                href="/api/meetings/google/connect"
                className="inline-flex h-9 items-center rounded-[10px] bg-accent px-4 text-sm font-semibold text-text-inverse transition-all duration-300 hover:brightness-95"
              >
                {settings.status === "REAUTH_REQUIRED" ? "Reconnect Google" : "Connect Google Calendar"}
              </a>
            )}
          </SettingRow>
        )}
      </div>
    </SettingsPanel>
  );
}
