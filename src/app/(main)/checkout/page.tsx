"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-3xl font-heading mb-4">Checkout Coming Soon</h1>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            We&apos;re integrating with Shopify for a seamless checkout experience.
            For now, you can design your custom foam layout.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/cart">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <Link href="/upload">
              <Button>
                Design Custom Foam
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
