"use client";

import { faWebAwesome } from "@fortawesome/free-brands-svg-icons/faWebAwesome";
import {
  faChartColumn,
  faCreditCard,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export default function Donate() {
  return (
    <main className="flex flex-col items-center pb-16 p-4 sm:p-6 md:p-8">
      <Hero />
      <Suspense fallback={<DonationSkeleton />}>
        <DonatePageContent />
      </Suspense>
    </main>
  );
}

function Hero() {
  return (
    <section className="flex flex-col gap-4 w-full max-w-7xl text-center md:text-left py-4 pt-16">
      <div className="flex items-center justify-center gap-2 w-50 h-6.5 text-primary-dark rounded-full mx-auto md:mx-0 font-semibold text-xs uppercase tracking-wider border border-primary/20">
        <FontAwesomeIcon icon={faHeart} />
        Support the Mission
      </div>
      <h1 className="text-5xl font-black leading-tight tracking-[-0.033em]">
        Keep the platform free,
        <br />
        support our servers
      </h1>
      <p className="text-text-secondary text-lg font-normal leading-relaxed max-w-2xl">
        Maymanah runs almost entirely on free tiers and volunteer time. Donations
        go toward scaling infrastructure as the community grows.
      </p>
    </section>
  );
}

function DonationSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full animate-pulse">
      <div className="h-96 bg-bg-card rounded-xl border border-border" />
      <div className="h-96 bg-bg-card rounded-xl border border-border" />
    </div>
  );
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
        description: "No charge was made. You can try again whenever you're ready.",
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full">
      <TransparencyPanel />

      <div className="bg-bg-card rounded-xl border border-border p-8 shadow-md">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
              Currency
            </p>
            <div className="flex p-1 bg-bg-primary/20 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                  currency === "USD"
                    ? "bg-primary text-text-inverse shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                USD
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange("KES")}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                  currency === "KES"
                    ? "bg-primary text-text-inverse shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                KES
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 text-center">
              Choose Amount
            </p>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setIsCustom(false);
                  }}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                    amount === preset && !isCustom
                      ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10 scale-[1.03]"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="text-2xl font-black">
                    {currency === "USD"
                      ? `$${preset}`
                      : `KES ${preset.toLocaleString()}`}
                  </span>
                </button>
              ))}

              <div
                className={`relative rounded-xl border-2 transition-all duration-200 ${
                  isCustom
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span
                    className={`font-black text-sm transition-colors duration-200 ${
                      isCustom ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {currencySymbol}
                  </span>
                </div>
                <input
                  className="w-full h-full py-4 pl-14 pr-4 rounded-xl bg-transparent focus:outline-none text-2xl font-black placeholder:text-text-muted text-center"
                  placeholder="Custom"
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
          </div>

          {(showMpesaPhone || phone) && (
            <div>
              <label
                htmlFor="mpesa-phone"
                className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block"
              >
                M-Pesa Phone Number
              </label>
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
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg-primary/20 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-2">
                Required for M-Pesa. Use Safaricom format: 2547XXXXXXXX
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-1 size-4 accent-primary"
            />
            <span className="text-sm text-text-secondary leading-relaxed">
              Donate anonymously
              {session?.user && !anonymous && (
                <span className="block text-xs text-text-muted mt-1">
                  Your donation will be linked to your account (
                  {session.user.email}).
                </span>
              )}
            </span>
          </label>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest text-center">
              Choose Payment Method
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading !== null}
                onClick={handleStripeDonate}
                className="flex-1 flex items-center gap-2 justify-center h-12 rounded-lg bg-text-primary/90 text-text-inverse hover:bg-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span className="font-bold">
                  {loading === "stripe" ? "Redirecting..." : "Card"}
                </span>
              </button>
              <button
                type="button"
                disabled={loading !== null}
                onClick={handlePayPalDonate}
                className="flex-1 flex items-center justify-center h-12 rounded-lg bg-[#3b7bbf] text-text-inverse hover:bg-[#2d629a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-black italic">PayPal</span>
              </button>
            </div>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => {
                setShowMpesaPhone(true);
                handleMpesaDonate();
              }}
              className="w-full flex items-center justify-center h-12 rounded-lg border border-white/10 hover:bg-[#0eb520]/85 bg-[#0eb520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                width={597}
                height={418}
                alt="M-Pesa"
                className="h-18 w-auto"
                src="/mpesa.png"
              />
              {loading === "mpesa" && (
                <span className="sr-only">Sending M-Pesa prompt...</span>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-text-secondary">
            Secure, encrypted transaction. Tax-deductible in many regions.
          </p>
        </div>
      </div>
    </div>
  );
}

function TransparencyPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-bg-card rounded-xl border border-border p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-6">
          <FontAwesomeIcon
            icon={faChartColumn}
            className="size-4! text-primary"
          />
          <h2 className="text-xl font-bold leading-tight">
            Transparency &amp; Monthly Costs
          </h2>
        </div>
        <div className="space-y-4">
          <CostRow
            title="Server Hosting"
            subtitle="High-availability cloud infrastructure"
            amount="$450/mo"
          />
          <CostRow
            title="Video Streaming API"
            subtitle="Real-time classroom connectivity"
            amount="$1,200/mo"
          />
          <CostRow
            title="Platform Maintenance"
            subtitle="Security patches and updates"
            amount="$300/mo"
          />
          <CostRow
            title="Administrative Costs"
            subtitle="Support and coordination"
            amount="$150/mo"
            last
          />
        </div>
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm uppercase tracking-wide">
              Monthly Goal Progress
            </span>
            <span className="text-primary font-bold px-2 py-1 rounded text-sm">
              65%
            </span>
          </div>
          <div className="h-3 w-full bg-bg-primary/30 rounded-full overflow-hidden mb-2">
            <div className="h-full w-[65%] bg-linear-to-r from-primary to-primary-light" />
          </div>
          <p className="text-text-secondary text-sm font-medium italic">
            &quot;$1,365 of $2,100 raised this month. Almost there!&quot;
          </p>
        </div>
      </div>

      <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <h3 className="text-primary font-bold text-lg mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faWebAwesome} />
          Sadaqah Jariyah
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed italic">
          &quot;When a person dies, his deeds come to an end except for three:
          Ongoing charity (Sadaqah Jariyah), knowledge which is beneficial, or
          a righteous child who prays for him.&quot; (Muslim)
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
      className={`flex justify-between items-center py-2 ${
        last ? "" : "border-b border-primary/15"
      }`}
    >
      <div className="flex flex-col">
        <p className="font-semibold">{title}</p>
        <p className="text-text-secondary text-xs">{subtitle}</p>
      </div>
      <p className="text-primary font-bold text-lg">{amount}</p>
    </div>
  );
}
