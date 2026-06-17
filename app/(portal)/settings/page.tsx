"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TopNav } from "@/components/ui/PortalNav";
import { ThemeSelector } from "@/components/ui/theme-selector";
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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs: SettingsTab[] =
    session?.user?.role === "TEACHER"
      ? [{ id: "ustadh", label: "Ustadh", icon: faChalkboardUser }, ...baseTabs]
      : baseTabs;

  return (
    <div className="flex flex-col h-screen w-full items-start pt-16 pb-16 md:pb-0">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:w-56 border-r border-border-strong bg-bg-card p-6 flex-col overflow-y-auto">
          <h2 className="text-lg font-bold text-text-primary mb-6">Settings</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-primary text-text-inverse"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="size-4 shrink-0" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 bg-black/50 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed top-16 left-0 bottom-0 w-56 border-r border-border-strong bg-bg-card p-6 overflow-y-auto md:hidden transition-transform transform z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Settings</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <FontAwesomeIcon icon={faX} className="size-5" />
            </button>
          </div>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-primary text-text-inverse"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="size-4 shrink-0" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header Bar */}
          <div className="md:hidden border-b border-border-strong bg-bg-primary p-4 flex items-center justify-between">
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
            <div className="w-5" /> {/* Spacer for alignment */}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start justify-between gap-4 ${
                  message.type === "success"
                    ? "bg-success-muted text-success border border-success"
                    : "bg-danger-muted text-danger border border-danger"
                }`}
              >
                <p className="flex-1">{message.text}</p>
                <button
                  onClick={() => setMessage(null)}
                  className="shrink-0 hover:opacity-70 transition-opacity"
                >
                  <FontAwesomeIcon icon={faX} className="size-4" />
                </button>
              </div>
            )}

            {/* Tab content */}
            {activeTab === "profile" && (
              <ProfileSettings onMessage={setMessage} />
            )}
            {activeTab === "security" && (
              <SecuritySettings onMessage={setMessage} />
            )}
            {activeTab === "notifications" && (
              <NotificationsSettings onMessage={setMessage} />
            )}
            {activeTab === "interface" && (
              <InterfaceSettings onMessage={setMessage} />
            )}
            {activeTab === "sessions" && (
              <SessionsSettings onMessage={setMessage} />
            )}
            {activeTab === "danger" && (
              <DangerZoneSettings onMessage={setMessage} />
            )}
            {activeTab === "ustadh" && (
              <UstadhSettings onMessage={setMessage} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Profile Settings Component
function ProfileSettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    phone: "",
    country: "",
    timezone: "Africa/Nairobi",
    quranLevel: "beginner",
    portrait: "/portraits/pattern-6.png",
  });
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }

      onMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      onMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
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
        {/* Profile Picture Selector */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              width={80}
              height={80}
              src={formData.portrait}
              alt="Profile"
              className="size-20 rounded-full object-cover border-2 border-border-strong"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-primary text-text-inverse rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
              title="Change profile picture"
              onClick={() => {
                const currentIndex = portraitOptions.indexOf(formData.portrait);
                const nextIndex = (currentIndex + 1) % portraitOptions.length;
                handlePortraitSelect(portraitOptions[nextIndex]);
              }}
            >
              <FontAwesomeIcon icon={faCog} className="size-3" />
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

        {/* Portrait Options Grid */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Choose Avatar
          </label>
          <div className="grid grid-cols-5 gap-3">
            {portraitOptions.map((portrait) => (
              <button
                key={portrait}
                type="button"
                onClick={() => handlePortraitSelect(portrait)}
                className={`relative size-12 rounded-full overflow-hidden border-2 transition-all ${
                  formData.portrait === portrait
                    ? "border-primary scale-110"
                    : "border-border-strong hover:border-primary/50"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-card text-text-secondary cursor-not-allowed opacity-60 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Africa/Nairobi">Africa/Nairobi</option>
              <option value="Africa/Cairo">Africa/Cairo</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New York</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Quran Level
            </label>
            <select
              name="quranLevel"
              value={formData.quranLevel}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSave} className="size-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

// Security Settings Component
function SecuritySettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
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

      onMessage({ type: "success", text: "Password changed successfully" });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      onMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to change password",
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

        {/* Change Password */}
        <div className="mb-8 p-6 rounded-lg border border-border-strong bg-bg-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* 2FA */}
        <div className="p-6 rounded-lg border border-border-strong bg-bg-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="size-5" />
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Add an extra layer of security to your account.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-text-primary">2FA Status:</span>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm ${twoFAEnabled ? "text-success" : "text-danger"}`}
              >
                {twoFAEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  twoFAEnabled
                    ? "bg-danger hover:bg-danger/90 text-text-inverse"
                    : "bg-primary hover:bg-primary/90 text-text-inverse"
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

// Notifications Settings Component
function NotificationsSettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    studyReminders: true,
    reminderTime: "09:00",
  });
  const [loading, setLoading] = useState(false);

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

      onMessage({ type: "success", text: "Notification preferences saved" });
    } catch (error) {
      onMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to save preferences",
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

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="p-6 rounded-lg border border-border-strong bg-bg-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-text-primary">
              Email Notifications
            </h3>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                preferences.emailNotifications ? "bg-primary" : "bg-text-muted"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  preferences.emailNotifications
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-text-secondary">
            Receive email updates about your courses and messages
          </p>
        </div>

        {/* Study Reminders */}
        <div className="p-6 rounded-lg border border-border-strong bg-bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Daily Study Reminders
            </h3>
            <button
              onClick={() => handleToggle("studyReminders")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                preferences.studyReminders ? "bg-primary" : "bg-text-muted"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  preferences.studyReminders ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {preferences.studyReminders && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={handleTimeChange}
                className="px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

// Interface Settings Component
function InterfaceSettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [preferences, setPreferences] = useState({
    language: "en",
    quranFont: "default",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
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

      onMessage({ type: "success", text: "Interface settings saved" });
    } catch (error) {
      onMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to save settings",
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
        {/* Theme Switcher */}
        <div className="p-6 rounded-lg border border-border-strong bg-bg-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faPalette} className="size-5" />
            Theme
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Choose your preferred color scheme
          </p>
          <div className="flex flex-wrap gap-3">
            <ThemeSelector />
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Language
          </label>
          <select
            name="language"
            value={preferences.language}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="fr">Français (French)</option>
            <option value="es">Español (Spanish)</option>
          </select>
          <p className="text-xs text-text-secondary mt-1">
            Select your preferred interface language
          </p>
        </div>

        {/* Quran Font */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Quran Font
          </label>
          <select
            name="quranFont"
            value={preferences.quranFont}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="default">Default</option>
            <option value="uthmani">Uthmani</option>
            <option value="madina">Madina</option>
          </select>
          <p className="text-xs text-text-secondary mt-1">
            Choose your preferred Quran font style
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

// Sessions Settings Component
function SessionsSettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
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
        onMessage({ type: "success", text: "Session logged out" });
      }
    } catch {
      onMessage({ type: "error", text: "Failed to logout session" });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Active Sessions
      </h2>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-border-strong bg-bg-card"
            >
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
        <p className="text-text-secondary">No active sessions found</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-6 rounded-lg border border-border-strong bg-bg-card flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-text-primary">
                  {session.deviceName}
                </h3>
                <p className="text-sm text-text-secondary">
                  IP: {session.ipAddress}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Last activity:{" "}
                  {new Date(session.lastActivity).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleLogoutSession(session.id)}
                className="px-4 py-2 bg-danger hover:bg-danger/90 text-text-inverse rounded-lg transition-colors text-sm"
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

// Danger Zone Component
function DangerZoneSettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password) {
      onMessage({ type: "error", text: "Password is required" });
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

      onMessage({ type: "success", text: "Account deleted successfully" });
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      onMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to delete account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-danger mb-6">Danger Zone</h2>

      <div className="p-6 rounded-lg border-2 border-danger bg-danger-muted/50">
        <h3 className="text-lg font-semibold text-danger mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-danger mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2 bg-danger hover:bg-danger/90 text-text-inverse rounded-lg transition-colors"
        >
          Delete My Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-primary rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-text-secondary mb-4">
              This action cannot be undone. All your data will be permanently
              deleted.
            </p>
            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-danger mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                }}
                className="flex-1 px-4 py-2 bg-text-muted hover:bg-text-tertiary text-text-primary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-text-inverse rounded-lg transition-colors disabled:opacity-50"
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

function UstadhSettings({
  onMessage,
}: {
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/ustadh/settings")
      .then((r) => r.json())
      .then((data) => {
        setBio(data.bio ?? "");
        setQualifications(data.qualifications ?? "");
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
        body: JSON.stringify({ bio, qualifications }),
      });
      if (res.ok) {
        onMessage({
          type: "success",
          text: "Ustadh profile updated successfully.",
        });
      } else {
        const data = await res.json();
        onMessage({ type: "error", text: data.error ?? "Failed to update." });
      }
    } catch {
      onMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Ustadh Profile
      </h2>

      <div className="mb-6 p-4 rounded-lg border border-border-strong bg-bg-card">
        <p className="text-sm text-text-secondary mb-1">Approval Status</p>
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
            isApproved
              ? "bg-success-muted text-success"
              : "bg-warning-muted text-warning"
          }`}
        >
          <span
            className={`size-2 rounded-full ${isApproved ? "bg-success" : "bg-warning"}`}
          />
          {isApproved ? "Approved" : "Pending Review"}
        </span>
      </div>

      {!loaded ? (
        <div className="space-y-5">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
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
              maxLength={300}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-text-muted text-right mt-1">
              {bio.length}/300
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Qualifications
            </label>
            <textarea
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border-strong bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="List your qualifications, certifications, etc."
            />
            <p className="text-xs text-text-muted text-right mt-1">
              {qualifications.length}/500
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} className="size-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
