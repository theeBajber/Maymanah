import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { plexSans } from "@/components/ui/fonts";
import {
  BRAND_COLORS,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // icons, manifest, and openGraph/twitter images are resolved
  // automatically from the file conventions (icon.tsx, apple-icon.tsx,
  // manifest.ts, opengraph-image.tsx, twitter-image.tsx) — declaring
  // them here too would risk duplicate <link>/meta tags.
};

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.layl,
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

/** Organization + WebSite JSON-LD — describes the institution to search
 * engines site-wide so results can render a knowledge-panel-style entity
 * (name, logo, description) rather than a bare blue link. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512`,
  description: SITE_DESCRIPTION,
  slogan: "The Quran, without borders.",
  nonprofitStatus: "Nonprofit",
  areaServed: "Worldwide",
  knowsLanguage: ["en", "ar"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
      </head>
      <body
        className={`${plexSans.className} min-h-full flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
</body>
    </html>
  );
}
