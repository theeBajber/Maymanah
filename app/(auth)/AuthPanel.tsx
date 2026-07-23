import Image from "next/image";
import type { ReactNode } from "react";
import { elMessiri } from "@/components/ui/fonts";
import { GirihField } from "@/components/ui/girih";

type AuthPanelProps = {
  /** Short line under the wordmark — also the page's h1. */
  heading: string;
  wide?: boolean;
  children: ReactNode;
};

/**
 * The glass panel both auth pages live in — the one lantern element
 * of the page: girih-latticed crown, gilded bismillah, El Messiri wordmark.
 */
export function AuthPanel({ heading, wide = false, children }: AuthPanelProps) {
  return (
    <main
      className={`glass-lantern relative w-full overflow-hidden rounded-3xl px-5 py-10 sm:px-10 ${
        wide ? "max-w-xl" : "max-w-md"
      }`}
    >
      {/* mashrabiya crown: lattice light entering through the panel's top edge */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24">
        <GirihField
          className="absolute inset-0"
          opacity={0.1}
          tile={56}
          fade="bottom"
        />
      </div>

      <div className="relative mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={439}
            height={339}
            className="h-9 w-auto"
          />
          <span
            className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
          >
            Maymanah
          </span>
        </div>
        <div className="flex w-full max-w-xs items-center gap-4">
          <span className="h-px flex-1 bg-linear-to-r from-transparent to-brass/50" />
          <h1 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sage">
            {heading}
          </h1>
          <span className="h-px flex-1 bg-linear-to-l from-transparent to-brass/50" />
        </div>
      </div>

      {children}
    </main>
  );
}
