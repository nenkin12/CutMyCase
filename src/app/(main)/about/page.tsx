import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about CutMyCase - the team behind AI-powered custom foam inserts. Our mission is to protect what matters with precision-engineered foam solutions.",
  alternates: {
    canonical: "/about",
  },
};

const values = [
  {
    icon: Target,
    title: "Precision",
    description:
      "Every cut is made with +/- 0.1\" tolerance. We don't compromise on accuracy because your gear deserves perfect protection.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We combine cutting-edge AI with proven CNC manufacturing to deliver custom solutions that were previously impossible.",
  },
  {
    icon: Shield,
    title: "Quality",
    description:
      "Premium materials, rigorous quality control, and a satisfaction guarantee. We stand behind every foam insert we make.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "From photographers to first responders, we listen to our customers and continuously improve based on their feedback.",
  },
];

const stats = [
  { value: "10,000+", label: "Custom Designs Created" },
  { value: "99.8%", label: "Perfect Fit Rate" },
  { value: "48hr", label: "Average Ship Time" },
  { value: "4.9/5", label: "Customer Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 uppercase tracking-wider text-sm">
                About CutMyCase
              </span>
              <h1 className="text-4xl sm:text-5xl font-heading mt-2 mb-6">
                Protecting What <span className="text-orange-500">Matters</span>
              </h1>
              <p className="text-zinc-400 text-lg mb-6">
                We started CutMyCase because we were tired of ill-fitting foam,
                tedious pick-and-pluck, and expensive custom solutions that took
                weeks to arrive.
              </p>
              <p className="text-zinc-400 text-lg mb-8">
                By combining AI-powered design with precision CNC manufacturing,
                we&apos;ve made custom foam inserts accessible to everyone—from
                hobbyists protecting a single camera to professionals outfitting
                entire fleets.
              </p>
              <Link href="/upload">
                <Button size="lg">
                  Start Your Design
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl font-heading text-orange-500 mb-2">
                    CMC
                  </div>
                  <div className="text-zinc-500 uppercase tracking-widest text-sm">
                    Est. 2024
                  </div>
                  <div className="text-zinc-600 mt-4">Made in Texas</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-zinc-900 border-y border-zinc-800 py-12 mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-heading text-orange-500 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-zinc-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-heading mb-8 text-center">Our Story</h2>
          <div className="prose prose-invert prose-zinc max-w-none">
            <p className="text-zinc-400 text-lg mb-6">
              It started with a frustrating afternoon spent picking foam cubes
              out of a Pelican case, trying to make space for camera gear. Hours
              later, the result was... mediocre. Uneven edges, loose fits, and
              foam debris everywhere.
            </p>
            <p className="text-zinc-400 text-lg mb-6">
              There had to be a better way. Professional foam cutting services
              existed, but they required CAD files, weeks of lead time, and
              minimum orders that didn&apos;t make sense for individuals.
            </p>
            <p className="text-zinc-400 text-lg mb-6">
              So we built CutMyCase. Using computer vision AI, we can analyze a
              simple photo of your gear and generate precise outlines
              automatically. No CAD skills needed. No lengthy back-and-forth.
              Just upload, arrange, and order.
            </p>
            <p className="text-zinc-400 text-lg">
              Today, we&apos;ve helped thousands of customers protect their
              gear—from weekend photographers to military units, from drone
              operators to medical professionals. Every piece of equipment
              deserves a perfect fit, and we&apos;re here to make that happen.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-heading mb-12 text-center">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-500/30 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-heading mb-2">{value.title}</h3>
                <p className="text-zinc-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h2 className="text-3xl font-heading mb-4">
              Ready to Protect Your Gear?
            </h2>
            <p className="text-zinc-400 mb-6">
              Join thousands of professionals who trust CutMyCase for their
              custom foam needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg">
                  Start Designing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
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
