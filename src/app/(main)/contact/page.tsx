import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the CutMyCase team. We're here to help with questions about custom foam inserts, bulk orders, and technical support.",
  alternates: {
    canonical: "/contact",
  },
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "For general inquiries and support",
    value: "hello@cutmycase.com",
    href: "mailto:hello@cutmycase.com",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Mon-Fri, 9am-5pm CT",
    value: "1-800-555-1234",
    href: "tel:+18005551234",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Made with precision in",
    value: "Texas, USA",
    href: null,
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond within",
    value: "24 hours",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading mb-4">
              Get in Touch
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Have a question about custom foam inserts? Need help with your
              order? We&apos;re here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
              <h2 className="text-2xl font-heading mb-6">Send us a message</h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-zinc-300 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-zinc-300 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="bulk">Bulk/Wholesale Orders</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactMethods.map((method) => (
                  <div
                    key={method.title}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <method.icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{method.title}</h3>
                        <p className="text-sm text-zinc-500 mb-1">
                          {method.description}
                        </p>
                        {method.href ? (
                          <a
                            href={method.href}
                            className="text-orange-500 hover:underline"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <span className="text-white">{method.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Link */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Check our FAQ</h3>
                    <p className="text-sm text-zinc-400 mb-3">
                      Find instant answers to common questions about orders,
                      shipping, materials, and more.
                    </p>
                    <Link
                      href="/faq"
                      className="text-orange-500 hover:underline text-sm"
                    >
                      View FAQ →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bulk Orders */}
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-lg p-6">
                <h3 className="font-heading text-xl mb-2">
                  Bulk & Enterprise Orders
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Need custom foam for 5+ cases? We offer volume discounts and
                  dedicated support for businesses, departments, and
                  organizations.
                </p>
                <a
                  href="mailto:sales@cutmycase.com"
                  className="text-orange-500 hover:underline"
                >
                  sales@cutmycase.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
