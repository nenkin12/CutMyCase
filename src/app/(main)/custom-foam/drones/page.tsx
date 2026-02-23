import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Plane,
  Battery,
  Radio,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Drone Case Foam Inserts | UAV & Quadcopter",
  description:
    "Custom CNC-cut foam inserts for drone cases. Perfect fit for DJI, Autel, Skydio drones, controllers, batteries, and accessories. Compatible with Pelican, Nanuk, and more.",
  keywords: [
    "drone case foam",
    "DJI case foam",
    "custom drone foam",
    "quadcopter case foam",
    "UAV case foam",
    "pelican drone foam",
    "drone foam insert",
    "FPV drone case",
    "Mavic case foam",
    "drone battery foam",
  ],
  alternates: {
    canonical: "/custom-foam/drones",
  },
  openGraph: {
    title: "Custom Drone Case Foam Inserts | CutMyCase",
    description:
      "Precision CNC-cut foam for your drone equipment. Upload a photo, get a perfect fit for drones, controllers, and batteries.",
  },
};

const features = [
  {
    icon: Plane,
    title: "Drone Body Protection",
    description:
      "Custom cutouts for your specific drone model with propeller clearance options.",
  },
  {
    icon: Radio,
    title: "Controller Fit",
    description:
      "Dedicated space for controllers with antenna protection and joystick clearance.",
  },
  {
    icon: Battery,
    title: "Battery Organization",
    description:
      "Organized slots for multiple batteries with easy access for quick swaps.",
  },
  {
    icon: Shield,
    title: "Travel Ready",
    description:
      "TSA-friendly designs that protect your investment during air travel.",
  },
];

const useCases = [
  "Consumer Drones",
  "FPV Racing Drones",
  "Commercial UAVs",
  "Photography Drones",
  "Controllers & Transmitters",
  "Drone Batteries",
  "Propellers & Spares",
  "ND Filters",
  "Charging Hubs",
  "FPV Goggles",
  "Memory Cards",
  "Tablets & Monitors",
];

const droneBrands = ["DJI", "Autel", "Skydio", "Parrot", "FPV Custom", "Freefly"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Drone Case Foam Inserts",
  provider: {
    "@type": "Organization",
    name: "CutMyCase",
    url: "https://cutmycase.com",
  },
  description:
    "AI-powered custom foam insert design for drones and UAV equipment. CNC precision-cut foam for quadcopters, controllers, and batteries.",
  areaServed: "United States",
  serviceType: "Custom Manufacturing",
};

export default function DronesPage() {
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
                  <Plane className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500 uppercase tracking-wider">
                    Drones & UAV
                  </span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6">
                  Custom Drone Case{" "}
                  <span className="text-orange-500">Foam Inserts</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-8">
                  Protect your drone investment with precision CNC-cut foam.
                  Upload a photo of your gear, and our AI designs the perfect
                  layout for your drone, controller, batteries, and accessories.
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
                      <linearGradient id="droneFoam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2d2d2d" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                      </linearGradient>
                      <linearGradient id="droneCut" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D00" />
                        <stop offset="100%" stopColor="#FF6B2B" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />
                    <rect x="130" y="80" width="80" height="50" rx="8" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <line x1="130" y1="90" x2="70" y2="50" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="60" cy="45" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <line x1="210" y1="90" x2="270" y2="50" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="280" cy="45" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <line x1="130" y1="120" x2="70" y2="160" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="60" cy="165" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <line x1="210" y1="120" x2="270" y2="160" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="280" cy="165" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <rect x="320" y="40" width="55" height="90" rx="6" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <rect x="40" y="200" width="80" height="35" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <rect x="130" y="200" width="80" height="35" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                    <rect x="220" y="200" width="80" height="35" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Drone Brands */}
        <section className="py-8 bg-zinc-900 border-y border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="text-zinc-500 text-sm">Compatible with:</span>
              {droneBrands.map((brand) => (
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
                Designed for Drone Pilots
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Keep your drone, controller, and accessories organized and
                protected for every flight.
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
                  Perfect Foam for Every Pilot
                </h2>
                <p className="text-zinc-400 mb-8">
                  From weekend hobbyists to commercial operators, our custom
                  foam protects your investment during transport and storage.
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
                  Popular Drone Cases
                </h3>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1510</strong> — Carry-on
                    friendly for DJI Mavic series with accessories
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1560</strong> — Perfect
                    for DJI Phantom or larger drones
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Nanuk 940</strong> — Great for
                    DJI Inspire or cinema drones
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Apache 4800</strong> — Budget-friendly
                    option for DJI Mini series
                  </li>
                  <li>
                    <strong className="text-white">Pelican Air 1615</strong> —
                    Lightweight for commercial operators
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
              Ready to Protect Your Drone?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join drone pilots who trust CutMyCase for their custom foam needs.
              Design is free—you only pay when you order.
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
