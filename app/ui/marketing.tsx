import type { ReactNode } from "react";

/**
 * The frame every public page shares.
 *
 * Public pages are excluded from request interception, so they are all statically
 * rendered. This keeps the heading order, width, and spacing identical across
 * them instead of each page choosing its own.
 */
export function MarketingPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <main className="w-full flex flex-col gap-16 pb-24 pt-8">
      <header className="w-full max-w-3xl mx-auto flex flex-col gap-4 *:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
        {lede ? <p className="text-lg text-text-secondary">{lede}</p> : null}
      </header>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-12 *:px-8">{children}</div>
    </main>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{heading}</h2>
      <div className="flex flex-col gap-4 text-text-secondary">{children}</div>
    </section>
  );
}

/**
 * A numbered step. The order is carried in the markup rather than by visual
 * counters, so the list still reads correctly to a screen reader and survives
 * restyling.
 */
export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="flex flex-col gap-6">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-4 items-start">
          <span
            aria-hidden="true"
            className="shrink-0 size-8 rounded-full bg-primary-subtle text-primary font-bold flex items-center justify-center"
          >
            {index + 1}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-text-secondary">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-3xl border border-border bg-bg-card p-6 text-text-secondary">{children}</aside>
  );
}

/** A definition-style row, used wherever a page lists attributes of something. */
export function DetailList({ items }: { items: { term: string; detail: string }[] }) {
  return (
    <dl className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.term} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
          <dt className="font-semibold text-text-primary sm:w-48 sm:shrink-0">{item.term}</dt>
          <dd className="text-text-secondary">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
