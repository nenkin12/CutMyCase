import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CutMyCase privacy policy. Learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 mb-8">Last updated: February 2024</p>

          <div className="prose prose-invert prose-zinc max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Introduction
              </h2>
              <p className="text-zinc-400 mb-4">
                CutMyCase (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our
                website cutmycase.com and use our services.
              </p>
              <p className="text-zinc-400">
                Please read this privacy policy carefully. If you do not agree
                with the terms of this privacy policy, please do not access the
                site or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Information We Collect
              </h2>

              <h3 className="text-xl font-medium mt-6 mb-3">
                Personal Information
              </h3>
              <p className="text-zinc-400 mb-4">
                We may collect personal information that you voluntarily provide
                when you:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2 mb-4">
                <li>Create an account</li>
                <li>Place an order</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for support</li>
                <li>Upload images for foam design</li>
              </ul>
              <p className="text-zinc-400">
                This information may include your name, email address, mailing
                address, phone number, and payment information.
              </p>

              <h3 className="text-xl font-medium mt-6 mb-3">
                Automatically Collected Information
              </h3>
              <p className="text-zinc-400 mb-4">
                When you visit our website, we automatically collect certain
                information, including:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
              </ul>

              <h3 className="text-xl font-medium mt-6 mb-3">
                Images and Design Data
              </h3>
              <p className="text-zinc-400">
                When you upload photos for foam design, we process these images
                using AI to generate outlines and measurements. We store your
                designs to enable you to revisit and modify them. Images are
                processed securely and are not shared with third parties except
                as necessary to fulfill your order.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-zinc-400 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Create and manage your account</li>
                <li>Generate custom foam designs from your images</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Information Sharing
              </h2>
              <p className="text-zinc-400 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>
                  <strong>Service Providers:</strong> Third parties that help us
                  operate our business (payment processors, shipping carriers,
                  cloud storage)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets
                </li>
              </ul>
              <p className="text-zinc-400 mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Data Security
              </h2>
              <p className="text-zinc-400">
                We implement appropriate technical and organizational security
                measures to protect your personal information. However, no
                method of transmission over the Internet is 100% secure. While
                we strive to protect your data, we cannot guarantee absolute
                security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-zinc-400 mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze website traffic</li>
                <li>Deliver relevant advertisements</li>
              </ul>
              <p className="text-zinc-400 mt-4">
                You can control cookies through your browser settings. Disabling
                cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Your Rights
              </h2>
              <p className="text-zinc-400 mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability</li>
              </ul>
              <p className="text-zinc-400 mt-4">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:privacy@cutmycase.com"
                  className="text-orange-500 hover:underline"
                >
                  privacy@cutmycase.com
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-zinc-400">
                Our services are not intended for children under 13 years of
                age. We do not knowingly collect personal information from
                children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-zinc-400">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Contact Us
              </h2>
              <p className="text-zinc-400 mb-4">
                If you have questions about this Privacy Policy, please contact
                us:
              </p>
              <ul className="text-zinc-400 space-y-2">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:privacy@cutmycase.com"
                    className="text-orange-500 hover:underline"
                  >
                    privacy@cutmycase.com
                  </a>
                </li>
                <li>
                  Mail: CutMyCase, Attn: Privacy, Texas, USA
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800">
            <Link href="/" className="text-orange-500 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
