"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useToast } from "@/components/ui/toast";
import { Dropdown } from "@/components/ui/Dropdown";
import Image from "next/image";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCog,
  faLock,
  faBell,
  faPalette,
  faSignOut,
  faTrash,
  faShieldAlt,
  faSave,
  faX,
  faBars,
  faChalkboardUser,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Skeleton } from "@/components/ui/Skeleton";

type TabType =
  | "profile"
  | "security"
  | "notifications"
  | "interface"
  | "sessions"
  | "danger"
  | "ustadh";

interface SettingsTab {
  id: TabType;
  label: string;
  icon: IconDefinition;
}

const baseTabs: SettingsTab[] = [
  { id: "profile", label: "Profile", icon: faCog },
  { id: "security", label: "Security", icon: faLock },
  { id: "notifications", label: "Notifications", icon: faBell },
  { id: "interface", label: "Interface", icon: faPalette },
  { id: "sessions", label: "Sessions", icon: faSignOut },
  { id: "danger", label: "Danger Zone", icon: faTrash },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs: SettingsTab[] =
    session?.user?.role === "TEACHER"
      ? [{ id: "ustadh", label: "Ustadh", icon: faChalkboardUser }, ...baseTabs]
      : baseTabs;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <aside className="hidden md:flex md:w-56 border-r border-border bg-bg-elevated p-5 flex-col shrink-0">
        <h2 className="text-lg font-bold text-text-primary mb-5">Settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === tab.id
                  ? "bg-primary text-text-inverse shadow-sm shadow-primary/20"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="size-4 shrink-0" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/30 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-56 border-r border-border bg-bg-elevated p-5 overflow-y-auto md:hidden transition-transform z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-primary">Settings</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faX} className="size-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === tab.id
                  ? "bg-primary text-text-inverse shadow-sm shadow-primary/20"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="size-4 shrink-0" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden border-b border-border bg-bg-primary/80 backdrop-blur-md p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={faBars} className="size-5" />
          </button>
          <h2 className="text-lg font-bold text-text-primary">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "notifications" && <NotificationsSettings />}
          {activeTab === "interface" && <InterfaceSettings />}
          {activeTab === "sessions" && <SessionsSettings />}
          {activeTab === "danger" && <DangerZoneSettings />}
          {activeTab === "ustadh" && <UstadhSettings />}
        </div>
      </main>
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
    timezone: "Africa/Nairobi",
    quranLevel: "beginner",
    portrait: "/portraits/pattern-6.png",
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
            name: data.name ?? prev.name,
            email: data.email ?? prev.email,
            bio: data.bio ?? "",
            phone: data.phone ?? "",
            country: data.country ?? "",
            timezone: data.timezone ?? "Africa/Nairobi",
            quranLevel: data.quranLevel ?? "beginner",
            portrait: data.image ?? prev.portrait,
          }));
        }
      })
      .catch(() => {});
  }, []);

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
      setLoading(false);
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
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Profile Settings
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              width={80}
              height={80}
              src={formData.portrait}
              alt="Profile"
              className="size-20 rounded-full object-cover ring-2 ring-border"
            />
            <button
              type="button"
              onClick={() => setShowAvatarPicker((p) => !p)}
              className="absolute -bottom-1 -right-1 bg-primary text-text-inverse rounded-full p-1.5 hover:brightness-110 transition-all text-xs shadow-sm"
              title="Change avatar"
            >
              <FontAwesomeIcon icon={faPen} className="size-3" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {session?.user?.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {showAvatarPicker && (
          <div className="relative">
            <div
              ref={avatarPickerRef}
              className="absolute z-10 mt-2 bg-bg-elevated border border-border rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">Choose Avatar</span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <FontAwesomeIcon icon={faX} className="size-3" />
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
                    <Image
                      src={portrait}
                      alt="Avatar option"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Gender
          </label>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  formData.gender === g
                    ? "bg-primary text-text-inverse shadow-sm shadow-primary/20"
                    : "border border-border text-text-secondary hover:border-primary"
                }`}
              >
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-hover text-text-secondary cursor-not-allowed opacity-60 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Dropdown
              label="Timezone"
              options={[
                { value: "Africa/Nairobi", label: "Africa/Nairobi" },
                { value: "Africa/Cairo", label: "Africa/Cairo" },
                { value: "Asia/Dubai", label: "Asia/Dubai" },
                { value: "Europe/London", label: "Europe/London" },
                { value: "America/New York", label: "America/New York" },
                { value: "Asia/Kolkata", label: "Asia/Kolkata" },
              ]}
              value={formData.timezone}
              onChange={(v) => setFormData((prev) => ({ ...prev, timezone: v }))}
            />
          </div>
          <div>
            <Dropdown
              label="Quran Level"
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
              value={formData.quranLevel}
              onChange={(v) => setFormData((prev) => ({ ...prev, quranLevel: v }))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] shadow-sm shadow-primary/20"
        >
          <FontAwesomeIcon icon={faSave} className="size-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
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
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Security Settings
        </h2>

        <div className="mb-6 p-6 rounded-2xl border border-border bg-bg-elevated">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] shadow-sm shadow-primary/20"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-bg-elevated">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="size-5 text-primary" />
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Add an extra layer of security to your account.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-text-primary text-sm">2FA Status:</span>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-medium ${twoFAEnabled ? "text-success" : "text-text-muted"}`}
              >
                {twoFAEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  twoFAEnabled
                    ? "bg-danger/10 text-danger hover:bg-danger/20"
                    : "bg-primary text-text-inverse hover:brightness-110"
                }`}
              >
                {twoFAEnabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences((prev) => ({
      ...prev,
      reminderTime: e.target.value,
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
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Notification Settings
      </h2>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl border border-border bg-bg-elevated">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-text-primary">
              Email Notifications
            </h3>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                preferences.emailNotifications ? "bg-primary" : "bg-text-muted"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  preferences.emailNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-text-secondary">
            Receive email updates about your courses and messages
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-bg-elevated">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary">
              Daily Study Reminders
            </h3>
            <button
              onClick={() => handleToggle("studyReminders")}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                preferences.studyReminders ? "bg-primary" : "bg-text-muted"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  preferences.studyReminders ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {preferences.studyReminders && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Reminder Time
              </label>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={handleTimeChange}
                className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-5 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] shadow-sm shadow-primary/20"
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
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
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Interface Settings
      </h2>

      <div className="space-y-6">
        <div className="p-5 rounded-2xl border border-border bg-bg-elevated">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faPalette} className="size-5 text-primary" />
            Theme
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Choose your preferred color scheme
          </p>
          <div className="flex flex-wrap gap-3">
            <ThemeSelector />
          </div>
        </div>

        <div>
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
          <p className="text-xs text-text-secondary mt-1">
            Select your preferred interface language
          </p>
        </div>

        <div>
          <Dropdown
            label="Quran Font"
            options={[
              { value: "default", label: "Default" },
              { value: "uthmani", label: "Uthmani" },
              { value: "madina", label: "Madina" },
            ]}
            value={preferences.quranFont}
            onChange={(v) => setPreferences((prev) => ({ ...prev, quranFont: v }))}
          />
          <p className="text-xs text-text-secondary mt-1">
            Choose your preferred Quran font style
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] shadow-sm shadow-primary/20"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function SessionsSettings() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<
    {
      id: string;
      deviceName: string;
      ipAddress: string;
      lastActivity: string;
    }[]
  >([]);
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
        toast({ title: "Session logged out", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to logout session", variant: "error" });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Active Sessions
      </h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-bg-elevated">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-text-secondary">No active sessions found</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-border bg-bg-elevated flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-text-primary">
                  {s.deviceName}
                </h3>
                <p className="text-sm text-text-secondary">IP: {s.ipAddress}</p>
                <p className="text-xs text-text-muted mt-1">
                  Last activity: {new Date(s.lastActivity).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleLogoutSession(s.id)}
                className="px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors"
              >
                Logout
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-danger mb-6">Danger Zone</h2>

      <div className="p-6 rounded-2xl border-2 border-danger/30 bg-danger/5">
        <h3 className="text-lg font-semibold text-danger mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-danger/80 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2.5 bg-danger text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all active:scale-[0.97] shadow-sm shadow-danger/20"
        >
          Delete My Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-elevated rounded-2xl p-8 max-w-md w-full shadow-xl border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                }}
                className="flex-1 px-4 py-2.5 bg-bg-hover text-text-primary rounded-xl font-medium hover:bg-bg-hover/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-danger text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] shadow-sm shadow-danger/20"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
        value ? "bg-primary" : "bg-border"
      }`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function UstadhSettings() {
  const { toast } = useToast();
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [ijazah, setIjazah] = useState("");
  const [qiraah, setQiraah] = useState("");
  const [availableForTeaching, setAvailableForTeaching] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/ustadh/settings")
      .then((r) => r.json())
      .then((data) => {
        setBio(data.bio ?? "");
        setQualifications(data.qualifications ?? "");
        setIjazah(data.ijazah ?? "");
        setQiraah(data.qiraah ?? "");
        setAvailableForTeaching(data.availableForTeaching ?? false);
        setIsApproved(data.isApproved ?? false);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/ustadh/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, qualifications, ijazah, qiraah, availableForTeaching }),
      });
      if (res.ok) {
        toast({ title: "Ustadh profile updated successfully.", variant: "success" });
      } else {
        const data = await res.json();
        toast({ title: data.error ?? "Failed to update.", variant: "error" });
      }
    } catch {
      toast({ title: "Failed to update settings.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Ustadh Profile
      </h2>

      <div className="mb-6 p-4 rounded-2xl border border-border bg-bg-elevated">
        <p className="text-sm text-text-secondary mb-1">Approval Status</p>
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
            isApproved
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          }`}
        >
          <span className={`size-2 rounded-full ${isApproved ? "bg-success" : "bg-warning"}`} />
          {isApproved ? "Approved" : "Pending Review"}
        </span>
      </div>

      {!loaded ? (
        <div className="space-y-5">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-text-muted text-right mt-1">{bio.length}/500</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Qualifications
            </label>
            <textarea
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              placeholder="List your degrees, certifications, and teaching credentials."
            />
            <p className="text-xs text-text-muted text-right mt-1">{qualifications.length}/1000</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Ijazah
            </label>
            <textarea
              value={ijazah}
              onChange={(e) => setIjazah(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              placeholder="Provide details of your Ijazah — who issued it, what it covers..."
            />
            <p className="text-xs text-text-muted text-right mt-1">{ijazah.length}/1000</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Qiraah Specialization
            </label>
            <input
              type="text"
              value={qiraah}
              onChange={(e) => setQiraah(e.target.value)}
              placeholder="e.g. Hafs, Warsh, Qalun, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg-elevated">
            <div>
              <p className="font-semibold text-sm text-text-primary">Available for Teaching</p>
              <p className="text-xs text-text-muted mt-0.5">Toggle on to accept new mentorship requests</p>
            </div>
            <ToggleSwitch value={availableForTeaching} onChange={setAvailableForTeaching} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] shadow-sm shadow-primary/20"
          >
            <FontAwesomeIcon icon={faSave} className="size-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
