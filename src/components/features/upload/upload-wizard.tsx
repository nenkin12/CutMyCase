"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { StepUpload } from "./step-upload";
import { StepSegment } from "./step-segment";
import { StepCalibrate } from "./step-calibrate";
import { StepLayout } from "./step-layout";
import { StepCheckout } from "./step-checkout";
import { cn } from "@/lib/utils";
import type { CalibrationResult } from "@/lib/ai/process-image";
import { trackStepEnter, trackStepComplete, linkSessionToUser, type DesignStep } from "@/lib/analytics";

export type WizardStep =
  | "upload"
  | "segment"
  | "calibrate"
  | "layout"
  | "checkout";

interface SegmentedItem {
  id: string;
  name: string;
  maskUrl: string;
  points: number[][];
  color: string;
  depth?: number;
}

interface LayoutItem {
  id: string;
  name: string;
  points: number[][];
  color: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  depth: number;
}

interface WizardState {
  step: WizardStep;
  uploadId: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  segmentedItems: SegmentedItem[];
  calibration: CalibrationResult | null;
  pixelsPerInch: number | null;
  itemDepths: Record<string, number>;
  layoutItems: LayoutItem[];
  selectedCaseId: string | null;
  caseName: string | null;
  caseWidth: number | null;
  caseHeight: number | null;
  fingerPullEnabled: boolean;
}

const initialState: WizardState = {
  step: "upload",
  uploadId: null,
  imageUrl: null,
  imageWidth: null,
  imageHeight: null,
  segmentedItems: [],
  calibration: null,
  pixelsPerInch: null,
  itemDepths: {},
  layoutItems: [],
  selectedCaseId: null,
  caseName: null,
  caseWidth: null,
  caseHeight: null,
  fingerPullEnabled: true,
};

const steps: { id: WizardStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "segment", label: "Select" },
  { id: "calibrate", label: "Calibrate" },
  { id: "layout", label: "Layout" },
  { id: "checkout", label: "Checkout" },
];

export function UploadWizard() {
  const [state, setState] = useState<WizardState>(initialState);
  const { user } = useAuth();

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    updateState({ step });
  }, [updateState]);

  const currentStepIndex = steps.findIndex((s) => s.id === state.step);

  // Track step changes for analytics and scroll to top
  useEffect(() => {
    trackStepEnter(state.step as DesignStep, {
      imageUrl: state.imageUrl,
      itemCount: state.segmentedItems.length,
    });
    // Scroll to top when step changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step]);

  // Link session to user when they sign in
  useEffect(() => {
    if (user?.uid && user?.email) {
      linkSessionToUser(user.uid, user.email);
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
                    index < currentStepIndex
                      ? "bg-accent text-white"
                      : index === currentStepIndex
                      ? "bg-accent text-white ring-2 sm:ring-4 ring-accent/30"
                      : "bg-carbon text-text-muted border border-border"
                  )}
                >
                  {index < currentStepIndex ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs uppercase tracking-wider hidden sm:block",
                    index <= currentStepIndex
                      ? "text-white"
                      : "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    index < currentStepIndex ? "bg-accent" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-[4px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {state.step === "upload" && (
              <StepUpload
                onComplete={(data) => {
                  trackStepComplete("upload", { imageUrl: data.imageUrl });
                  updateState({
                    uploadId: data.uploadId,
                    imageUrl: data.imageUrl,
                    imageWidth: data.width,
                    imageHeight: data.height,
                    step: "segment",
                  });
                }}
              />
            )}

            {state.step === "segment" && state.imageUrl && (
              <StepSegment
                imageUrl={state.imageUrl}
                imageWidth={state.imageWidth!}
                imageHeight={state.imageHeight!}
                onComplete={(items) => {
                  trackStepComplete("segment", { itemCount: items.length });
                  updateState({
                    segmentedItems: items,
                    step: "calibrate",
                  });
                }}
                onBack={() => goToStep("upload")}
              />
            )}

            {state.step === "calibrate" && state.imageUrl && (
              <StepCalibrate
                imageUrl={state.imageUrl}
                imageWidth={state.imageWidth!}
                imageHeight={state.imageHeight!}
                segmentedItems={state.segmentedItems}
                onComplete={(data) => {
                  trackStepComplete("calibrate", { pixelsPerInch: data.pixelsPerInch });
                  // Merge depths into segmented items
                  const itemsWithDepths = state.segmentedItems.map(item => ({
                    ...item,
                    depth: data.itemDepths[item.id] ?? 1.5
                  }));
                  updateState({
                    calibration: data.calibration,
                    pixelsPerInch: data.pixelsPerInch,
                    itemDepths: data.itemDepths,
                    segmentedItems: itemsWithDepths,
                    step: "layout",
                  });
                }}
                onBack={() => goToStep("segment")}
              />
            )}

            {state.step === "layout" && state.pixelsPerInch && state.imageUrl && (
              <StepLayout
                segmentedItems={state.segmentedItems}
                pixelsPerInch={state.pixelsPerInch}
                imageWidth={state.imageWidth!}
                imageHeight={state.imageHeight!}
                imageUrl={state.imageUrl}
                onComplete={(layoutItems, caseId, caseName, caseWidth, caseHeight, fingerPullEnabled) => {
                  trackStepComplete("layout", { caseId, caseName });
                  updateState({
                    layoutItems,
                    selectedCaseId: caseId,
                    caseName,
                    caseWidth,
                    caseHeight,
                    fingerPullEnabled,
                    step: "checkout",
                  });
                }}
                onBack={() => goToStep("calibrate")}
              />
            )}

            {state.step === "checkout" && state.selectedCaseId && (
              <StepCheckout
                layoutItems={state.layoutItems}
                selectedCaseId={state.selectedCaseId}
                caseName={state.caseName || "Custom Case"}
                caseWidth={state.caseWidth || 0}
                caseHeight={state.caseHeight || 0}
                fingerPullEnabled={state.fingerPullEnabled}
                onComplete={() => {
                  trackStepComplete("checkout");
                  trackStepComplete("completed");
                }}
                onBack={() => goToStep("layout")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
