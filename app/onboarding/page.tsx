"use client";

import {
  faArrowRight,
  faSpinner,
  faCheck,
  faChevronRight,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "expertise", label: "Expertise" },
  { id: "location", label: "Location" },
];

function GenderToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-bg-hover rounded-xl p-1 w-fit">
      <button
        type="button"
        onClick={() => onChange("male")}
        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
          value === "male"
            ? "bg-bg-elevated text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        Male
      </button>
      <button
        type="button"
        onClick={() => onChange("female")}
        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
          value === "female"
            ? "bg-bg-elevated text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        Female
      </button>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [step, setStep] = useState(0);
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
  const [ijazah, setIjazah] = useState("");
  const [qiraah, setQiraah] = useState("");
  const [availableForTeaching, setAvailableForTeaching] = useState(false);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [quranLevel, setQuranLevel] = useState("beginner");

  const timezoneOptions = useMemo(
    () => [
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
    ],
    [],
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon icon={faSpinner} className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return gender !== "";
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
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

      if (!profileRes.ok) throw new Error("Failed to save profile");

      if (isTeacher) {
        const ustadhRes = await fetch("/api/ustadh/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio,
            qualifications,
            ijazah,
            qiraah,
            availableForTeaching,
          }),
        });
        if (!ustadhRes.ok) {
          const err = await ustadhRes.json().catch(() => ({}));
          if (err.error !== "Forbidden") throw new Error(err.error || "Failed to save teacher profile");
        }
      }

      await update();

      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-xl">
        <div className="bg-bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Image className="h-10 w-auto" src="/logo.png" height={339} width={439} alt="Maymanah" />
              <span className="text-2xl font-black uppercase tracking-wider text-primary">Maymanah</span>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-1.5 md:gap-2">
                    <div
                      className={`size-7 md:size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        i < step
                          ? "bg-primary text-text-inverse"
                          : i === step
                            ? "bg-primary text-text-inverse ring-2 ring-primary/30"
                            : "bg-bg-hover text-text-muted"
                      }`}
                    >
                      {i < step ? <FontAwesomeIcon icon={faCheck} className="size-3" /> : i + 1}
                    </div>
                    <span
                      className={`hidden md:block text-[10px] uppercase tracking-widest font-bold ${
                        i <= step ? "text-text-primary" : "text-text-muted"
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`hidden md:block w-16 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="w-full h-1 bg-bg-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="min-h-[320px]">
              {step === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                      Welcome, {session?.user?.name?.split(" ")[0] || "there"}!
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Let&apos;s set up your profile. A few basics to get started.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-3">
                      Gender
                    </label>
                    <GenderToggle value={gender} onChange={setGender} />
                    <p className="text-[11px] text-text-muted mt-2">
                      Used for matching in live 1-on-1 sessions — male teachers with male students, female with female.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-2">
                      Bio <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={
                        isTeacher
                          ? "Share your teaching experience, approach, and what inspires you..."
                          : "Tell us a bit about yourself and your Quran journey..."
                      }
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent resize-none text-sm"
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-text-muted">{bio.length}/500</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {isTeacher ? (
                    <>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                          Your Teaching Profile
                        </h2>
                        <p className="text-sm text-text-secondary">
                          Help students and admins understand your expertise.
                        </p>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold block mb-2">
                          Qualifications <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          value={qualifications}
                          onChange={(e) => setQualifications(e.target.value)}
                          placeholder="List your degrees, certifications, and teaching credentials..."
                          rows={3}
                          maxLength={1000}
                          className="w-full px-4 py-3 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent resize-none text-sm"
                        />
                        <div className="flex justify-end">
                          <span className="text-[10px] text-text-muted">{qualifications.length}/1000</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold block mb-2">
                          Ijazah <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          value={ijazah}
                          onChange={(e) => setIjazah(e.target.value)}
                          placeholder="Provide details of your Ijazah — who issued it, what it covers, and when..."
                          rows={3}
                          maxLength={1000}
                          className="w-full px-4 py-3 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent resize-none text-sm"
                        />
                        <div className="flex justify-end">
                          <span className="text-[10px] text-text-muted">{ijazah.length}/1000</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold block mb-2">
                          Qiraah Specialization <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={qiraah}
                          onChange={(e) => setQiraah(e.target.value)}
                          placeholder="e.g. Hafs, Warsh, Qalun, etc."
                          className="w-full px-4 h-12 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-bg-hover">
                        <div>
                          <p className="font-semibold text-sm text-text-primary">Available for Teaching</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Let students know you&apos;re accepting new mentorship requests
                          </p>
                        </div>
                        <Toggle value={availableForTeaching} onChange={setAvailableForTeaching} />
                      </div>

                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-[11px] text-primary font-medium flex items-center gap-2">
                          <FontAwesomeIcon icon={faGraduationCap} className="size-3" />
                          Your application will be reviewed by our team after submission.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                          Your Learning Journey
                        </h2>
                        <p className="text-sm text-text-secondary">
                          Help us recommend the right courses for your level.
                        </p>
                      </div>

                      <div>
                        <Dropdown
                          label="Current Quran Level"
                          options={[
                            { value: "beginner", label: "Beginner — New to Quran study" },
                            { value: "intermediate", label: "Intermediate — Can read with some fluency" },
                            { value: "advanced", label: "Advanced — Strong recitation & understanding" },
                          ]}
                          value={quranLevel}
                          onChange={setQuranLevel}
                        />
                        <p className="text-[11px] text-text-muted mt-2">
                          Used to suggest suitable courses and match you with the right teacher.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                      Almost there!
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Your location helps us connect you with the right people and schedule sessions in your timezone.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-2">
                      Phone <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full px-4 h-12 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-2">
                        Country <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Kenya"
                        className="w-full px-4 h-12 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent"
                      />
                    </div>
                    <div>
                      <Dropdown label="Timezone" options={timezoneOptions} value={timezone} onChange={setTimezone} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => step > 0 && setStep((s) => s - 1)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  step === 0
                    ? "opacity-0 pointer-events-none"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                {step < STEPS.length - 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-[10px] uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors font-bold"
                    >
                      Skip & Finish
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
                      disabled={!canProceed()}
                      className="px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Continue
                      <FontAwesomeIcon icon={faChevronRight} className="size-3" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-8 py-2.5 bg-primary text-text-inverse rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <FontAwesomeIcon icon={faArrowRight} className="size-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
