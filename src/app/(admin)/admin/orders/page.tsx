import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="CutMyCase" className="w-8 h-8 rounded" />
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/designs" className="text-text-secondary hover:text-white">
                Designs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-heading">Orders</h1>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-heading mb-2">Coming Soon</h2>
            <p className="text-text-secondary max-w-md mx-auto">
              Order management will be available when we integrate with Shopify.
              For now, view scanned designs in the Designs section.
            </p>
            <Link href="/admin/designs" className="inline-block mt-6">
              <Button>View Designs</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
