"use client";

import { faArrowRight, faSpinner, faChalkboardUser, faGraduationCap, faGlobe, faPhone, faClock, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<"welcome" | "form">("welcome");
  const [saving, setSaving] = useState(false);

  const isTeacher = session?.user?.role === "TEACHER";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [quranLevel, setQuranLevel] = useState("beginner");

  const timezoneOptions = useMemo(() => [
    { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
    { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
    { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
    { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
    { value: "Africa/Casablanca", label: "Africa/Casablanca" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
    { value: "Asia/Riyadh", label: "Asia/Riyadh (AST)" },
    { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala Lumpur (MYT)" },
    { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (TRT)" },
    { value: "America/New_York", label: "America/New York (EST)" },
    { value: "America/Chicago", label: "America/Chicago (CST)" },
    { value: "America/Denver", label: "America/Denver (MST)" },
    { value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
    { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" },
  ], []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon icon={faSpinner} className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="max-w-lg w-full bg-bg-card rounded-xl border border-border shadow-2xl p-8 md:p-14 text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Image
            className="h-14 w-auto"
            src="/logo.png"
            height={339}
            width={439}
            alt="Maymanah"
          />
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
            Welcome to Maymanah!
          </h1>
          <p className="text-text-secondary max-w-sm">
            {isTeacher
              ? "We're excited to have you as an instructor. Before you start, tell us a bit about yourself and your credentials."
              : "Let's set up your profile so we can personalize your learning journey."}
          </p>
        </div>

        <div className="space-y-3 mb-8 text-left">
          {isTeacher ? (
            <>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary">
                <FontAwesomeIcon icon={faChalkboardUser} className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Teaching Bio</p>
                  <p className="text-xs text-text-secondary">Tell students about your teaching experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary">
                <FontAwesomeIcon icon={faGraduationCap} className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Certifications & Qualifications</p>
                  <p className="text-xs text-text-secondary">List your ijaraz, degrees, and certifications</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary">
                <FontAwesomeIcon icon={faGlobe} className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Location & Timezone</p>
                  <p className="text-xs text-text-secondary">So students know your availability</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary">
                <FontAwesomeIcon icon={faBookOpen} className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Your Quran Level</p>
                  <p className="text-xs text-text-secondary">So we can recommend the right courses</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary">
                <FontAwesomeIcon icon={faGlobe} className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Location & Timezone</p>
                  <p className="text-xs text-text-secondary">For scheduling and community</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary">
                <FontAwesomeIcon icon={faClock} className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Study Preferences</p>
                  <p className="text-xs text-text-secondary">Set your reminders and notifications later</p>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setStep("form")}
          className="w-full h-14 bg-primary text-text-inverse rounded-xl font-black text-lg tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          {isTeacher ? "Set Up Your Profile" : "Get Started"}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="size-4 group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const profileRes = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: gender || undefined,
          bio,
          phone,
          country,
          timezone,
          quranLevel: isTeacher ? undefined : quranLevel,
        }),
      });

      if (!profileRes.ok) {
        throw new Error("Failed to save profile");
      }

      if (isTeacher && qualifications) {
        const ustadhRes = await fetch("/api/ustadh/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio,
            qualifications,
          }),
        });

        if (!ustadhRes.ok) {
          const err = await ustadhRes.json().catch(() => ({}));
          if (err.error !== "Forbidden") {
            throw new Error(err.error || "Failed to save teacher profile");
          }
        }
      }

      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-bg-card rounded-xl border border-border shadow-2xl p-8 md:p-14">
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image
          className="h-10 w-auto"
          src="/logo.png"
          height={339}
          width={439}
          alt="Maymanah"
        />
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider">
          {isTeacher ? "Instructor Profile" : "Your Profile"}
        </h1>
        <p className="text-text-secondary text-sm">
          {isTeacher
            ? "Tell students about yourself and your credentials"
            : "Help us personalize your learning experience"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isTeacher && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-xs text-primary font-bold flex items-center gap-2">
              <FontAwesomeIcon icon={faGraduationCap} className="size-4" />
              Your application will be reviewed by our team after submission
            </p>
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold px-1 block mb-2">
            Gender
          </label>
          <div className="flex gap-3 px-1">
            {["male", "female"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  gender === g
                    ? "bg-primary text-text-inverse shadow-lg shadow-primary/20"
                    : "border border-primary-dark/80 text-text-secondary hover:border-primary"
                }`}
              >
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold px-1 block mb-2">
            Bio {isTeacher ? "& Teaching Experience" : ""}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={
              isTeacher
                ? "Share your teaching experience, approach, and what inspires you..."
                : "Tell us a bit about yourself and your Quran journey..."
            }
            rows={4}
            maxLength={300}
            className="w-full px-4 py-3 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent resize-none"
          />
          <p className="text-[10px] text-text-secondary mt-1 px-1">{bio.length}/300</p>
        </div>

        {isTeacher && (
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold px-1 block mb-2">
              Qualifications & Certifications
            </label>
            <textarea
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="List your ijaraz, degrees, certifications, and other qualifications..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent resize-none"
            />
            <p className="text-[10px] text-text-secondary mt-1 px-1">{qualifications.length}/500</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold px-1 block mb-2">
              <FontAwesomeIcon icon={faPhone} className="size-3 mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 712 345 678"
              className="w-full px-4 h-12 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold px-1 block mb-2">
              <FontAwesomeIcon icon={faGlobe} className="size-3 mr-1" />
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Kenya"
              className="w-full px-4 h-12 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Dropdown
              label="Timezone"
              options={timezoneOptions}
              value={timezone}
              onChange={setTimezone}
            />
          </div>

          {!isTeacher && (
            <div>
              <Dropdown
                label="Quran Level"
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                ]}
                value={quranLevel}
                onChange={setQuranLevel}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-14 bg-primary text-text-inverse rounded-xl font-black text-lg tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {isTeacher ? "Submit for Review" : "Complete Setup"}
              <FontAwesomeIcon icon={faArrowRight} className="size-4" />
            </>
          )}
        </button>

        <p className="text-center">
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/user/update-profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              }).catch(() => {});
              router.push("/dashboard");
            }}
            className="text-[10px] uppercase tracking-widest text-primary font-bold hover:text-primary-dark transition-colors"
          >
            Skip for now
          </button>
        </p>
      </form>
    </div>
  );
}
