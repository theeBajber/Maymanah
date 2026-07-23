"use client";

import { GirihField } from "@/components/ui/girih";
import { amiri, elMessiri } from "@/components/ui/fonts";

export default function RevisionComingSoon() {
  return (
    <div className="relative mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-20">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_55%_at_50%_40%,#0E1B23_0%,transparent_100%)]"
      />
      <GirihField
        className="absolute inset-0"
        opacity={0.04}
        tile={84}
        fade="radial"
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="glass-lantern relative flex flex-col items-center gap-5 rounded-3xl px-10 py-10 md:px-14 md:py-12">
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

          <div className="relative flex flex-col items-center gap-5">
            <span
              className={`${amiri.className} text-2xl leading-relaxed text-brass/70`}
              lang="ar"
              dir="rtl"
            >
              قريباً
            </span>

            <div className="flex flex-col items-center gap-2 text-center">
              <h1
                className={`${elMessiri.className} text-4xl font-semibold text-ivory md:text-5xl`}
              >
                Quran Revision
              </h1>
              <div className="mx-auto h-px w-16 bg-brass/40" />
              <p className="max-w-md text-balance leading-relaxed text-sage/80 md:text-lg">
                AI-powered memorization practice is being prepared. Check back
                soon, and may Allah accept your efforts.
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-center gap-3 text-[13px] text-sage/60">
            <span className="size-1 rounded-full bg-brass/40" />
            <span>Coming soon</span>
            <span className="size-1 rounded-full bg-brass/40" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-sage/50">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brass/50"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="tracking-[0.08em] uppercase">
            Feature in development
          </span>
        </div>
      </div>
    </div>
  );
}
