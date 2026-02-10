"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { OutlineResult } from "@/lib/ai/process-image";

interface StepCaseSelectProps {
  uploadId: string;
  outlines: OutlineResult;
  tolerance: number;
  onComplete: (caseId: string | null) => void;
  onBack: () => void;
}

interface CaseProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  interiorLength: number;
  interiorWidth: number;
  interiorDepth: number;
  basePrice: number;
  customCutPrice: number;
  fits: boolean;
}

export function StepCaseSelect({
  uploadId,
  outlines,
  tolerance,
  onComplete,
  onBack,
}: StepCaseSelectProps) {
  const router = useRouter();
  const [cases, setCases] = useState<CaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [hasOwnCase, setHasOwnCase] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cases/compatible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlines,
          tolerance,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.cases);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    try {
      if (hasOwnCase) {
        // Just custom foam cut
        addItem({
          productId: undefined,
          productName: "Custom Foam Cut Only",
          foamOptionId: undefined,
          foamOptionName: "Custom Cut",
          uploadId,
          isCustomCut: true,
          quantity: 1,
          unitPrice: 4999, // $49.99 for foam only
        });
      } else if (selectedCase) {
        const caseProduct = cases.find((c) => c.id === selectedCase);
        if (caseProduct) {
          addItem({
            productId: caseProduct.id,
            productName: `${caseProduct.brand} ${caseProduct.name}`,
            productImage: caseProduct.image,
            foamOptionId: undefined,
            foamOptionName: "Custom Cut Foam",
            uploadId,
            isCustomCut: true,
            quantity: 1,
            unitPrice: caseProduct.basePrice + caseProduct.customCutPrice,
          });
        }
      }

      onComplete(selectedCase);
      router.push("/cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-xl font-heading mb-2">Finding Compatible Cases</h3>
        <p className="text-text-secondary">
          Checking which cases fit your gear...
        </p>
      </div>
    );
  }

  const compatibleCases = cases.filter((c) => c.fits);
  const incompatibleCases = cases.filter((c) => !c.fits);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-heading mb-2">Select Your Case</h2>
        <p className="text-text-secondary">
          Choose a case for your custom foam or use your own
        </p>
      </div>

      {/* Own Case Option */}
      <button
        onClick={() => {
          setHasOwnCase(true);
          setSelectedCase(null);
        }}
        className={cn(
          "w-full p-6 rounded-[4px] border text-left transition-colors",
          hasOwnCase
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/50"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-carbon rounded-[4px] flex items-center justify-center">
            <Package className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg">I Have My Own Case</h3>
            <p className="text-sm text-text-secondary">
              Order just the custom-cut foam insert
            </p>
          </div>
          <div className="text-right">
            <div className="font-heading text-xl">{formatPrice(4999)}</div>
            <div className="text-xs text-text-muted">Foam only</div>
          </div>
          {hasOwnCase && (
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </button>

      {/* Compatible Cases */}
      {compatibleCases.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            Compatible Cases ({compatibleCases.length})
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {compatibleCases.map((caseProduct) => (
              <button
                key={caseProduct.id}
                onClick={() => {
                  setSelectedCase(caseProduct.id);
                  setHasOwnCase(false);
                }}
                className={cn(
                  "p-4 rounded-[4px] border text-left transition-colors",
                  selectedCase === caseProduct.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-carbon rounded-[4px] flex-shrink-0">
                    {caseProduct.image && (
                      <img
                        src={caseProduct.image}
                        alt={caseProduct.name}
                        className="w-full h-full object-cover rounded-[4px]"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {caseProduct.brand}
                        </Badge>
                        <h4 className="font-medium truncate">{caseProduct.name}</h4>
                      </div>
                      {selectedCase === caseProduct.id && (
                        <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Interior: {caseProduct.interiorLength}" x {caseProduct.interiorWidth}" x {caseProduct.interiorDepth}"
                    </p>
                    <div className="mt-2">
                      <span className="font-heading text-lg">
                        {formatPrice(caseProduct.basePrice + caseProduct.customCutPrice)}
                      </span>
                      <span className="text-xs text-text-muted ml-2">
                        Case + Custom Foam
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Incompatible Cases */}
      {incompatibleCases.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg flex items-center gap-2 text-text-muted">
            <AlertCircle className="w-5 h-5" />
            Too Small ({incompatibleCases.length})
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 opacity-50">
            {incompatibleCases.slice(0, 4).map((caseProduct) => (
              <div
                key={caseProduct.id}
                className="p-4 rounded-[4px] border border-border"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-carbon rounded-[4px] flex-shrink-0" />
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-1">
                      {caseProduct.brand}
                    </Badge>
                    <h4 className="font-medium">{caseProduct.name}</h4>
                    <p className="text-xs text-text-muted mt-1">
                      Too small for your gear
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleAddToCart}
          disabled={!selectedCase && !hasOwnCase}
          isLoading={isAddingToCart}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
