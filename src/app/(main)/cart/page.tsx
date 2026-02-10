"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-heading mb-8">Your Cart</h1>
            <div className="animate-pulse">
              <div className="h-32 bg-carbon rounded-[4px] mb-4" />
              <div className="h-32 bg-carbon rounded-[4px] mb-4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = subtotal > 10000 ? 0 : 999; // Free shipping over $100
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading">Your Cart</h1>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear Cart
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-heading mb-2">Your Cart is Empty</h2>
              <p className="text-text-secondary mb-6">
                Add some cases or custom foam to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cases">
                  <Button variant="secondary">Browse Cases</Button>
                </Link>
                <Link href="/upload">
                  <Button>Design Custom Foam</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-[4px] p-4 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-carbon rounded-[4px] flex-shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-[4px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{item.productName}</h3>
                          {item.foamOptionName && (
                            <Badge variant="secondary" className="mt-1">
                              {item.foamOptionName}
                            </Badge>
                          )}
                          {item.isCustomCut && (
                            <Badge className="mt-1">Custom Cut</Badge>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-text-muted hover:text-error transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-carbon rounded-[4px] flex items-center justify-center hover:bg-accent/20 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-carbon rounded-[4px] flex items-center justify-center hover:bg-accent/20 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-heading text-lg">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-[4px] p-6 sticky top-24">
                  <h2 className="font-heading text-xl mb-6">Order Summary</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-success">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-text-muted">
                        Free shipping on orders over $100
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border my-4" />

                  <div className="flex justify-between text-lg font-medium mb-6">
                    <span>Total</span>
                    <span className="font-heading">{formatPrice(total)}</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push("/checkout")}
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-text-muted text-center mt-4">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
