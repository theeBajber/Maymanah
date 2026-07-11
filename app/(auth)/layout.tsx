import type { Metadata } from "next";
import { GirihField } from "@/components/ui/girih";

export const metadata: Metadata = {
  title: {
    default: "Sign In or Register",
    // Re-declaring the template here (rather than inheriting it) is required:
    // any intermediate layout that sets a plain-string title silently resets
    // the template chain for nested segments (login/register layouts) in
    // Next.js's metadata resolution — see resolve-metadata.js.
    template: "%s | Maymanah",
  },
  description: "Sign in to your Maymanah account or create a new one — free Quran, Tajweed, and Arabic classes with volunteer teachers.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="night-scene relative min-h-svh w-full overflow-hidden bg-layl-deep text-ivory">
      {/* atmospheric base: the room is darker than the content */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#0E1B23_0%,#0B151B_45%,#060D11_100%)]"
      />
      {/* ambient girih lattice, drifting almost imperceptibly */}
      <GirihField
        className="absolute inset-0"
        opacity={0.05}
        tile={84}
        fade="radial"
        animate
      />
      {/* two soft brass light sources */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[32rem] w-[44rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(198,161,91,0.14),transparent)]"
      />
      <div
        aria-hidden
        className="absolute -bottom-48 -right-32 h-[28rem] w-[36rem] bg-[radial-gradient(closest-side,rgba(198,161,91,0.07),transparent)]"
      />
      <div className="relative z-10 flex min-h-svh w-full items-center justify-center p-4 py-10 sm:p-6">
        {children}
      </div>
    </div>
  );
}
