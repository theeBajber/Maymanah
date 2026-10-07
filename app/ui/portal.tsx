import type { ElementType, ReactNode } from "react";
import { elMessiri } from "./fonts";
import { CountUp } from "./count-up";

/**
 * Dense data-surface for the portal: a solid panel, not glass.
 * "Glass used sparingly where data legibility matters" — reserve
 * glass-pane/lantern for the one hero summary per screen; every
 * list, table, and stat tile below uses this instead.
 */
export function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-bg-elevated shadow-raise ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </h3>
  );
}

/** Compact page title for portal screens — no decorative crown, high density. */
export function PortalHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1
          className={`${elMessiri.className} text-2xl font-semibold text-text-primary md:text-3xl`}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Stat tile: icon mark (not a tinted circle), big number, label. */
export function StatTile({
  icon: Icon,
  value,
  label,
  tone = "brass",
}: {
  icon: ElementType;
  value: ReactNode;
  label: string;
  tone?: "brass" | "success" | "info" | "danger";
}) {
  const toneClass = {
    brass: "text-primary border-primary/25",
    success: "text-success border-success/25",
    info: "text-info border-info/25",
    danger: "text-danger border-danger/25",
  }[tone];

  return (
    <Panel className="flex items-center gap-3 p-5">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] border ${toneClass}`}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="flex flex-col">
        <p className="text-2xl font-bold text-text-primary">
          {typeof value === "number" ? <CountUp value={value} /> : value}
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
          {label}
        </p>
      </div>
    </Panel>
  );
}

/** Empty state: quiet, no icon-in-circle theatrics, one clear action. */
export function EmptyState({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="text-sm text-text-secondary">{title}</p>
      {action}
    </div>
  );
}
