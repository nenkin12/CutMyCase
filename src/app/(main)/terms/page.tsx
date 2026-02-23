import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "CutMyCase terms of service. Read our terms and conditions for using our custom foam insert design and manufacturing services.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading mb-2">Terms of Service</h1>
          <p className="text-zinc-500 mb-8">Last updated: February 2024</p>

          <div className="prose prose-invert prose-zinc max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Agreement to Terms
              </h2>
              <p className="text-zinc-400 mb-4">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding
                agreement between you and CutMyCase (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;) concerning your access to and use of the cutmycase.com
                website and our custom foam insert design and manufacturing
                services.
              </p>
              <p className="text-zinc-400">
                By accessing or using our services, you agree to be bound by
                these Terms. If you disagree with any part of these terms, you
                may not access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Services Description
              </h2>
              <p className="text-zinc-400 mb-4">
                CutMyCase provides:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>
                  AI-powered image analysis to generate foam insert designs from
                  user-uploaded photographs
                </li>
                <li>
                  A web-based design tool for arranging and customizing foam
                  layouts
                </li>
                <li>
                  CNC manufacturing of custom foam inserts based on approved
                  designs
                </li>
                <li>
                  Shipping of completed foam inserts to customers
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                User Accounts
              </h2>
              <p className="text-zinc-400 mb-4">
                To access certain features, you may need to create an account.
                You agree to:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>
                  Notify us immediately of any unauthorized access
                </li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
              </ul>
              <p className="text-zinc-400 mt-4">
                We reserve the right to suspend or terminate accounts that
                violate these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Orders and Payment
              </h2>

              <h3 className="text-xl font-medium mt-6 mb-3">Pricing</h3>
              <p className="text-zinc-400 mb-4">
                All prices are displayed in US dollars and are subject to change
                without notice. Prices shown at checkout are final and include
                the cost of materials and manufacturing. Shipping costs are
                calculated separately.
              </p>

              <h3 className="text-xl font-medium mt-6 mb-3">Payment</h3>
              <p className="text-zinc-400 mb-4">
                We accept major credit cards and other payment methods as
                displayed at checkout. Payment is processed securely through our
                third-party payment processor. By providing payment information,
                you represent that you are authorized to use the payment method.
              </p>

              <h3 className="text-xl font-medium mt-6 mb-3">
                Order Acceptance
              </h3>
              <p className="text-zinc-400">
                Your order constitutes an offer to purchase. We reserve the
                right to refuse or cancel any order for any reason, including
                pricing errors, suspected fraud, or product availability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Custom Products
              </h2>
              <p className="text-zinc-400 mb-4">
                Due to the custom nature of our products:
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>
                  <strong>Design Approval:</strong> You are responsible for
                  reviewing and approving your design before ordering. Once an
                  order is placed, the design cannot be modified.
                </li>
                <li>
                  <strong>No Returns for Buyer&apos;s Remorse:</strong> Custom foam
                  inserts cannot be returned or refunded simply because you
                  changed your mind.
                </li>
                <li>
                  <strong>Fit Guarantee:</strong> We guarantee that foam will be
                  manufactured according to your approved design specifications.
                  If there is a manufacturing defect, we will remake the foam at
                  no cost.
                </li>
                <li>
                  <strong>Tolerances:</strong> CNC cutting has a tolerance of +/-
                  0.1 inches. Minor variations within this tolerance are not
                  considered defects.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Shipping and Delivery
              </h2>
              <p className="text-zinc-400 mb-4">
                Shipping times are estimates and not guaranteed. We are not
                responsible for delays caused by carriers, customs, or events
                outside our control. Risk of loss passes to you upon delivery to
                the carrier.
              </p>
              <p className="text-zinc-400">
                You are responsible for providing accurate shipping information.
                Additional charges may apply for reshipments due to incorrect
                addresses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Intellectual Property
              </h2>

              <h3 className="text-xl font-medium mt-6 mb-3">Our Content</h3>
              <p className="text-zinc-400 mb-4">
                The CutMyCase website, including its design, text, graphics,
                logos, and software, is owned by CutMyCase and protected by
                intellectual property laws. You may not copy, modify, or
                distribute our content without permission.
              </p>

              <h3 className="text-xl font-medium mt-6 mb-3">Your Content</h3>
              <p className="text-zinc-400 mb-4">
                You retain ownership of images you upload. By uploading images,
                you grant us a license to process, store, and use them to
                provide our services. You represent that you have the right to
                upload any images you submit.
              </p>

              <h3 className="text-xl font-medium mt-6 mb-3">Designs</h3>
              <p className="text-zinc-400">
                Foam designs created using our service are for your personal or
                business use. You may not resell or commercially distribute the
                design files or our design software.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Prohibited Uses
              </h2>
              <p className="text-zinc-400 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li>Use our services for any unlawful purpose</li>
                <li>Upload malicious content or attempt to hack our systems</li>
                <li>Interfere with the operation of our services</li>
                <li>Impersonate others or provide false information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>
                  Upload images containing illegal content or content you don&apos;t
                  have rights to
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Limitation of Liability
              </h2>
              <p className="text-zinc-400 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CUTMYCASE SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR SERVICES.
              </p>
              <p className="text-zinc-400">
                Our total liability for any claim arising from these Terms or
                our services shall not exceed the amount you paid for the
                specific product or service giving rise to the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-zinc-400">
                OUR SERVICES ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY
                KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT OUR SERVICES
                WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. WE
                DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Indemnification
              </h2>
              <p className="text-zinc-400">
                You agree to indemnify and hold harmless CutMyCase and its
                officers, directors, employees, and agents from any claims,
                damages, or expenses arising from your use of our services,
                violation of these Terms, or infringement of any third-party
                rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Governing Law
              </h2>
              <p className="text-zinc-400">
                These Terms shall be governed by and construed in accordance
                with the laws of the State of Texas, without regard to conflict
                of law principles. Any disputes shall be resolved in the courts
                located in Texas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Changes to Terms
              </h2>
              <p className="text-zinc-400">
                We reserve the right to modify these Terms at any time. Changes
                will be effective immediately upon posting. Your continued use
                of our services after changes constitutes acceptance of the
                modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-orange-500 mb-4">
                Contact Information
              </h2>
              <p className="text-zinc-400 mb-4">
                For questions about these Terms, please contact us:
              </p>
              <ul className="text-zinc-400 space-y-2">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:legal@cutmycase.com"
                    className="text-orange-500 hover:underline"
                  >
                    legal@cutmycase.com
                  </a>
                </li>
                <li>Mail: CutMyCase, Attn: Legal, Texas, USA</li>
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
