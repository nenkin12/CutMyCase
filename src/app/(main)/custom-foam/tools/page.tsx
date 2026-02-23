import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Wrench,
  Battery,
  Ruler,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Tool Case Foam Inserts | Professional Tools",
  description:
    "Custom CNC-cut foam inserts for tool cases. Perfect fit for power tools, precision instruments, drill bits, and accessories. Compatible with Pelican, Nanuk, and more.",
  keywords: [
    "tool case foam",
    "custom tool foam",
    "power tool case foam",
    "drill case foam",
    "pelican tool foam",
    "professional tool foam",
    "tool foam insert",
    "precision instrument foam",
    "DeWalt case foam",
    "Milwaukee tool foam",
  ],
  alternates: {
    canonical: "/custom-foam/tools",
  },
  openGraph: {
    title: "Custom Tool Case Foam Inserts | CutMyCase",
    description:
      "Precision CNC-cut foam for your professional tools. Upload a photo, get a perfect fit for power tools and instruments.",
  },
};

const features = [
  {
    icon: Wrench,
    title: "Tool Organization",
    description:
      "Every tool has its place. Never waste time searching for the right bit or accessory.",
  },
  {
    icon: Battery,
    title: "Battery Storage",
    description:
      "Dedicated slots for batteries and chargers keep your cordless tools ready to go.",
  },
  {
    icon: Ruler,
    title: "Precision Fit",
    description:
      "CNC-cut to exact dimensions of your tools with proper clearance for easy access.",
  },
  {
    icon: Shield,
    title: "Job Site Ready",
    description:
      "Protect expensive tools from drops, dust, and damage during transport.",
  },
];

const useCases = [
  "Cordless Drills",
  "Impact Drivers",
  "Oscillating Tools",
  "Rotary Tools",
  "Precision Instruments",
  "Calibration Equipment",
  "Drill Bit Sets",
  "Socket Sets",
  "Batteries & Chargers",
  "Measurement Tools",
  "Safety Equipment",
  "Specialty Tools",
];

const toolBrands = ["DeWalt", "Milwaukee", "Makita", "Bosch", "Festool", "Hilti"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Tool Case Foam Inserts",
  provider: {
    "@type": "Organization",
    name: "CutMyCase",
    url: "https://cutmycase.com",
  },
  description:
    "AI-powered custom foam insert design for professional tools and instruments. CNC precision-cut foam for power tools, precision equipment, and accessories.",
  areaServed: "United States",
  serviceType: "Custom Manufacturing",
};

export default function ToolsPage() {
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
                  <Wrench className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500 uppercase tracking-wider">
                    Professional Tools
                  </span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6">
                  Custom Tool Case{" "}
                  <span className="text-orange-500">Foam Inserts</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-8">
                  Organize and protect your professional tools with precision
                  CNC-cut foam. Upload a photo of your tools, and our AI designs
                  the perfect layout for drills, instruments, and accessories.
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
                      <linearGradient id="toolFoam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2d2d2d" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                      </linearGradient>
                      <linearGradient id="toolCut" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D00" />
                        <stop offset="100%" stopColor="#FF6B2B" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />
                    <g transform="rotate(-15, 140, 120)">
                      <rect x="50" y="80" width="120" height="70" rx="8" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                      <rect x="170" y="95" width="60" height="40" rx="4" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                      <rect x="70" y="150" width="40" height="60" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                    </g>
                    <rect x="270" y="40" width="100" height="50" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                    <rect x="270" y="100" width="100" height="50" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                    <rect x="40" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" />
                    <rect x="65" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" />
                    <rect x="90" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" />
                    <rect x="115" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" />
                    <rect x="140" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" />
                    <rect x="165" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" />
                    <rect x="200" y="200" width="80" height="70" rx="4" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                    <rect x="300" y="170" width="70" height="100" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Tool Brands */}
        <section className="py-8 bg-zinc-900 border-y border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="text-zinc-500 text-sm">Works with all major tool brands:</span>
              {toolBrands.map((brand) => (
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
                Designed for Professionals
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Keep your tools organized, protected, and ready for any job site
                or service call.
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
                  Perfect Foam for Every Trade
                </h2>
                <p className="text-zinc-400 mb-8">
                  From electricians to machinists, our custom foam keeps your
                  tools organized and protected on every job.
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
                  Popular Tool Cases
                </h3>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1510</strong> — Perfect
                    for service technicians on the go
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Pelican 1600</strong> — Room for
                    multiple power tools and accessories
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Nanuk 935</strong> — Great for
                    precision instruments and calibration tools
                  </li>
                  <li className="pb-4 border-b border-zinc-800">
                    <strong className="text-white">Apache 5800</strong> — Budget-friendly
                    option for large tool sets
                  </li>
                  <li>
                    <strong className="text-white">Pelican 1650</strong> — Extra
                    large for complete workshop mobility
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
              Ready to Organize Your Tools?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join professionals who trust CutMyCase for their custom foam
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
