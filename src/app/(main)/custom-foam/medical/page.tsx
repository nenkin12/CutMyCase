import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Heart,
  Shield,
  Thermometer,
  Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Medical Equipment Case Foam | Healthcare & EMS",
  description:
    "Custom CNC-cut foam inserts for medical equipment cases. Perfect fit for diagnostic devices, surgical instruments, EMS gear, and sensitive medical equipment.",
  keywords: [
    "medical case foam",
    "custom medical foam",
    "EMS case foam",
    "diagnostic equipment foam",
    "surgical instrument foam",
    "pelican medical foam",
    "medical foam insert",
    "healthcare equipment case",
    "first responder case foam",
    "medical device foam",
  ],
  alternates: {
    canonical: "/custom-foam/medical",
  },
  openGraph: {
    title: "Custom Medical Equipment Case Foam | CutMyCase",
    description:
      "Precision CNC-cut foam for medical equipment. Upload a photo, get a perfect fit for diagnostic devices and instruments.",
  },
};

const features = [
  {
    icon: Heart,
    title: "Critical Care Protection",
    description:
      "Protect life-saving equipment with shock-absorbing foam designed for sensitive electronics.",
  },
  {
    icon: Shield,
    title: "Contamination Barrier",
    description:
      "Closed-cell foam resists moisture and can be easily wiped clean between uses.",
  },
  {
    icon: Thermometer,
    title: "Organized Access",
    description:
      "Quick identification and retrieval of equipment in emergency situations.",
  },
  {
    icon: Activity,
    title: "Compliance Ready",
    description:
      "Professional organization supports equipment audits and inventory management.",
  },
];

const useCases = [
  "Diagnostic Monitors",
  "Defibrillators (AED)",
  "Pulse Oximeters",
  "Blood Pressure Cuffs",
  "Stethoscopes",
  "Thermometers",
  "Surgical Instruments",
  "Syringes & Vials",
  "IV Equipment",
  "Ultrasound Probes",
  "Otoscopes",
  "First Aid Supplies",
];

const applications = [
  "Emergency Medical Services (EMS)",
  "Hospital Equipment Transport",
  "Home Healthcare",
  "Medical Device Sales",
  "Clinical Trials",
  "Veterinary Medicine",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Medical Equipment Case Foam Inserts",
  provider: {
    "@type": "Organization",
    name: "CutMyCase",
    url: "https://cutmycase.com",
  },
  description:
    "AI-powered custom foam insert design for medical equipment and healthcare devices. CNC precision-cut foam for diagnostic devices, surgical instruments, and EMS gear.",
  areaServed: "United States",
  serviceType: "Custom Manufacturing",
};

export default function MedicalPage() {
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
                  <Heart className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500 uppercase tracking-wider">
                    Healthcare & EMS
                  </span>
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-6">
                  Custom Medical Case{" "}
                  <span className="text-orange-500">Foam Inserts</span>
                </h1>

                <p className="text-xl text-zinc-400 mb-8">
                  Protect critical medical equipment with precision CNC-cut
                  foam. Upload a photo of your devices, and our AI designs the
                  perfect layout for diagnostic equipment, instruments, and
                  supplies.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/upload">
                    <Button size="xl">
                      Design Your Foam
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="xl">
                      Contact Sales
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
                    <span>Bulk Pricing Available</span>
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
                      <linearGradient id="medFoam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2d2d2d" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                      </linearGradient>
                      <linearGradient id="medCut" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D00" />
                        <stop offset="100%" stopColor="#FF6B2B" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />
                    <rect x="40" y="40" width="150" height="120" rx="8" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" />
                    <rect x="55" y="55" width="120" height="70" rx="4" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.5" />
                    <circle cx="280" cy="100" r="60" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" />
                    <circle cx="280" cy="100" r="35" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.4" />
                    <rect x="40" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <rect x="60" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <rect x="80" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <rect x="100" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <circle cx="145" cy="200" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <circle cx="175" cy="200" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <circle cx="145" cy="240" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <circle cx="175" cy="240" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <rect x="210" y="175" width="25" height="90" rx="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" />
                    <rect x="250" y="175" width="120" height="50" rx="6" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" />
                    <rect x="250" y="235" width="50" height="30" rx="4" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                    <rect x="310" y="235" width="60" height="30" rx="4" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" />
                  </svg>
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
                Designed for Healthcare
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Protect sensitive medical equipment and keep critical supplies
                organized for when every second counts.
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
                  Perfect Foam for Every Application
                </h2>
                <p className="text-zinc-400 mb-8">
                  From ambulances to operating rooms, our custom foam protects
                  critical equipment and keeps supplies organized.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
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
                  Applications
                </h3>
                <ul className="space-y-4">
                  {applications.map((app) => (
                    <li key={app} className="flex items-center gap-3 text-zinc-300">
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      {app}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-4">
                    Need foam for multiple units or a department-wide rollout?
                  </p>
                  <Link
                    href="/contact"
                    className="text-orange-500 hover:underline text-sm"
                  >
                    Contact us for bulk pricing →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-zinc-900">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-heading mb-6">
              Ready to Protect Your Medical Equipment?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join healthcare professionals who trust CutMyCase for their custom
              foam needs. Design is free—you only pay when you order.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="xl" className="shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                  Start Your Free Design
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="xl">
                  Request Bulk Quote
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
