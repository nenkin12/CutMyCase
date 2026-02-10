import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  products: [
    { href: "/cases", label: "All Cases" },
    { href: "/cases?category=pelican", label: "Pelican Cases" },
    { href: "/upload", label: "Custom Foam" },
  ],
  support: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
    { href: "/shipping", label: "Shipping Info" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/returns", label: "Return Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-[2px] flex items-center justify-center">
                <span className="text-white font-heading text-lg">C</span>
              </div>
              <span className="font-heading text-xl tracking-wider">CUTMYCASE</span>
            </Link>
            <p className="text-text-secondary text-sm">
              Precision custom foam inserts for your gear. AI-powered design, CNC cut perfection.
            </p>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <span>support@cutmycase.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <span>1-800-CUT-FOAM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Austin, TX</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-lg mb-4">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} CutMyCase. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">
              Made with precision in Texas
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
