import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about CutMyCase custom foam inserts. Learn about our AI-powered design process, materials, pricing, and shipping.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How does CutMyCase work?",
        a: "It's simple: 1) Upload a photo of your gear with a reference object (like a credit card) for scale. 2) Our AI automatically detects each item and creates precise outlines. 3) Arrange your items in your case layout. 4) We CNC-cut your custom foam and ship it to your door.",
      },
      {
        q: "What do I need to take a good photo?",
        a: "Lay your gear flat on a contrasting background (dark items on light surface or vice versa). Include a reference object like a credit card, dollar bill, or ruler for scale calibration. Make sure the photo is well-lit and taken from directly above.",
      },
      {
        q: "How accurate is the AI detection?",
        a: "Our AI achieves 99.8% accuracy on item detection. You can always manually adjust outlines, add smoothing, or modify shapes before finalizing your design. We recommend reviewing and approving the design before ordering.",
      },
      {
        q: "Can I design foam for a case I already own?",
        a: "Absolutely! Just select your case model from our database or enter custom dimensions. We support Pelican, Nanuk, SKB, Plano, Apache, Seahorse, HPRC, Explorer, and many more brands.",
      },
    ],
  },
  {
    category: "Materials & Quality",
    questions: [
      {
        q: "What type of foam do you use?",
        a: "We use high-density polyethylene (HDPE) foam, the same material used by premium case manufacturers. It's durable, water-resistant, and provides excellent protection for your gear.",
      },
      {
        q: "How deep are the cutouts?",
        a: "You can customize the depth for each item. Standard foam is 2 inches thick, but we offer various thicknesses. For items that need more depth, we can create multi-layer foam sets.",
      },
      {
        q: "What colors are available?",
        a: "We offer charcoal gray (standard), black, and orange foam. Custom colors may be available for bulk orders - contact us for details.",
      },
      {
        q: "How precise is the CNC cutting?",
        a: "Our CNC machines achieve +/- 0.1 inch tolerance, ensuring your gear fits snugly without being too tight. We also add a small clearance (configurable) for easy insertion and removal.",
      },
    ],
  },
  {
    category: "Pricing & Orders",
    questions: [
      {
        q: "How much does custom foam cost?",
        a: "Pricing depends on the foam size and complexity of your design. Simple designs start around $49. You'll see the exact price before checkout. The AI design process is completely free.",
      },
      {
        q: "Is the design process free?",
        a: "Yes! You can upload photos, create designs, and experiment with layouts at no cost. You only pay when you order the physical foam.",
      },
      {
        q: "Can I save my design and order later?",
        a: "Yes, create a free account to save unlimited designs. You can revisit, modify, and order them anytime.",
      },
      {
        q: "Do you offer bulk pricing?",
        a: "Yes, we offer discounts for orders of 5+ units. Contact our sales team for custom quotes on large orders.",
      },
    ],
  },
  {
    category: "Shipping & Returns",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Most orders ship within 48 hours of approval. Standard shipping is 3-5 business days. Expedited options are available at checkout.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we ship within the United States. International shipping is coming soon - sign up for our newsletter to be notified.",
      },
      {
        q: "What if my foam doesn't fit?",
        a: "We guarantee a perfect fit. If there's an issue with your foam due to our manufacturing, we'll remake it for free. Contact us within 30 days of delivery.",
      },
      {
        q: "Can I return or exchange my foam?",
        a: "Due to the custom nature of our products, we cannot accept returns for buyer's remorse. However, we'll replace any foam that has manufacturing defects at no cost.",
      },
    ],
  },
  {
    category: "Case Compatibility",
    questions: [
      {
        q: "Which case brands do you support?",
        a: "We support all major brands including Pelican, Nanuk, SKB, Plano, Apache (Harbor Freight), Seahorse, HPRC, Explorer, Condition 1, Eylar, and more. You can also enter custom dimensions for any case.",
      },
      {
        q: "Can I get foam for a non-standard case?",
        a: "Yes! Enter your case's interior dimensions (length, width, depth) and we'll create foam to fit. This works for any rectangular case.",
      },
      {
        q: "Do you sell cases too?",
        a: "We're currently focused on custom foam inserts. Case sales are coming soon. For now, we recommend purchasing cases directly from manufacturers or authorized retailers.",
      },
    ],
  },
];

// JSON-LD for FAQ page
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((category) =>
    category.questions.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Everything you need to know about CutMyCase custom foam inserts.
              Can&apos;t find what you&apos;re looking for?{" "}
              <Link href="/contact" className="text-orange-500 hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {faqs.map((category) => (
              <section key={category.category}>
                <h2 className="text-2xl font-heading text-orange-500 mb-6 pb-2 border-b border-zinc-800">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <details
                      key={index}
                      className="group bg-zinc-900 border border-zinc-800 rounded-lg"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                        <span className="font-medium pr-4">{faq.q}</span>
                        <ChevronDown className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-4 pb-4 text-zinc-400">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h2 className="text-2xl font-heading mb-4">Still have questions?</h2>
            <p className="text-zinc-400 mb-6">
              Our team is here to help. Get in touch and we&apos;ll respond within 24
              hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline" size="lg">
                  Try It Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
