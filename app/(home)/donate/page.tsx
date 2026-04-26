"use client";
import { faWebAwesome } from "@fortawesome/free-brands-svg-icons/faWebAwesome";
import {
  faChartColumn,
  faCreditCard,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

export default function Donate() {
  return (
    <main className="flex flex-col items-center pb-16 p-4 sm:p-6 md:p-8">
      <Hero />
      <Bento />
    </main>
  );
}
function Hero() {
  return (
    <section className="flex flex-col gap-4 w-full max-w-7xl text-center md:text-left py-4 pt-16">
      <div className="flex items-center justify-center gap-2 w-50 h-6.5  text-primary-dark rounded-full mx-auto md:mx-0 font-semibold text-xs uppercase tracking-wider border border-primary/20">
        <FontAwesomeIcon icon={faHeart} />
        Support the Mission
      </div>
      <h1 className="text-5xl font-black leading-tight tracking-[-0.033em]">
        Keep the platform free,
        <br />
        support our servers
      </h1>
      <p className="text-text-secondary text-lg font-normal leading-relaxed max-w-2xl">
        Your contribution helps us connect thousands of students with the words
        of Allah. Rahiq remains 100% free for students and teachers thanks to
        donors like you.
      </p>
    </section>
  );
}

function Bento() {
  const [monthly, setMonthly] = useState(true);
  const [amount, setAmount] = useState(5);
  const [isCustom, setIsCustom] = useState(false);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
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
            <div className="flex justify-between items-center py-2 border-b border-primary/15">
              <div className="flex flex-col">
                <p className="font-semibold">Server Hosting</p>
                <p className="text-text-secondary text-xs">
                  High-availability cloud infrastructure
                </p>
              </div>
              <p className="text-primary font-bold text-lg">$450/mo</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-primary/15">
              <div className="flex flex-col">
                <p className="font-semibold">Video Streaming API</p>
                <p className="text-text-secondary text-xs">
                  Real-time classNameroom connectivity
                </p>
              </div>
              <p className="text-primary font-bold text-lg">$1,200/mo</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <div className="flex flex-col">
                <p className="font-semibold">Platform Maintenance</p>
                <p className="text-text-secondary text-xs">
                  Security patches and updates
                </p>
              </div>
              <p className="text-primary font-bold text-lg">$300/mo</p>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col">
                <p className="font-semibold">Administrative Costs</p>
                <p className="text-text-secondary text-xs">
                  Support and coordination
                </p>
              </div>
              <p className="text-primary font-bold text-lg">$150/mo</p>
            </div>
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
              <div className="h-full w-[65%] bg-linear-to-r from-primary to-primary-light"></div>
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
      <div className="bg-bg-card rounded-xl border border-border p-8 shadow-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center p-1 bg-bg-primary/20 rounded-lg w-full max-w-xs mx-auto border border-border">
            <button
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${monthly ? "bg-primary text-text-inverse shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
              onClick={() => setMonthly(true)}
            >
              Monthly
            </button>
            <button
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!monthly ? "bg-primary text-text-inverse shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
              onClick={() => setMonthly(false)}
            >
              One-time
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[5, 10, 25].map((preset) => (
              <button
                key={preset}
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
                <span className="text-2xl font-black">${preset}</span>
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
                  className={`font-black text-xl transition-colors duration-200 ${isCustom ? "text-primary" : "text-text-muted"}`}
                >
                  $
                </span>
              </div>
              <input
                className="w-full h-full py-4 pl-8 pr-4 rounded-xl bg-transparent focus:outline-none text-2xl font-black placeholder:text-text-muted text-center"
                placeholder="Custom"
                type="text"
                inputMode="numeric"
                value={isCustom ? (amount === 0 ? "" : amount) : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
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
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest text-center">
              Choose Payment Method
            </p>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center gap-2 justify-center h-12 rounded-lg bg-text-primary/90 text-text-inverse hover:bg-text-primary transition-colors">
                <FontAwesomeIcon icon={faCreditCard} />
                <span className="font-bold">Card</span>
              </button>
              <button className="flex-1 flex items-center justify-center h-12 rounded-lg bg-[#3b7bbf] text-white hover:bg-[#2d629a] transition-colors">
                <span className="font-black italic">PayPal</span>
              </button>
            </div>
            <button className="w-full flex items-center justify-center h-12 rounded-lg border border-white/10 hover:bg-[#0eb520]/85 bg-[#0eb520] transition-colors">
              <Image
                width={597}
                height={418}
                alt=""
                className="h-18 w-auto"
                data-alt="Google Pay Logo"
                src="/mpesa.png"
              />
            </button>
          </div>
          <button className="w-full bg-primary text-text-inverse py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/20 hover:bg-primary-light transition-all mt-4">
            Support Rahiq Now
          </button>
          <p className="text-center text-xs text-text-secondary">
            Secure, encrypted transaction. Tax-deductible in many regions.
          </p>
        </div>
      </div>
    </div>
  );
}
