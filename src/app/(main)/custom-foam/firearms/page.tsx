import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Shield,
  Target,
  Lock,
  Crosshair,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Gun Case Foam Inserts | Firearms & Tactical",
  description:
    "Custom CNC-cut foam inserts for gun cases. Perfect fit for pistols, rifles, AR-15s, shotguns, magazines, and tactical gear. Compatible with Pelican, Nanuk, and more.",
  keywords: [
    "gun case foam",
    "custom gun foam",
    "pistol case foam",
    "rifle case foam",
    "AR-15 case foam",
    "pelican gun case foam",
    "tactical case foam",
    "firearm foam insert",
    "custom pistol foam",
    "magazine foam insert",
  ],
  alternates: {
    canonical: "/custom-foam/firearms",
  },
  openGraph: {
    title: "Custom Gun Case Foam Inserts | CutMyCase",
    description:
      "Precision CNC-cut foam for your firearms. Upload a photo, get a perfect fit for pistols, rifles, and tactical gear.",
    images: ["/images/showcase-firearms-1.jpg"],
  },
};

const features = [
  {
    icon: Target,
    title: "Precision Fit",
    description:
      "CNC-cut to +/- 0.1\" tolerance. Your firearms fit perfectly with no wobble or excess space.",
  },
  {
    icon: Shield,
    title: "Maximum Protection",
    description:
      "High-density foam absorbs shock and prevents scratches during transport and storage.",
  },
  {
    icon: Lock,
    title: "Secure Storage",
    description:
      "Keep magazines, optics, suppressors, and accessories organized and protected.",
  },
  {
    icon: Crosshair,
    title: "Optic Clearance",
    description:
      "Custom depths accommodate red dots, scopes, and other mounted accessories.",
  },
];

const useCases = [
  "Handguns & Pistols",
  "AR-15 / AR-10 Rifles",
  "Bolt Action Rifles",
  "Shotguns",
  "Suppressors & Silencers",
  "Magazines & Ammo",
  "Optics & Scopes",
  "Ear Protection",
  "Cleaning Kits",
  "Range Bags",
];

const caseCompatibility = [
  "Pelican 1170, 1200, 1400, 1450, 1500, 1510, 1520, 1550, 1600, 1610, 1620, 1650",
  "Pelican Vault V100, V200, V300, V500, V550, V600, V700, V730, V770, V800",
  "Pelican Air 1485, 1525, 1535, 1555, 1605, 1615, 1637, 1745",
  "Nanuk 909, 910, 915, 920, 925, 930, 935, 940, 945, 950, 960, 965, 990",
  "Apache 1800, 2800, 3800, 4800, 5800, 9800 (Harbor Freight)",
  "Plano All Weather, Field Locker, Tactical Series",
  "SKB iSeries Cases",
  "Seahorse Protective Cases",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Gun Case Foam Inserts",
  provider: {
    "@type": "Organization",
    name: "CutMyCase",
    url: "https://cutmycase.com",
  },
  description:
    "AI-powered custom foam insert design for firearms and tactical gear. CNC precision-cut foam for pistols, rifles, magazines, and accessories.",
  areaServed: "United States",
  serviceType: "Custom Manufacturing",
};

export default function FirearmsPage() {
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
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500 uppercase tracking-wider">
                    Firearms & Tactical
                  </span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6">
                  Custom Gun Case{" "}
                  <span className="text-orange-500">Foam Inserts</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-8">
                  Protect your firearms with precision CNC-cut foam. Upload a
                  photo of your gear, and our AI designs the perfect layout for
                  pistols, rifles, magazines, and accessories.
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
                <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-zinc-800">
                  <Image
                    src="/images/showcase-firearms-1.jpg"
                    alt="Custom foam insert for tactical case with pistol, ear protection, magazines, and suppressor"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading mb-4">
                Why Choose CutMyCase for Gun Foam?
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Professional-grade foam inserts without the professional price
                tag or lead time.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-black border border-zinc-800 rounded-lg p-6 hover:border-orange-500/30 transition-colors"
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
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-heading mb-6">
                  Perfect Foam for Every Firearm
                </h2>
                <p className="text-zinc-400 mb-8">
                  Whether you&apos;re building a range kit, competition setup, or
                  secure storage solution, our custom foam fits exactly what you
                  need.
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

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
                <h3 className="text-xl font-heading mb-4 text-orange-500">
                  Compatible Cases
                </h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  {caseCompatibility.map((cases, index) => (
                    <li key={index} className="pb-3 border-b border-zinc-800 last:border-0">
                      {cases}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-zinc-500 text-sm">
                  Don&apos;t see your case? Enter custom dimensions for any
                  rectangular case.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading mb-4">
                How It Works
              </h2>
              <p className="text-zinc-400">
                From photo to precision-cut foam in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload Your Gear Photo",
                  description:
                    "Lay out your firearms and accessories. Include a reference object like a credit card for scale. Our AI detects each item automatically.",
                },
                {
                  step: "2",
                  title: "Arrange Your Layout",
                  description:
                    "Drag items into your case. Set custom depths for items with optics or accessories. Add finger pulls for easy removal.",
                },
                {
                  step: "3",
                  title: "Order & Receive",
                  description:
                    "Approve your design and checkout. We CNC-cut your foam with +/- 0.1\" precision and ship within 48 hours.",
                },
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-orange-500 text-white font-heading text-3xl rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-heading mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-black">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-heading mb-6">
              Ready to Protect Your Firearms?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join thousands of gun owners who trust CutMyCase for their custom
              foam needs. Design is free—you only pay when you order.
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
