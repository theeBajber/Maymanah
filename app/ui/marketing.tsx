import type { ReactNode } from "react";
import { elMessiri } from "./fonts";
import { GirihField } from "./girih";

/**
 * The frame every public page shares.
 *
 * Public pages are statically rendered. This keeps the header treatment, width,
 * and spacing identical across them rather than each page choosing its own.
 */
export function MarketingPage({
  title,
  arabic,
  lede,
  children,
}: {
  title: string;
  /** Short Arabic crown, matching the portal header. */
  arabic?: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,#0E1B23_0%,transparent_100%)]"
      />
      <GirihField className="absolute inset-0" opacity={0.04} tile={84} fade="radial" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pt-16 pb-24 text-center">
        {arabic ? (
          <span className="font-naskh text-2xl text-primary/70" lang="ar" dir="rtl">
            {arabic}
          </span>
        ) : null}

        <h1 className={`${elMessiri.className} text-balance text-4xl font-semibold text-ivory md:text-5xl`}>
          {title}
        </h1>

        {lede ? (
          <p className="max-w-2xl text-balance text-base leading-relaxed text-sage md:text-lg">{lede}</p>
        ) : null}
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-14 px-6">{children}</div>
    </main>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 text-left">
      <h2 className={`${elMessiri.className} text-2xl font-semibold text-ivory`}>{heading}</h2>
      <div className="flex flex-col gap-4 text-text-secondary">{children}</div>
    </section>
  );
}

/**
 * A numbered step. The order lives in the markup rather than in a visual
 * counter, so the list still reads correctly to a screen reader.
 */
export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="flex flex-col gap-6">
      {items.map((item, index) => (
        <li key={item.title} className="flex items-start gap-4">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-primary/25 bg-primary/10 text-sm font-bold text-primary"
          >
            {index + 1}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-text-primary">{item.title}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Glass card for emphasis. One per screen at most, per the design system's rule. */
export function Callout({ children }: { children: ReactNode }) {
  return <aside className="glass-pane rounded-2xl p-6 text-sm leading-relaxed text-text-secondary">{children}</aside>;
}

export function DetailList({ items }: { items: { term: string; detail: string }[] }) {
  return (
    <dl className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.term} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted sm:w-40 sm:shrink-0 sm:pt-1">
            {item.term}
          </dt>
          <dd className="text-sm leading-relaxed text-text-secondary">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

const STAGE_TONE = {
  available: "border-night-success/40 bg-night-success/10 text-night-success",
  planned: "border-ivory/12 bg-ivory/[0.03] text-sage/70",
} as const;

/** A titled row with a status chip. Used for curricula, features, and plans. */
export function StageCard({
  title,
  status,
  children,
}: {
  title: string;
  status: keyof typeof STAGE_TONE;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-border bg-bg-elevated p-6 text-left">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className={`${elMessiri.className} text-lg font-semibold text-ivory`}>{title}</h3>
        <span className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold ${STAGE_TONE[status]}`}>
          {status === "available" ? "Available now" : "In development"}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-text-secondary">{children}</div>
    </article>
  );
}
