"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepUpload } from "./step-upload";
import { StepClassify } from "./step-classify";
import { StepCalibrate } from "./step-calibrate";
import { StepProcess } from "./step-process";
import { StepPreview } from "./step-preview";
import { StepCaseSelect } from "./step-case-select";
import { cn } from "@/lib/utils";
import type { GearAnalysisResult, CalibrationResult, OutlineResult } from "@/lib/ai/process-image";

export type WizardStep =
  | "upload"
  | "classify"
  | "calibrate"
  | "process"
  | "preview"
  | "case-select";

interface WizardState {
  step: WizardStep;
  uploadId: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  gearAnalysis: GearAnalysisResult | null;
  calibration: CalibrationResult | null;
  pixelsPerInch: number | null;
  outlines: OutlineResult | null;
  tolerance: number;
  selectedCaseId: string | null;
}

const initialState: WizardState = {
  step: "upload",
  uploadId: null,
  imageUrl: null,
  imageWidth: null,
  imageHeight: null,
  gearAnalysis: null,
  calibration: null,
  pixelsPerInch: null,
  outlines: null,
  tolerance: 0.1,
  selectedCaseId: null,
};

const steps: { id: WizardStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "classify", label: "Detect" },
  { id: "calibrate", label: "Calibrate" },
  { id: "process", label: "Process" },
  { id: "preview", label: "Preview" },
  { id: "case-select", label: "Case" },
];

export function UploadWizard() {
  const [state, setState] = useState<WizardState>(initialState);

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    updateState({ step });
  }, [updateState]);

  const currentStepIndex = steps.findIndex((s) => s.id === state.step);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    index < currentStepIndex
                      ? "bg-accent text-white"
                      : index === currentStepIndex
                      ? "bg-accent text-white ring-4 ring-accent/30"
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
            className="p-6 sm:p-8"
          >
            {state.step === "upload" && (
              <StepUpload
                onComplete={(data) => {
                  updateState({
                    uploadId: data.uploadId,
                    imageUrl: data.imageUrl,
                    imageWidth: data.width,
                    imageHeight: data.height,
                    step: "classify",
                  });
                }}
              />
            )}

            {state.step === "classify" && state.imageUrl && (
              <StepClassify
                imageUrl={state.imageUrl}
                onComplete={(analysis) => {
                  updateState({
                    gearAnalysis: analysis,
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
                onComplete={(data) => {
                  updateState({
                    calibration: data.calibration,
                    pixelsPerInch: data.pixelsPerInch,
                    step: "process",
                  });
                }}
                onBack={() => goToStep("classify")}
              />
            )}

            {state.step === "process" && state.uploadId && (
              <StepProcess
                uploadId={state.uploadId}
                imageUrl={state.imageUrl!}
                pixelsPerInch={state.pixelsPerInch!}
                onComplete={(outlines) => {
                  updateState({
                    outlines,
                    step: "preview",
                  });
                }}
                onBack={() => goToStep("calibrate")}
              />
            )}

            {state.step === "preview" && state.outlines && (
              <StepPreview
                outlines={state.outlines}
                tolerance={state.tolerance}
                onToleranceChange={(tolerance) => updateState({ tolerance })}
                onComplete={() => goToStep("case-select")}
                onBack={() => goToStep("process")}
              />
            )}

            {state.step === "case-select" && state.uploadId && (
              <StepCaseSelect
                uploadId={state.uploadId}
                outlines={state.outlines!}
                tolerance={state.tolerance}
                onComplete={(caseId) => {
                  updateState({ selectedCaseId: caseId });
                  // Navigate to cart or checkout
                }}
                onBack={() => goToStep("preview")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
