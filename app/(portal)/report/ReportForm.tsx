"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,
  faMessage,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

import { Dropdown } from "@/app/ui/Dropdown";
import { useToast } from "@/app/ui/toast";

type ReportType = "user" | "technical" | "other";
type UserReason =
  | "inappropriate"
  | "harassment"
  | "spam"
  | "fake"
  | "other_reason";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "user", label: "Report a User" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
];

const USER_REASONS: { value: UserReason; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "fake", label: "Fake profile" },
  { value: "other_reason", label: "Other" },
];

interface Props {
  reporterName: string;
  reporterEmail: string;
  initialUserId: string;
  initialUserName: string;
}

export function ReportForm({
  reporterName,
  reporterEmail,
  initialUserId,
  initialUserName,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("user");
  const [reportedUser, setReportedUser] = useState(initialUserName);
  const [reason, setReason] = useState<UserReason>("inappropriate");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const body: Record<string, string> = {
        reportType,
        description: description.trim(),
        reporterName,
        reporterEmail,
      };

      if (reportType === "user") {
        body.reportedUser = reportedUser.trim();
        body.reason = reason;
      }

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.error || "Something went wrong.", variant: "error" });
        return;
      }

      toast({
        title: "Report submitted",
        description: "Our team will review it and take appropriate action.",
        variant: "success",
      });
      setReportedUser(initialUserName);
      setReason("inappropriate");
      setDescription("");
    } catch {
      toast({ title: "Network error. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "flex items-center gap-3 px-4 w-full border border-border focus-within:border-primary rounded-xl bg-bg-primary transition-colors";
  const inputEl =
    "w-full bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm";
  const labelBase =
    "text-[10px] uppercase tracking-widest font-bold text-text-secondary";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Dropdown
        label="Report Type"
        options={REPORT_TYPES}
        value={reportType}
        onChange={setReportType}
        disabled={loading || !!initialUserId}
      />

      {reportType === "user" && (
        <>
          <div>
            <label htmlFor="reportedUser" className={`${labelBase} block mb-2`}>
              User to Report
            </label>
            <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
              <FontAwesomeIcon icon={faUser} className="size-4 text-text-muted shrink-0" />
              <input
                id="reportedUser"
                type="text"
                value={reportedUser}
                onChange={(e) => setReportedUser(e.target.value)}
                placeholder="Enter the user's name, email, or ID"
                required
                className={inputEl}
                disabled={loading}
              />
            </div>
          </div>

          <Dropdown
            label="Reason"
            options={USER_REASONS}
            value={reason}
            onChange={setReason}
            disabled={loading}
          />
        </>
      )}

      <div>
        <label htmlFor="description" className={`${labelBase} block mb-2`}>
          Description
        </label>
        <div className={`${inputBase} p-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <FontAwesomeIcon
            icon={faMessage}
            className="size-4 text-text-muted shrink-0 self-start mt-0.5"
          />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              reportType === "user"
                ? "Describe what happened, including dates or evidence..."
                : "Describe the issue you're experiencing in detail..."
            }
            required
            minLength={10}
            rows={5}
            className={`${inputEl} resize-none min-h-[120px] leading-relaxed`}
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-danger font-bold text-text-inverse shadow-lg shadow-danger/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100"
      >
        {loading ? (
          <FontAwesomeIcon icon={faSpinner} className="size-5 animate-spin" />
        ) : (
          <FontAwesomeIcon icon={faFlag} className="size-4" />
        )}
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
