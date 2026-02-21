"use client";

import { useState } from "react";
import { ArrowLeft, Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutItem {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
}

interface StepCheckoutProps {
  layoutItems: LayoutItem[];
  selectedCaseId: string;
  caseName: string;
  caseWidth: number;
  caseHeight: number;
  onComplete: () => void;
  onBack: () => void;
}

type CaseOption = "need-case" | "have-case" | null;

export function StepCheckout({
  layoutItems,
  selectedCaseId,
  caseName,
  caseWidth,
  caseHeight,
  onComplete,
  onBack,
}: StepCheckoutProps) {
  const [caseOption, setCaseOption] = useState<CaseOption>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleContinue = () => {
    if (caseOption) {
      setShowCheckout(true);
    }
  };

  if (showCheckout) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-heading mb-2">Order Summary</h2>
          <p className="text-text-secondary">
            Review your custom foam insert order
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-carbon rounded-[4px] p-6 space-y-4">
          <h3 className="font-heading text-lg border-b border-border pb-2">Order Details</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Custom Foam Insert</span>
              <span className="font-medium">1x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Case: {caseName}</span>
              <span className="text-text-muted">{caseWidth}" × {caseHeight}"</span>
            </div>
            <div className="space-y-1 text-sm border-t border-border/50 pt-2 mt-2">
              <span className="text-text-muted block mb-2">Cutouts: {layoutItems.length} items</span>
              {layoutItems.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-text-muted pl-2">
                  <span>{item.name}</span>
                  <span>{item.width.toFixed(1)}" × {item.height.toFixed(1)}" × {item.depth.toFixed(1)}" deep</span>
                </div>
              ))}
            </div>

            {caseOption === "need-case" && (
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-text-secondary">{caseName} Case</span>
                <span className="font-medium">1x</span>
              </div>
            )}
          </div>
        </div>

        {/* Delay Notice */}
        <div className="bg-warning/10 border border-warning/30 rounded-[4px] p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-warning/20 rounded-full">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-warning mb-2">
                Extended Lead Times
              </h3>
              <p className="text-text-secondary mb-3">
                Due to high demand and backed up orders, we are currently experiencing longer than usual processing times.
              </p>
              <div className="bg-dark/50 rounded-[4px] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm">Estimated processing: <strong>3-4 weeks</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">Shipping time additional</span>
                </div>
              </div>
              <p className="text-sm text-text-muted mt-3">
                We appreciate your patience and understanding. Quality craftsmanship takes time!
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-accent/10 border border-accent/30 rounded-[4px] p-6 text-center">
          <h3 className="font-heading text-xl text-accent mb-2">
            Online Checkout Coming Soon
          </h3>
          <p className="text-text-secondary mb-4">
            We're working on our online ordering system. In the meantime, please contact us directly to place your order.
          </p>
          <Button variant="default" size="lg">
            Contact Us to Order
          </Button>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setShowCheckout(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading mb-2">Almost There!</h2>
        <p className="text-text-secondary text-sm sm:text-base">
          Do you need a case or do you already have one?
        </p>
      </div>

      {/* Case Options */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        <button
          onClick={() => setCaseOption("have-case")}
          className={cn(
            "p-6 rounded-[4px] border-2 text-left transition-all",
            caseOption === "have-case"
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50 bg-carbon"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-full",
              caseOption === "have-case" ? "bg-accent/20" : "bg-dark"
            )}>
              <CheckCircle className={cn(
                "w-6 h-6",
                caseOption === "have-case" ? "text-accent" : "text-text-muted"
              )} />
            </div>
            <div>
              <h3 className="font-heading text-lg mb-1">I Have a Case</h3>
              <p className="text-sm text-text-secondary">
                I already own a {caseName} and just need the custom foam insert.
              </p>
            </div>
          </div>
          {caseOption === "have-case" && (
            <div className="mt-4 pt-4 border-t border-accent/30">
              <p className="text-sm text-accent">
                Great! We'll create a custom foam insert to fit your existing case.
              </p>
            </div>
          )}
        </button>

        <button
          onClick={() => setCaseOption("need-case")}
          className={cn(
            "p-6 rounded-[4px] border-2 text-left transition-all",
            caseOption === "need-case"
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50 bg-carbon"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-full",
              caseOption === "need-case" ? "bg-accent/20" : "bg-dark"
            )}>
              <Package className={cn(
                "w-6 h-6",
                caseOption === "need-case" ? "text-accent" : "text-text-muted"
              )} />
            </div>
            <div>
              <h3 className="font-heading text-lg mb-1">I Need a Case</h3>
              <p className="text-sm text-text-secondary">
                I'd like to purchase a {caseName} along with the custom foam insert.
              </p>
            </div>
          </div>
          {caseOption === "need-case" && (
            <div className="mt-4 pt-4 border-t border-accent/30">
              <p className="text-sm text-accent">
                We'll bundle the case with your custom foam insert.
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Selected Case Info */}
      <div className="bg-carbon rounded-[4px] p-4 max-w-2xl mx-auto">
        <h3 className="font-heading text-sm mb-3 text-text-muted">Selected Case</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{caseName}</p>
            <p className="text-sm text-text-muted">
              Interior: {caseWidth}" × {caseHeight}"
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">{layoutItems.length} items</p>
            <p className="text-xs text-text-muted">will be cut</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between max-w-2xl mx-auto">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Layout
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!caseOption}
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
}
