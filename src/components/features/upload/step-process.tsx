"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OutlineResult } from "@/lib/ai/process-image";

interface StepProcessProps {
  uploadId: string;
  imageUrl: string;
  pixelsPerInch: number;
  onComplete: (outlines: OutlineResult) => void;
  onBack: () => void;
}

const processingSteps = [
  { id: "queue", label: "Queuing job" },
  { id: "analyze", label: "Analyzing image" },
  { id: "trace", label: "Tracing outlines" },
  { id: "generate", label: "Generating cut file" },
  { id: "complete", label: "Processing complete" },
];

export function StepProcess({
  uploadId,
  imageUrl,
  pixelsPerInch,
  onComplete,
  onBack,
}: StepProcessProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processImage();
  }, [uploadId, imageUrl]);

  const processImage = async () => {
    try {
      // Step 1: Queue job
      setCurrentStep(0);
      setProgress(10);

      const queueResponse = await fetch("/api/upload/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          imageUrl,
          pixelsPerInch,
        }),
      });

      if (!queueResponse.ok) {
        throw new Error("Failed to start processing");
      }

      const { jobId } = await queueResponse.json();

      // Poll for status
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusResponse = await fetch(`/api/upload/status/${jobId}`);
        if (!statusResponse.ok) {
          throw new Error("Failed to check status");
        }

        const status = await statusResponse.json();

        switch (status.state) {
          case "active":
            setCurrentStep(1);
            setProgress(Math.min(30 + attempts * 2, 70));
            break;
          case "tracing":
            setCurrentStep(2);
            setProgress(70);
            break;
          case "generating":
            setCurrentStep(3);
            setProgress(85);
            break;
          case "completed":
            setCurrentStep(4);
            setProgress(100);
            onComplete(status.result);
            return;
          case "failed":
            throw new Error(status.error || "Processing failed");
        }

        attempts++;
      }

      throw new Error("Processing timed out");
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-error mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-heading mb-2">Processing Failed</h3>
        <p className="text-text-secondary mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={onBack}>
            Go Back
          </Button>
          <Button onClick={() => { setError(null); processImage(); }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-heading mb-2">Processing Your Image</h2>
        <p className="text-text-secondary">
          Our AI is analyzing your gear and creating precision cut outlines
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="h-2 bg-carbon rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-text-muted mt-2">
          {progress}% complete
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-md mx-auto space-y-4">
        {processingSteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-[4px] transition-colors",
              index === currentStep
                ? "bg-accent/10 border border-accent/30"
                : index < currentStep
                ? "bg-carbon"
                : "bg-dark"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                index < currentStep
                  ? "bg-accent text-white"
                  : index === currentStep
                  ? "bg-accent/20 text-accent"
                  : "bg-carbon text-text-muted"
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : index === currentStep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "font-medium",
                index <= currentStep ? "text-white" : "text-text-muted"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      <div className="max-w-sm mx-auto">
        <div className="relative bg-carbon rounded-[4px] overflow-hidden">
          <img
            src={imageUrl}
            alt="Processing"
            className="w-full object-contain opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
