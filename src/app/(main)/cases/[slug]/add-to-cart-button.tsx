"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { ShoppingCart, Check } from "lucide-react";

interface FoamOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isDefault: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  basePrice: number;
  foamOptions: FoamOption[];
}

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const [selectedFoamId, setSelectedFoamId] = useState<string | null>(
    product.foamOptions.find((f) => f.isDefault)?.id || null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const selectedFoam = product.foamOptions.find((f) => f.id === selectedFoamId);
  const totalPrice = product.basePrice + (selectedFoam?.price || 0);

  const handleAddToCart = () => {
    setIsAdding(true);

    addItem({
      productId: product.id,
      productName: `${product.brand} ${product.name}`,
      productImage: product.image,
      foamOptionId: selectedFoam?.id,
      foamOptionName: selectedFoam?.name,
      uploadId: undefined,
      isCustomCut: false,
      quantity: 1,
      unitPrice: totalPrice,
    });

    setIsAdded(true);
    setIsAdding(false);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="space-y-4">
      {/* Foam Options */}
      {product.foamOptions.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Foam Option</label>
          <div className="space-y-2">
            {product.foamOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFoamId(option.id)}
                className={cn(
                  "w-full p-3 rounded-[4px] text-left transition-colors flex items-center justify-between",
                  selectedFoamId === option.id
                    ? "bg-accent/20 border border-accent"
                    : "bg-dark border border-transparent hover:border-accent/50"
                )}
              >
                <div>
                  <div className="font-medium text-sm">{option.name}</div>
                  {option.description && (
                    <div className="text-xs text-text-muted">
                      {option.description}
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  {option.price === 0
                    ? "Included"
                    : `+${formatPrice(option.price)}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Foam Option */}
      <button
        onClick={() => setSelectedFoamId(null)}
        className={cn(
          "w-full p-3 rounded-[4px] text-left transition-colors flex items-center justify-between",
          selectedFoamId === null
            ? "bg-accent/20 border border-accent"
            : "bg-dark border border-transparent hover:border-accent/50"
        )}
      >
        <div>
          <div className="font-medium text-sm">Case Only (No Foam)</div>
          <div className="text-xs text-text-muted">
            Just the case, no foam insert
          </div>
        </div>
        <div className="text-sm">-</div>
      </button>

      {/* Total */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-text-secondary">Total</span>
        <span className="text-2xl font-heading">{formatPrice(totalPrice)}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleAddToCart}
          isLoading={isAdding}
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
        <Button className="flex-1" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}
