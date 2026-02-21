import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Case Details | CutMyCase",
};

export default function CaseDetailPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-heading mb-4">Coming Soon</h1>
          <p className="text-text-secondary mb-8">
            Case ordering will be available soon via our Shopify store.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/cases">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cases
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
