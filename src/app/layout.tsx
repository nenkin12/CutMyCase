import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
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
  title: "CutMyCase - Custom Foam Inserts, Cut to Perfection",
  description:
    "Upload a photo of your gear and get AI-designed, CNC precision-cut foam inserts shipped to your door.",
  keywords: [
    "custom foam",
    "foam inserts",
    "pelican case",
    "gun case foam",
    "camera case foam",
    "CNC cutting",
  ],
  openGraph: {
    title: "CutMyCase - Custom Foam Inserts",
    description:
      "AI-designed, CNC precision-cut foam inserts for your cases.",
    type: "website",
    locale: "en_US",
    siteName: "CutMyCase",
  },
  twitter: {
    card: "summary_large_image",
    title: "CutMyCase - Custom Foam Inserts",
    description:
      "AI-designed, CNC precision-cut foam inserts for your cases.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${bebasNeue.variable} ${barlow.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
