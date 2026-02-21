import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-heading mb-4">Account</h1>
          <p className="text-text-secondary mb-8">
            User accounts will be available soon when we integrate with Shopify.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/upload">
              <Button>
                Design Custom Foam
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
