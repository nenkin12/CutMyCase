import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Check, Ruler, Package, Shield } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      foamOptions: {
        orderBy: { price: "asc" },
      },
    },
  });

  return product;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Case Not Found | CutMyCase" };
  }

  return {
    title: `${product.brand} ${product.name} | CutMyCase`,
    description: product.description,
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/cases"
            className="inline-flex items-center text-text-secondary hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-carbon rounded-[4px] overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Package className="w-24 h-24" />
                  </div>
                )}
              </div>

              {product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image: string, i: number) => (
                    <div
                      key={i}
                      className="aspect-square bg-carbon rounded-[4px] overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-2">{product.brand}</Badge>
                <h1 className="text-4xl font-heading mb-4">{product.name}</h1>
                <p className="text-text-secondary">{product.description}</p>
              </div>

              {/* Price */}
              <div className="bg-carbon rounded-[4px] p-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-heading">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="text-text-muted">Case only</span>
                </div>

                <AddToCartButton product={product} />
              </div>

              {/* Dimensions */}
              <div className="bg-carbon rounded-[4px] p-6">
                <h3 className="font-heading text-lg mb-4 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-accent" />
                  Dimensions
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted mb-1">Interior (L x W x D)</p>
                    <p className="font-medium">
                      {product.interiorLength}" x {product.interiorWidth}" x {product.interiorDepth}"
                    </p>
                  </div>
                  {product.exteriorLength && (
                    <div>
                      <p className="text-text-muted mb-1">Exterior (L x W x D)</p>
                      <p className="font-medium">
                        {product.exteriorLength}" x {product.exteriorWidth}" x {product.exteriorDepth}"
                      </p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <p className="text-text-muted mb-1">Weight</p>
                      <p className="font-medium">{product.weight} lbs</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {product.features.length > 0 && (
                <div className="bg-carbon rounded-[4px] p-6">
                  <h3 className="font-heading text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    Features
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Custom Foam CTA */}
              <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-[4px] p-6 border border-accent/30">
                <h3 className="font-heading text-lg mb-2">
                  Want Custom Foam for This Case?
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Upload your gear and we&apos;ll design a perfect-fit foam insert.
                </p>
                <Link href="/upload">
                  <Button variant="outline" className="w-full">
                    Design Custom Foam
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
