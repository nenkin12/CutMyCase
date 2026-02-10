"use client";

import { useState } from "react";
import { ArrowLeft, Ruler, Circle, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CalibrationResult } from "@/lib/ai/process-image";

interface StepCalibrateProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onComplete: (data: {
    calibration: CalibrationResult | null;
    pixelsPerInch: number;
  }) => void;
  onBack: () => void;
}

type CalibrationMethod = "reference" | "manual" | "known";

const referenceObjects = [
  {
    id: "quarter",
    name: "US Quarter",
    size: 0.955,
    unit: "diameter",
    icon: Circle,
  },
  {
    id: "credit-card",
    name: "Credit Card",
    size: 3.375,
    unit: "width",
    icon: CreditCard,
  },
  {
    id: "ruler",
    name: "Ruler",
    size: 1,
    unit: "inch",
    icon: Ruler,
  },
];

export function StepCalibrate({
  imageUrl,
  imageWidth,
  imageHeight,
  onComplete,
  onBack,
}: StepCalibrateProps) {
  const [method, setMethod] = useState<CalibrationMethod>("reference");
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [manualPPI, setManualPPI] = useState<string>("72");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCalibration, setDetectedCalibration] = useState<CalibrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drawing state for manual reference selection
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const response = await fetch("/api/upload/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to detect reference object");
      }

      const data = await response.json();
      if (data.calibration) {
        setDetectedCalibration(data.calibration);
        setSelectedReference(data.calibration.referenceObject.toLowerCase().replace(" ", "-"));
      } else {
        setError("No reference object detected. Please select manually.");
      }
    } catch (err) {
      console.error("Calibration error:", err);
      setError("Failed to auto-detect. Please calibrate manually.");
    } finally {
      setIsDetecting(false);
    }
  };

  const calculatePPI = (): number => {
    if (method === "manual") {
      return parseFloat(manualPPI) || 72;
    }

    if (method === "known") {
      // Default to common camera/phone DPI
      return 72;
    }

    if (detectedCalibration) {
      const refObj = referenceObjects.find(
        (r) => r.id === selectedReference || r.name === detectedCalibration.referenceObject
      );
      if (refObj) {
        const pixelMeasure =
          detectedCalibration.measureAxis === "width"
            ? (detectedCalibration.boundingBox.width / 100) * imageWidth
            : (detectedCalibration.boundingBox.height / 100) * imageHeight;
        return pixelMeasure / refObj.size;
      }
    }

    if (startPoint && endPoint && selectedReference) {
      const refObj = referenceObjects.find((r) => r.id === selectedReference);
      if (refObj) {
        const pixelDistance = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) +
            Math.pow(endPoint.y - startPoint.y, 2)
        );
        return pixelDistance / refObj.size;
      }
    }

    return 72; // Default fallback
  };

  const handleContinue = () => {
    const pixelsPerInch = calculatePPI();
    onComplete({
      calibration: detectedCalibration,
      pixelsPerInch,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (method !== "reference" || !selectedReference) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPoint({ x, y });
    setEndPoint(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setEndPoint({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-heading mb-2">Calibrate Scale</h2>
        <p className="text-text-secondary">
          Help us understand the real-world dimensions of your items
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: "reference", label: "Reference Object", desc: "Use a known object" },
          { id: "manual", label: "Manual Entry", desc: "Enter pixels per inch" },
          { id: "known", label: "I Know My Items", desc: "Skip calibration" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id as CalibrationMethod)}
            className={cn(
              "p-4 rounded-[4px] border text-left transition-colors",
              method === m.id
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
            )}
          >
            <h4 className="font-medium text-sm">{m.label}</h4>
            <p className="text-xs text-text-muted mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      {method === "reference" && (
        <div className="space-y-4">
          {/* Reference Object Selection */}
          <div className="flex gap-4">
            {referenceObjects.map((ref) => (
              <button
                key={ref.id}
                onClick={() => setSelectedReference(ref.id)}
                className={cn(
                  "flex-1 p-4 rounded-[4px] border text-center transition-colors",
                  selectedReference === ref.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <ref.icon className="w-8 h-8 mx-auto mb-2 text-accent" />
                <h4 className="font-medium text-sm">{ref.name}</h4>
                <p className="text-xs text-text-muted">
                  {ref.size}" {ref.unit}
                </p>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={handleAutoDetect}
              isLoading={isDetecting}
              disabled={isDetecting}
            >
              Auto-Detect Reference
            </Button>
          </div>

          {/* Image with drawing capability */}
          <div
            className="relative bg-carbon rounded-[4px] overflow-hidden cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={imageUrl}
              alt="Calibration"
              className="w-full object-contain select-none"
              draggable={false}
            />

            {/* Drawing overlay */}
            {startPoint && endPoint && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1={startPoint.x}
                  y1={startPoint.y}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke="#FF4D00"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
                <circle cx={startPoint.x} cy={startPoint.y} r="4" fill="#FF4D00" />
                <circle cx={endPoint.x} cy={endPoint.y} r="4" fill="#FF4D00" />
              </svg>
            )}

            {/* Detected reference overlay */}
            {detectedCalibration && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <rect
                  x={`${detectedCalibration.boundingBox.x}%`}
                  y={`${detectedCalibration.boundingBox.y}%`}
                  width={`${detectedCalibration.boundingBox.width}%`}
                  height={`${detectedCalibration.boundingBox.height}%`}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>

          {selectedReference && !detectedCalibration && (
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Draw a line across your {referenceObjects.find((r) => r.id === selectedReference)?.name} in the image
            </p>
          )}

          {detectedCalibration && (
            <div className="p-4 bg-success/10 border border-success/30 rounded-[4px] text-success text-sm">
              Detected: {detectedCalibration.referenceObject} ({Math.round(detectedCalibration.confidence * 100)}% confidence)
            </div>
          )}
        </div>
      )}

      {method === "manual" && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-2">
              Pixels Per Inch (PPI)
            </label>
            <Input
              type="number"
              value={manualPPI}
              onChange={(e) => setManualPPI(e.target.value)}
              min="1"
              max="1000"
            />
            <p className="text-xs text-text-muted mt-2">
              Common values: 72 (web), 96 (Windows), 300 (print)
            </p>
          </div>
        </div>
      )}

      {method === "known" && (
        <div className="bg-carbon rounded-[4px] p-4">
          <p className="text-text-secondary text-sm">
            You can manually adjust item dimensions in the next step. We&apos;ll use
            estimated dimensions based on detected item types.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-[4px] text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
}
