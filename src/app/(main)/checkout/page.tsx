"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Lock, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items.length, router]);

  if (!mounted) {
    return null;
  }

  const subtotal = getSubtotal();
  const shipping = subtotal > 10000 ? 0 : 999;
  const tax = Math.round(subtotal * 0.0825); // 8.25% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to process checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/cart")}
            className="inline-flex items-center text-text-secondary hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>

          <h1 className="text-4xl font-heading mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Shipping Form */}
            <div>
              <div className="bg-card border border-border rounded-[4px] p-6">
                <h2 className="font-heading text-xl mb-6">Shipping Information</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    name="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="zip"
                      placeholder="ZIP"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-error/10 border border-error/30 rounded-[4px] text-error text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay {formatPrice(total)}
                  </Button>

                  <p className="text-xs text-text-muted text-center flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Secure checkout powered by Stripe
                  </p>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card border border-border rounded-[4px] p-6 sticky top-24">
                <h2 className="font-heading text-xl mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-carbon rounded-[4px] flex-shrink-0">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-[4px]"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.productName}
                        </h4>
                        {item.foamOptionName && (
                          <p className="text-xs text-text-muted">
                            {item.foamOptionName}
                          </p>
                        )}
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-text-muted">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
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
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span className="font-heading">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
