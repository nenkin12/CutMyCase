import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Cases | CutMyCase",
  description: "Browse our selection of premium cases with custom foam inserts.",
};

// Static case data - will be replaced with Shopify products
const cases = [
  {
    id: "1",
    slug: "pelican-1510",
    name: "Pelican 1510",
    brand: "Pelican",
    description: "Carry-on sized protective case with wheels and extendable handle. Perfect for travel.",
    image: "https://www.pelican.com/media/catalog/product/cache/a2e18f84d3da1edc3758c78ce63a0dc4/p/e/pelican-1510-protector-carry-on-case-background_1.jpg",
    basePrice: 18999,
    interiorLength: 19.75,
    interiorWidth: 11,
    interiorDepth: 7.6,
  },
  {
    id: "2",
    slug: "pelican-1600",
    name: "Pelican 1600",
    brand: "Pelican",
    description: "Large protective case ideal for camera equipment and sensitive gear.",
    image: "https://www.pelican.com/media/catalog/product/cache/a2e18f84d3da1edc3758c78ce63a0dc4/p/e/pelican_1600_background.jpg",
    basePrice: 26999,
    interiorLength: 21.43,
    interiorWidth: 16.5,
    interiorDepth: 7.87,
  },
  {
    id: "3",
    slug: "pelican-1650",
    name: "Pelican 1650",
    brand: "Pelican",
    description: "Extra large protective case with wheels. Great for large equipment sets.",
    image: "https://www.pelican.com/media/catalog/product/cache/a2e18f84d3da1edc3758c78ce63a0dc4/p/e/pelican_1650_background.jpg",
    basePrice: 39999,
    interiorLength: 28.57,
    interiorWidth: 17.52,
    interiorDepth: 10.65,
  },
  {
    id: "4",
    slug: "pelican-air-1615",
    name: "Pelican Air 1615",
    brand: "Pelican",
    description: "Lightweight yet durable. Up to 40% lighter than standard Pelican cases.",
    image: "https://www.pelican.com/media/catalog/product/cache/a2e18f84d3da1edc3758c78ce63a0dc4/p/e/pelican_1615_background.jpg",
    basePrice: 34999,
    interiorLength: 29.59,
    interiorWidth: 15.5,
    interiorDepth: 9.38,
  },
];

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading mb-2">Cases</h1>
            <p className="text-text-secondary">
              Premium cases with custom foam inserts
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((product) => (
              <div
                key={product.id}
                className="group"
              >
                <div className="bg-card border border-border rounded-[4px] overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-carbon relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4">
                      {product.brand}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-heading text-xl mb-1">
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
                          + foam
                        </span>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
