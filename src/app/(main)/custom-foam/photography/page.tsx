import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Camera,
  Shield,
  Aperture,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Camera Case Foam Inserts | Photography & Video",
  description:
    "Custom CNC-cut foam inserts for camera cases. Perfect fit for DSLR, mirrorless cameras, lenses, flash units, and video gear. Compatible with Pelican, Nanuk, and more.",
  keywords: [
    "camera case foam",
    "custom camera foam",
    "DSLR case foam",
    "lens case foam",
    "pelican camera foam",
    "photography case foam",
    "video equipment foam",
    "camera gear foam insert",
    "mirrorless camera foam",
    "photography foam insert",
  ],
  alternates: {
    canonical: "/custom-foam/photography",
  },
  openGraph: {
    title: "Custom Camera Case Foam Inserts | CutMyCase",
    description:
      "Precision CNC-cut foam for your camera gear. Upload a photo, get a perfect fit for cameras, lenses, and accessories.",
  },
};

const features = [
  {
    icon: Camera,
    title: "Camera Body Protection",
    description:
      "Snug fit for DSLRs, mirrorless, and cinema cameras with clearance for battery grips.",
  },
  {
    icon: Aperture,
    title: "Lens Organization",
    description:
      "Individual cutouts for each lens with depth customization for telephoto and zoom lenses.",
  },
  {
    icon: Shield,
    title: "Shock Absorption",
    description:
      "High-density foam protects sensitive electronics from drops and impacts.",
  },
  {
    icon: Sparkles,
    title: "Clean Presentation",
    description:
      "Professional-looking case interior for client meetings and on-location shoots.",
  },
];

const useCases = [
  "DSLR Cameras",
  "Mirrorless Cameras",
  "Cinema Cameras",
  "Prime Lenses",
  "Zoom Lenses",
  "Telephoto Lenses",
  "Flash Units",
  "Battery Grips",
  "External Monitors",
  "Wireless Transmitters",
  "Memory Cards",
  "Batteries & Chargers",
];

const cameraBrands = [
  "Canon",
  "Nikon",
  "Sony",
  "Fujifilm",
  "Panasonic",
  "Blackmagic",
  "RED",
  "ARRI",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Camera Case Foam Inserts",
  provider: {
    "@type": "Organization",
    name: "CutMyCase",
    url: "https://cutmycase.com",
  },
  description:
    "AI-powered custom foam insert design for photography and video equipment. CNC precision-cut foam for cameras, lenses, and accessories.",
  areaServed: "United States",
  serviceType: "Custom Manufacturing",
};

export default function PhotographyPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,0,0.15),transparent_50%)]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                  <Camera className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500 uppercase tracking-wider">
                    Photography & Video
                  </span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6">
                  Custom Camera Case{" "}
                  <span className="text-orange-500">Foam Inserts</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-8">
                  Protect your camera gear with precision CNC-cut foam. Upload a
                  photo of your equipment, and our AI designs the perfect layout
                  for cameras, lenses, and accessories.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/upload">
                    <Button size="xl">
                      Design Your Foam
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/cases">
                    <Button variant="outline" size="xl">
                      Browse Cases
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>Free AI Design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>Ships in 48hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>Perfect Fit Guaranteed</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full p-8"
                  >
                    <defs>
                      <linearGradient id="photoFoam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2d2d2d" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                      </linearGradient>
                      <linearGradient id="photoCut" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D00" />
                        <stop offset="100%" stopColor="#FF6B2B" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />
                    <rect x="40" y="50" width="140" height="100" rx="10" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" />
                    <rect x="100" y="35" width="50" height="25" rx="4" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" />
                    <circle cx="260" cy="100" r="55" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" />
                    <circle cx="260" cy="100" r="35" stroke="url(#photoCut)" strokeWidth="1" opacity="0.5" fill="none" />
                    <circle cx="340" cy="100" r="35" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" />
                    <rect x="40" y="170" width="80" height="90" rx="6" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" />
                    <rect x="140" y="170" width="50" height="90" rx="6" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" />
                    <rect x="210" y="180" width="30" height="40" rx="3" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" />
                    <rect x="250" y="180" width="30" height="40" rx="3" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" />
                    <rect x="290" y="180" width="30" height="40" rx="3" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Camera Brands */}
        <section className="py-8 bg-zinc-900 border-y border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="text-zinc-500 text-sm">Works with all major camera brands:</span>
              {cameraBrands.map((brand) => (
                <span key={brand} className="text-zinc-400 font-medium">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading mb-4">
                Designed for Photographers
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Protect thousands of dollars worth of gear with custom foam that
                fits like a glove.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-500/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-heading mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-heading mb-6">
                  Perfect Foam for Every Setup
                </h2>
                <p className="text-zinc-400 mb-8">
                  From wedding photographers to documentary filmmakers, our
                  custom foam protects gear worth thousands during travel and
                  storage.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {useCases.map((useCase) => (
                    <div key={useCase} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">{useCase}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href="/upload">
                    <Button size="lg">
                      Start Your Design
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-black border border-zinc-800 rounded-lg p-8">
                <h3 className="text-xl font-heading mb-4">
                  Popular Photography Cases
                </h3>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1510</strong> — Perfect
                    carry-on size for travel photographers
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1600</strong> — Ideal
                    for full camera kit with multiple lenses
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Nanuk 935</strong> — Great for
                    cinema cameras and video rigs
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican Air 1615</strong> —
                    Lightweight option for large lens collections
                  </li>
                  <li>
                    <strong className="text-white">Apache 3800</strong> — Budget-friendly
                    option with excellent protection
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-black">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-heading mb-6">
              Ready to Protect Your Camera Gear?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join professional photographers who trust CutMyCase for their
              custom foam needs. Design is free—you only pay when you order.
            </p>
            <Link href="/upload">
              <Button size="xl" className="shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                Start Your Free Design
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
