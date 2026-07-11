import type { ReactNode } from "react";
import { AyahText } from "./ayah";
import { elMessiri } from "./fonts";
import { GirihField } from "./girih";

type PageHeaderProps = {
  /** Short Arabic crown — the page's calligraphic identity. */
  arabic: string;
  title: ReactNode;
  lede?: string;
};

/** Consistent inner-page header: gilded Arabic over the El Messiri Latin title. */
export function PageHeader({ arabic, title, lede }: PageHeaderProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,#0E1B23_0%,transparent_100%)]"
      />
      <GirihField
        className="absolute inset-0"
        opacity={0.04}
        tile={84}
        fade="radial"
      />
      <div className="stagger-fade relative mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 pt-16 pb-2 text-center md:pt-20">
        <AyahText size="sm" gilded>
          {arabic}
        </AyahText>
        <h1
          className={`${elMessiri.className} text-balance text-4xl font-semibold text-ivory md:text-5xl`}
        >
          {title}
        </h1>
        {lede && (
          <p className="max-w-2xl text-balance text-base leading-relaxed text-sage md:text-lg">
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}
