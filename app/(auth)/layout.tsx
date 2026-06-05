import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maymanah - Auth",
  description: "Quran learning platform",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden p-6">
      {children}
    </div>
  );
}
