import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Mic,
  Headphones,
  Music,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Audio Equipment Case Foam | Microphones & Mixers",
  description:
    "Custom CNC-cut foam inserts for audio equipment cases. Perfect fit for microphones, mixers, headphones, and recording gear. Compatible with Pelican, Nanuk, and more.",
  keywords: [
    "audio case foam",
    "microphone case foam",
    "custom audio foam",
    "mixer case foam",
    "pelican audio foam",
    "recording equipment foam",
    "audio foam insert",
    "headphone case foam",
    "podcast equipment case",
    "studio gear foam",
  ],
  alternates: {
    canonical: "/custom-foam/audio",
  },
  openGraph: {
    title: "Custom Audio Equipment Case Foam | CutMyCase",
    description:
      "Precision CNC-cut foam for audio equipment. Upload a photo, get a perfect fit for microphones, mixers, and gear.",
  },
};

const features = [
  {
    icon: Mic,
    title: "Microphone Protection",
    description:
      "Custom cutouts for condenser, dynamic, and ribbon mics with proper support.",
  },
  {
    icon: Music,
    title: "Mixer & Interface Fit",
    description:
      "Precision foam for audio interfaces, mixers, and control surfaces.",
  },
  {
    icon: Headphones,
    title: "Headphone Storage",
    description:
      "Dedicated space for studio headphones and in-ear monitors without crushing.",
  },
  {
    icon: Shield,
    title: "Tour Ready",
    description:
      "Protect your gear from the rigors of touring and live sound production.",
  },
];

const useCases = [
  "Condenser Microphones",
  "Dynamic Microphones",
  "Ribbon Microphones",
  "Wireless Systems",
  "Audio Interfaces",
  "Portable Recorders",
  "Mixers & Preamps",
  "Studio Headphones",
  "In-Ear Monitors",
  "Cables & Accessories",
  "Shock Mounts",
  "Pop Filters",
];

const audioBrands = [
  "Shure",
  "Sennheiser",
  "Neumann",
  "Rode",
  "Audio-Technica",
  "Focusrite",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Audio Equipment Case Foam Inserts",
  provider: {
    "@type": "Organization",
    name: "CutMyCase",
    url: "https://cutmycase.com",
  },
  description:
    "AI-powered custom foam insert design for audio and recording equipment. CNC precision-cut foam for microphones, mixers, and studio gear.",
  areaServed: "United States",
  serviceType: "Custom Manufacturing",
};

export default function AudioPage() {
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
                  <Mic className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500 uppercase tracking-wider">
                    Audio & Recording
                  </span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6">
                  Custom Audio Case{" "}
                  <span className="text-orange-500">Foam Inserts</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-8">
                  Protect your audio equipment with precision CNC-cut foam.
                  Upload a photo of your gear, and our AI designs the perfect
                  layout for microphones, mixers, and accessories.
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
                      <linearGradient id="audioFoam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2d2d2d" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                      </linearGradient>
                      <linearGradient id="audioCut" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D00" />
                        <stop offset="100%" stopColor="#FF6B2B" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />
                    <rect x="40" y="50" width="50" height="180" rx="25" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <rect x="50" y="60" width="30" height="80" rx="15" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />
                    <rect x="100" y="50" width="50" height="180" rx="25" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <rect x="110" y="60" width="30" height="80" rx="15" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />
                    <rect x="170" y="40" width="150" height="100" rx="6" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <rect x="185" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
                    <rect x="205" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
                    <rect x="225" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
                    <rect x="245" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
                    <ellipse cx="340" cy="90" rx="30" ry="50" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <circle cx="200" cy="200" r="40" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <circle cx="200" cy="200" r="20" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.4" />
                    <circle cx="290" cy="200" r="35" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <circle cx="355" cy="200" r="25" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" />
                    <rect x="40" y="245" width="100" height="25" rx="4" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Audio Brands */}
        <section className="py-8 bg-zinc-900 border-y border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="text-zinc-500 text-sm">Works with all major audio brands:</span>
              {audioBrands.map((brand) => (
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
                Designed for Audio Professionals
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Keep your valuable audio equipment protected and organized for
                studio sessions, live sound, and remote recording.
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
                  From podcasters to touring engineers, our custom foam protects
                  your audio investment during travel and storage.
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
                  Popular Audio Cases
                </h3>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1510</strong> — Perfect
                    for podcast kits and mobile recording
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1560</strong> — Ideal
                    for multiple microphones and accessories
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Nanuk 935</strong> — Great for
                    wireless systems and IEMs
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1600</strong> — Room for
                    mixer, mics, and headphones
                  </li>
                  <li>
                    <strong className="text-white">Apache 4800</strong> — Budget-friendly
                    option for home studio gear
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
              Ready to Protect Your Audio Gear?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join audio professionals who trust CutMyCase for their custom foam
              needs. Design is free—you only pay when you order.
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
