import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CutMyCase - Custom Foam Inserts, Cut to Perfection",
    template: "%s | CutMyCase",
  },
  description:
    "Upload a photo of your gear and get AI-designed, CNC precision-cut foam inserts shipped to your door. Perfect fit guaranteed for Pelican, Nanuk, SKB cases and more.",
  keywords: [
    "custom foam inserts",
    "foam inserts",
    "pelican case foam",
    "gun case foam",
    "camera case foam",
    "CNC foam cutting",
    "custom case foam",
    "nanuk case foam",
    "drone case foam",
    "tool case foam",
    "custom cut foam",
    "precision foam",
    "AI foam design",
  ],
  authors: [{ name: "CutMyCase" }],
  creator: "CutMyCase",
  publisher: "CutMyCase",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cutmycase.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CutMyCase - Custom Foam Inserts, Cut to Perfection",
    description:
      "Upload a photo of your gear. Our AI designs the perfect foam insert. CNC precision-cut and shipped to your door.",
    type: "website",
    locale: "en_US",
    url: "https://cutmycase.com",
    siteName: "CutMyCase",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CutMyCase - AI-Powered Custom Foam Inserts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CutMyCase - Custom Foam Inserts, Cut to Perfection",
    description:
      "Upload a photo of your gear. Our AI designs the perfect foam insert. CNC precision-cut and shipped to your door.",
    images: ["/og-image.jpg"],
    creator: "@cutmycase",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

// JSON-LD structured data for the organization
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://cutmycase.com/#organization",
      name: "CutMyCase",
      url: "https://cutmycase.com",
      logo: {
        "@type": "ImageObject",
        url: "https://cutmycase.com/images/logo.png",
        width: 512,
        height: 512,
      },
      description:
        "AI-powered custom foam inserts for protective cases. Upload a photo, get a perfect fit.",
      sameAs: [
        // Add social media URLs when available
        // "https://twitter.com/cutmycase",
        // "https://facebook.com/cutmycase",
        // "https://instagram.com/cutmycase",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-800-555-1234",
        contactType: "customer service",
        email: "hello@cutmycase.com",
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://cutmycase.com/#website",
      url: "https://cutmycase.com",
      name: "CutMyCase",
      publisher: {
        "@id": "https://cutmycase.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://cutmycase.com/cases?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://cutmycase.com/#localbusiness",
      name: "CutMyCase",
      image: "https://cutmycase.com/images/logo.png",
      description:
        "Custom CNC-cut foam inserts for protective cases. AI-powered design, precision manufacturing.",
      url: "https://cutmycase.com",
      telephone: "+1-800-555-1234",
      email: "hello@cutmycase.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Texas",
        addressCountry: "US",
      },
      priceRange: "$$",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    },
    {
      "@type": "Service",
      "@id": "https://cutmycase.com/#service",
      name: "Custom Foam Insert Design & Manufacturing",
      provider: {
        "@id": "https://cutmycase.com/#organization",
      },
      description:
        "AI-powered custom foam insert design with CNC precision cutting for protective cases including Pelican, Nanuk, SKB, and more.",
      areaServed: {
        "@type": "Country",
        name: "United States",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Custom Foam Inserts",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Cut Foam Insert",
              description:
                "AI-designed, CNC precision-cut foam insert for your protective case",
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${bebasNeue.variable} ${barlow.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
