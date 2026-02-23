"use client";

import { useState } from "react";
import { ArrowLeft, Package, CheckCircle, Clock, AlertTriangle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutItem {
  id: string;
  name: string;
  points: number[][];
  x: number;
  y: number;
  rotation: number;
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
  fingerPullEnabled: boolean;
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
  fingerPullEnabled,
  onComplete,
  onBack,
}: StepCheckoutProps) {
  const [caseOption, setCaseOption] = useState<CaseOption>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contact form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const handleContinue = () => {
    if (caseOption) {
      setShowCheckout(true);
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutItems,
          caseId: selectedCaseId,
          caseName,
          caseWidth,
          caseHeight,
          needsCase: caseOption === "need-case",
          fingerPulls: fingerPullEnabled,
          customerName,
          customerEmail,
          customerPhone,
          customerNotes,
          sessionId: typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      setOrderNumber(data.orderNumber);
      setOrderSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order submitted success view
  if (orderSubmitted) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-heading mb-2">Order Submitted!</h2>
          <p className="text-text-secondary">
            Your design has been sent for review
          </p>
        </div>

        <div className="bg-carbon rounded-[4px] p-6 text-center">
          <p className="text-text-muted mb-2">Order Number</p>
          <p className="text-2xl font-heading text-accent">{orderNumber}</p>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-[4px] p-6">
          <h3 className="font-heading text-lg mb-3">What Happens Next?</h3>
          <ol className="space-y-3 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>We'll review your design and contact you at <strong>{customerEmail}</strong> with pricing</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent/50 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>Once approved and paid, we'll begin CNC cutting your custom foam insert</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent/30 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Your foam insert will ship within 3-4 weeks</span>
            </li>
          </ol>
        </div>

        <div className="text-center">
          <Button onClick={onComplete} size="lg">
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-heading mb-2">Submit Your Design</h2>
          <p className="text-text-secondary">
            Enter your contact info to submit your custom foam insert design
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
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Finger Pulls</span>
              <span className="text-text-muted">{fingerPullEnabled ? "Yes" : "No"}</span>
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

        {/* Contact Info Form */}
        <div className="bg-carbon rounded-[4px] p-6 space-y-4">
          <h3 className="font-heading text-lg border-b border-border pb-2">Contact Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Email Address *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-dark border border-border rounded-[4px] px-4 py-2 text-white placeholder:text-text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-dark border border-border rounded-[4px] px-4 py-2 text-white placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-dark border border-border rounded-[4px] px-4 py-2 text-white placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Notes (optional)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special requests or notes about your order..."
                rows={3}
                className="w-full bg-dark border border-border rounded-[4px] px-4 py-2 text-white placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Lead Time Notice */}
        <div className="bg-warning/10 border border-warning/30 rounded-[4px] p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-sm text-text-secondary">
              <strong className="text-warning">Lead Time:</strong> 3-4 weeks processing + shipping
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[4px] p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setShowCheckout(false)} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSubmitOrder} disabled={isSubmitting || !customerEmail}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Design for Quote"
            )}
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
