"use client";

import { ChartColumn, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  KES_PRESETS,
  USD_PRESETS,
  type DonationCurrency,
} from "@/lib/donations";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { amiri, elMessiri } from "@/components/ui/fonts";
import { GirihField } from "@/components/ui/girih";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented";

export default function Donate() {
  return (
    <main className="flex w-full flex-col items-center gap-12 pb-24">
      <PageHeader
        arabic="صَدَقَةٌ جَارِيَةٌ"
        title={
          <>
            Keep the platform free,
            <br />
            support our servers
          </>
        }
        lede="Maymanah runs almost entirely on free tiers and volunteer time. Donations go toward scaling infrastructure as the community grows."
      />
      <Suspense fallback={<DonationSkeleton />}>
        <DonatePageContent />
      </Suspense>
    </main>
  );
}

function DonationSkeleton() {
  return (
    <div className="grid w-full max-w-6xl animate-pulse grid-cols-1 gap-5 px-4 sm:px-6 md:px-8 lg:grid-cols-2">
      <div className="glass-still h-96 rounded-2xl" />
      <div className="glass-still h-96 rounded-2xl" />
    </div>
  );
}

function impactLine(amount: number, currency: DonationCurrency) {
  const usd = currency === "USD" ? amount : amount / 130;
  if (usd <= 0) return "Every amount helps keep the platform free.";
  if (usd < 10) return "Covers nearly a day of the full platform.";
  if (usd < 25) return "Covers about 2 days of the full platform.";
  if (usd < 80) return "Covers about a week of the full platform.";
  return "Covers the platform for more than a week.";
}

function DonatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currency, setCurrency] = useState<DonationCurrency>("USD");
  const [amount, setAmount] = useState<number>(USD_PRESETS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState<"stripe" | "paypal" | "mpesa" | null>(
    null,
  );
  const [showMpesaPhone, setShowMpesaPhone] = useState(false);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (success) {
      toast({
        variant: "success",
        title: "Thank you for your donation!",
        description:
          "Your payment was successful. May Allah accept your sadaqah and reward you abundantly.",
        duration: 7000,
      });
      router.replace("/donate", { scroll: false });
    }
  }, [success, toast, router]);

  useEffect(() => {
    if (canceled && !success) {
      toast({
        variant: "warning",
        title: "Payment canceled",
        description:
          "No charge was made. You can try again whenever you're ready.",
      });
      router.replace("/donate", { scroll: false });
    }
  }, [canceled, success, toast, router]);

  const presets = currency === "USD" ? USD_PRESETS : KES_PRESETS;
  const currencySymbol = currency === "USD" ? "$" : "KES ";

  function stopMpesaPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function pollMpesaStatus(reference: string) {
    stopMpesaPolling();

    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;

      try {
        const res = await fetch(
          `/api/donations/status?reference=${encodeURIComponent(reference)}`,
        );
        const data = await res.json();

        if (data.status === "COMPLETED") {
          stopMpesaPolling();
          toast({
            variant: "success",
            title: "M-Pesa payment successful",
            description:
              "Thank you for your donation. May Allah accept your sadaqah.",
            duration: 7000,
          });
          return;
        }

        if (data.status === "FAILED") {
          stopMpesaPolling();
          toast({
            variant: "error",
            title: "M-Pesa payment failed",
            description:
              "The payment was not completed. Please try again or use another method.",
          });
          return;
        }

        if (attempts >= 36) {
          stopMpesaPolling();
          toast({
            variant: "warning",
            title: "Payment still pending",
            description:
              "We have not received confirmation yet. Check your M-Pesa messages or try again.",
            duration: 7000,
          });
        }
      } catch {
        if (attempts >= 36) {
          stopMpesaPolling();
        }
      }
    }, 5000);
  }

  function handleCurrencyChange(next: DonationCurrency) {
    setCurrency(next);
    setIsCustom(false);
    setAmount(next === "USD" ? USD_PRESETS[0] : KES_PRESETS[0]);
    stopMpesaPolling();
  }

  async function handleStripeDonate() {
    stopMpesaPolling();
    setLoading("stripe");

    try {
      const res = await fetch("/api/donations/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, anonymous }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "error",
          title: "Card payment failed",
          description:
            data.error || "Could not start card payment. Please try again.",
        });
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          variant: "error",
          title: "Card payment failed",
          description: "Could not start card payment. Please try again.",
        });
      }
    } catch {
      toast({
        variant: "error",
        title: "Network error",
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(null);
    }
  }

  function handlePayPalDonate() {
    toast({
      variant: "info",
      title: "PayPal coming soon",
      description: "Please use Card or M-Pesa for now.",
    });
  }

  async function handleMpesaDonate() {
    if (!phone.trim()) {
      setShowMpesaPhone(true);
      toast({
        variant: "warning",
        title: "Phone number required",
        description: "Enter your M-Pesa phone number to continue.",
      });
      return;
    }

    stopMpesaPolling();
    setLoading("mpesa");

    try {
      const res = await fetch("/api/donations/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, phone, anonymous }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "error",
          title: "M-Pesa payment failed",
          description: data.error || "Please try again.",
        });
        return;
      }

      toast({
        variant: "info",
        title: "Check your phone",
        description:
          "An M-Pesa prompt has been sent. Enter your PIN to complete the donation.",
        duration: 7000,
      });

      if (data.checkoutRequestId) {
        pollMpesaStatus(data.checkoutRequestId);
      }
    } catch {
      toast({
        variant: "error",
        title: "Network error",
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-5 px-4 sm:px-6 md:px-8 lg:grid-cols-2">
      <TransparencyPanel />

      {/* the giving panel — the page's one lantern */}
      <div className="glass-lantern relative flex flex-col gap-6 overflow-hidden rounded-3xl p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20"
        >
          <GirihField
            className="absolute inset-0"
            opacity={0.08}
            tile={56}
            fade="bottom"
          />
        </div>

        <div className="relative flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            Currency
          </p>
          <SegmentedControl
            label="Currency"
            value={currency}
            onChange={handleCurrencyChange}
            options={[
              { value: "USD", label: "USD" },
              { value: "KES", label: "KES" },
            ]}
          />
        </div>

        <div className="relative flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            Choose an amount
          </p>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => {
              const selected = amount === preset && !isCustom;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setIsCustom(false);
                  }}
                  className={`flex items-center justify-center rounded-xl border py-4 text-xl font-semibold transition-all duration-200 active:scale-[0.985] ${
                    selected
                      ? "border-brass/60 bg-brass/10 text-brass shadow-glow-brass"
                      : "border-ivory/10 bg-ivory/[0.03] text-ivory hover:border-brass/30"
                  }`}
                >
                  {currency === "USD"
                    ? `$${preset}`
                    : `KES ${preset.toLocaleString()}`}
                </button>
              );
            })}
            <div
              className={`relative rounded-xl border transition-all duration-200 ${
                isCustom
                  ? "border-brass/60 bg-brass/10 shadow-glow-brass"
                  : "border-ivory/10 bg-ivory/[0.03] hover:border-brass/30"
              }`}
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold ${
                  isCustom ? "text-brass" : "text-sage/50"
                }`}
              >
                {currencySymbol}
              </span>
              <input
                className="h-full w-full rounded-xl bg-transparent py-4 pl-14 pr-4 text-center text-xl font-semibold text-ivory placeholder:text-sage/40 focus:outline-none"
                placeholder="Custom"
                aria-label="Custom amount"
                type="text"
                inputMode="numeric"
                value={
                  isCustom ? (amount === 0 ? "" : amount.toLocaleString()) : ""
                }
                onChange={(e) => {
                  const val =
                    currency === "KES"
                      ? e.target.value.replace(/[^0-9]/g, "")
                      : e.target.value.replace(/[^0-9.]/g, "");
                  setIsCustom(true);
                  setAmount(val ? Number(val) : 0);
                }}
                onFocus={() => {
                  setIsCustom(true);
                  setAmount(0);
                }}
              />
            </div>
          </div>
          <p className="text-[13px] text-sage" aria-live="polite">
            {impactLine(amount, currency)}
          </p>
        </div>

        {(showMpesaPhone || phone) && (
          <div className="relative flex flex-col gap-2">
            <label
              htmlFor="mpesa-phone"
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass"
            >
              M-Pesa phone number
            </label>
            <div className="flex h-12 items-center rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-4 transition-all duration-300 focus-within:border-brass/60 focus-within:shadow-[0_0_0_3px_rgba(198,161,91,0.12)]">
              <input
                id="mpesa-phone"
                type="tel"
                inputMode="tel"
                placeholder="2547XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setShowMpesaPhone(true);
                }}
                className="w-full bg-transparent text-[15px] text-ivory placeholder:text-sage/40 focus:outline-none"
              />
            </div>
            <p className="text-[13px] text-sage/70">
              Required for M-Pesa. Use Safaricom format: 2547XXXXXXXX
            </p>
          </div>
        )}

        <label className="relative flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="mt-1 size-4 accent-(--brass)"
          />
          <span className="text-sm leading-relaxed text-sage">
            Donate anonymously
            {session?.user && !anonymous && (
              <span className="mt-1 block text-[13px] text-sage/60">
                Your donation will be linked to your account (
                {session.user.email}).
              </span>
            )}
          </span>
        </label>

        <div className="relative flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            Payment method
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={loading !== null}
              onClick={handleStripeDonate}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-brass font-semibold text-layl-deep transition-all duration-300 hover:bg-[#D2AF6B] hover:shadow-glow-brass active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
            >
              <CreditCard className="size-4" />
              {loading === "stripe" ? "Redirecting" : "Card"}
            </button>
            <button
              type="button"
              disabled={loading !== null}
              onClick={handlePayPalDonate}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-ivory/15 font-semibold italic text-ivory transition-colors hover:bg-ivory/5 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
            >
              PayPal
            </button>
          </div>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => {
              setShowMpesaPhone(true);
              handleMpesaDonate();
            }}
            className="flex h-12 w-full items-center justify-center rounded-[10px] bg-[#0C8A1B] transition-colors hover:bg-[#0A7517] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
          >
            <Image
              width={597}
              height={418}
              alt="Donate with M-Pesa"
              className="h-16 w-auto"
              src="/mpesa.png"
            />
            {loading === "mpesa" && (
              <span className="sr-only">Sending M-Pesa prompt</span>
            )}
          </button>
        </div>

        <p className="relative text-center text-[13px] text-sage/70">
          Secure, encrypted transaction. Tax-deductible in many regions.
        </p>
      </div>
    </div>
  );
}

function TransparencyPanel() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass-still flex flex-col gap-6 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <ChartColumn className="size-4.5 text-brass" />
          <h2
            className={`${elMessiri.className} text-xl font-semibold text-ivory`}
          >
            Transparency &amp; monthly costs
          </h2>
        </div>
        <div className="flex flex-col">
          <CostRow
            title="Hosting"
            subtitle="Keeping the platform online"
            amount="$40/mo"
          />
          <CostRow
            title="Database"
            subtitle="Storing accounts, content, and progress"
            amount="$50/mo"
          />
          <CostRow
            title="Video Streaming API"
            subtitle="Real-time Quran class streaming"
            amount="$200/mo"
          />
          <CostRow
            title="AI Features"
            subtitle="AI tutor (coming soon)"
            amount="$90/mo"
            last
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-ivory/8 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage">
              Monthly goal progress
            </span>
            <span className="text-sm font-semibold text-brass">40%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ivory/10">
            <div className="h-full w-[40%] rounded-full bg-linear-to-r from-[#A9854B] to-brass" />
          </div>
          <p className="text-sm text-sage">$152 of $380 raised this month.</p>
        </div>
      </div>

      <div className="glass-still flex flex-col gap-4 rounded-2xl p-6 md:p-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
          Sadaqah Jariyah
        </h3>
        <p
          lang="ar"
          dir="rtl"
          className={`${amiri.className} text-xl leading-loose text-ivory/90`}
        >
          إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ
        </p>
        <p className="text-sm leading-relaxed text-sage">
          &ldquo;When a person dies, his deeds come to an end except for three:
          ongoing charity (Sadaqah Jariyah), knowledge which is beneficial, or a
          righteous child who prays for him.&rdquo;
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage/70">
          Sahih Muslim
        </p>
      </div>
    </div>
  );
}

function CostRow({
  title,
  subtitle,
  amount,
  last = false,
}: {
  title: string;
  subtitle: string;
  amount: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        last ? "" : "border-b border-ivory/8"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-medium text-ivory">{title}</p>
        <p className="text-[13px] text-sage/80">{subtitle}</p>
      </div>
      <p className="font-semibold text-brass">{amount}</p>
    </div>
  );
}
