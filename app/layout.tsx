import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Maymanah - Home",
  description: "Welcome to Maymanah! Your journey of learning Quran awaits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
</body>
    </html>
  );
}
