import type { HTMLAttributes } from "react";
import { GirihField } from "./girih";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  /** pane: default surface · veil: nav/sticky bars · lantern: the one glowing element per viewport */
  grade?: "pane" | "veil" | "lantern";
  /** Faint lattice strip on the top edge — marks featured cards only. */
  mashrabiya?: boolean;
};

export function GlassCard({
  grade = "pane",
  mashrabiya = false,
  className = "",
  children,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={`glass-${grade} relative overflow-hidden rounded-2xl ${className}`}
      {...rest}
    >
      {mashrabiya && (
        <div aria-hidden className="absolute inset-x-0 top-0 h-16">
          <GirihField
            className="absolute inset-0"
            opacity={0.1}
            tile={56}
            fade="bottom"
          />
        </div>
      )}
      {children}
    </div>
  );
}
