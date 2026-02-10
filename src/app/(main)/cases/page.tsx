import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Filter, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Cases | CutMyCase",
  description: "Browse our selection of premium cases with custom foam inserts.",
};

export const dynamic = "force-dynamic";

type ProductWithOptions = Awaited<ReturnType<typeof db.product.findMany>>;

async function getCases(): Promise<ProductWithOptions> {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      foamOptions: true,
    },
    orderBy: { basePrice: "asc" },
  });

  return products;
}

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-heading mb-2">Cases</h1>
              <p className="text-text-secondary">
                Premium cases with optional custom foam inserts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Product Grid */}
          {cases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((product) => (
                <Link
                  key={product.id}
                  href={`/cases/${product.slug}`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-[4px] overflow-hidden hover:border-accent/50 transition-colors">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-carbon relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          No image
                        </div>
                      )}
                      <Badge className="absolute top-4 left-4">
                        {product.brand}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-heading text-xl mb-1 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Dimensions */}
                      <p className="text-xs text-text-muted mb-3">
                        Interior: {product.interiorLength}" x {product.interiorWidth}" x {product.interiorDepth}"
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-heading text-xl">
                            {formatPrice(product.basePrice)}
                          </span>
                          <span className="text-xs text-text-muted ml-2">
                            + foam options
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-text-muted mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-heading mb-2">No Cases Yet</h3>
              <p className="text-text-secondary mb-6">
                Check back soon for our case selection.
              </p>
              <Link href="/upload">
                <Button>Upload Your Own Gear</Button>
              </Link>
            </div>
          )}

          {/* Custom Foam CTA */}
          <div className="mt-16 bg-gradient-to-r from-carbon to-dark rounded-[4px] border border-border p-8 text-center">
            <h2 className="text-3xl font-heading mb-4">Have Your Own Case?</h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Upload a photo of your gear and we&apos;ll create a custom foam insert
              that fits your existing case perfectly.
            </p>
            <Link href="/upload">
              <Button size="lg">
                Get Custom Foam Only
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
