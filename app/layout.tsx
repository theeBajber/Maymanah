import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { plexSans } from "@/app/ui/fonts";
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
  // The browser tab icon is the static app/favicon.ico. The PWA manifest
  // ships the same artwork as a square PNG, and the openGraph/twitter share
  // cards come from the file conventions — declaring icon links here too
  // would risk duplicate <link>/meta tags.
};

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.layl,
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Organization + WebSite JSON-LD — describes the institution to search
 * engines site-wide so results can render a knowledge-panel-style entity
 * (name, logo, description) rather than a bare blue link. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
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
