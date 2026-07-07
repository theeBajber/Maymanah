"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,
  faSpinner,
  faUser,
  faMessage,
  faLink,
  faBug,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ui/toast";

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
  reporterRole: string;
  initialUserId: string;
  initialUserName: string;
}

export function ReportForm({
  reporterName,
  reporterEmail,
  reporterRole,
  initialUserId,
  initialUserName,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>(
    initialUserId ? "user" : "user",
  );
  const [reportedUser, setReportedUser] = useState(initialUserName);
  const [reason, setReason] = useState<UserReason>("inappropriate");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const body: Record<string, string> = {
        reportType,
        description: description.trim(),
        reporterName,
        reporterEmail,
        reporterRole,
      };

      if (reportType === "user") {
        body.reportedUser = reportedUser.trim();
        body.reason = reason;
      }

      if (url.trim()) body.url = url.trim();

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
      setUrl("");
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
  const selectBase =
    "w-full bg-transparent text-text-primary outline-none text-sm cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={`${labelBase} block mb-2`}>Report Type</label>
        <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <FontAwesomeIcon icon={faFlag} className="size-4 text-text-muted shrink-0" />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className={selectBase}
            disabled={loading || !!initialUserId}
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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

          <div>
            <label className={`${labelBase} block mb-2`}>Reason</label>
            <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
              <FontAwesomeIcon icon={faBug} className="size-4 text-text-muted shrink-0" />
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as UserReason)}
                className={selectBase}
                disabled={loading}
              >
                {USER_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {reportType === "technical" && (
        <div>
          <label htmlFor="url" className={`${labelBase} block mb-2`}>Relevant URL</label>
          <div className={`${inputBase} h-12 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            <FontAwesomeIcon icon={faLink} className="size-4 text-text-muted shrink-0" />
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://maymanah.com/page-with-issue"
              className={inputEl}
              disabled={loading}
            />
          </div>
        </div>
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
        className="w-full h-12 bg-danger text-text-inverse rounded-xl font-bold shadow-lg shadow-danger/20 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
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
