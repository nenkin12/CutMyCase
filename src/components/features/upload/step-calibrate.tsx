"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Ruler, Circle, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CalibrationResult } from "@/lib/ai/process-image";

interface SegmentedItem {
  id: string;
  name: string;
  maskUrl: string;
  points: number[][];
  color: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  depth?: number; // Depth in inches
}

// Common foam depths
const DEPTH_OPTIONS = [
  { value: 0.5, label: '0.5"', description: "Shallow" },
  { value: 1, label: '1"', description: "Standard" },
  { value: 1.5, label: '1.5"', description: "Deep" },
  { value: 2, label: '2"', description: "Very Deep" },
  { value: 2.5, label: '2.5"', description: "Extra Deep" },
  { value: 3, label: '3"', description: "Maximum" },
];

interface StepCalibrateProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  segmentedItems: SegmentedItem[];
  onComplete: (data: {
    calibration: CalibrationResult | null;
    pixelsPerInch: number;
    itemDepths: Record<string, number>;
  }) => void;
  onBack: () => void;
}

type CalibrationMethod = "select-item" | "manual";

const referenceTypes = [
  {
    id: "credit-card",
    name: "Credit Card",
    widthInches: 3.375,
    heightInches: 2.125,
    icon: CreditCard,
  },
  {
    id: "quarter",
    name: "US Quarter",
    widthInches: 0.955,
    heightInches: 0.955,
    icon: Circle,
  },
  {
    id: "ruler",
    name: "Ruler (1 inch)",
    widthInches: 1,
    heightInches: 1,
    icon: Ruler,
  },
];

export function StepCalibrate({
  imageUrl,
  imageWidth,
  imageHeight,
  segmentedItems,
  onComplete,
  onBack,
}: StepCalibrateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [method, setMethod] = useState<CalibrationMethod>("select-item");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRefType, setSelectedRefType] = useState<string>("credit-card");
  const [manualPPI, setManualPPI] = useState<string>("72");
  const [scale, setScale] = useState(1);

  // Track depth for each item (default to 1.5 inches)
  const [itemDepths, setItemDepths] = useState<Record<string, number>>(() => {
    const depths: Record<string, number> = {};
    segmentedItems.forEach(item => {
      depths[item.id] = item.depth ?? 1.5;
    });
    return depths;
  });

  const updateItemDepth = (itemId: string, depth: number) => {
    setItemDepths(prev => ({ ...prev, [itemId]: depth }));
  };

  // Load and draw the image with overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const containerWidth = container.clientWidth;
      const newScale = Math.min(1, containerWidth / imageWidth);
      setScale(newScale);

      canvas.width = imageWidth * newScale;
      canvas.height = imageHeight * newScale;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawOverlays(ctx, newScale);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, imageWidth, imageHeight]);

  // Redraw overlays when selection changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redraw image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawOverlays(ctx, scale);
    };
    img.src = imageUrl;
  }, [selectedItemId, scale, imageUrl]);

  const drawOverlays = (ctx: CanvasRenderingContext2D, currentScale: number) => {
    segmentedItems.forEach((item) => {
      if (item.points.length < 3) return;

      const isSelected = item.id === selectedItemId;

      ctx.beginPath();
      ctx.moveTo(item.points[0][0] * currentScale, item.points[0][1] * currentScale);
      for (let i = 1; i < item.points.length; i++) {
        ctx.lineTo(item.points[i][0] * currentScale, item.points[i][1] * currentScale);
      }
      ctx.closePath();

      if (isSelected) {
        ctx.fillStyle = "#22c55e40";
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = item.color + "30";
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
      }

      ctx.fill();
      ctx.stroke();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (method !== "select-item") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check if click is inside any item's polygon
    for (const item of segmentedItems) {
      if (isPointInPolygon(x, y, item.points)) {
        setSelectedItemId(item.id);
        return;
      }
    }
  };

  const isPointInPolygon = (x: number, y: number, points: number[][]): boolean => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i][0], yi = points[i][1];
      const xj = points[j][0], yj = points[j][1];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  const calculatePPI = (): number => {
    if (method === "manual") {
      return parseFloat(manualPPI) || 72;
    }

    if (selectedItemId && selectedRefType) {
      const item = segmentedItems.find(i => i.id === selectedItemId);
      const refType = referenceTypes.find(r => r.id === selectedRefType);

      if (item && refType && item.points.length > 0) {
        // Calculate bounding box from points
        const xs = item.points.map(p => p[0]);
        const ys = item.points.map(p => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const pixelWidth = maxX - minX;
        const pixelHeight = maxY - minY;

        // Use the dimension that best matches the reference object's aspect ratio
        const itemAspect = pixelWidth / pixelHeight;
        const refAspect = refType.widthInches / refType.heightInches;

        // If aspects are similar, use width; otherwise use the more reliable dimension
        if (Math.abs(itemAspect - refAspect) < 0.5) {
          // Use width
          return pixelWidth / refType.widthInches;
        } else if (itemAspect > refAspect) {
          // Item is wider than expected, use height
          return pixelHeight / refType.heightInches;
        } else {
          // Item is taller than expected, use width
          return pixelWidth / refType.widthInches;
        }
      }
    }

    return 72; // Default fallback
  };

  const handleContinue = () => {
    const pixelsPerInch = calculatePPI();

    let calibration: CalibrationResult | null = null;
    if (selectedItemId) {
      const item = segmentedItems.find(i => i.id === selectedItemId);
      const refType = referenceTypes.find(r => r.id === selectedRefType);

      if (item && refType) {
        const xs = item.points.map(p => p[0]);
        const ys = item.points.map(p => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        calibration = {
          referenceObject: refType.name,
          boundingBox: {
            x: (minX / imageWidth) * 100,
            y: (minY / imageHeight) * 100,
            width: ((maxX - minX) / imageWidth) * 100,
            height: ((maxY - minY) / imageHeight) * 100,
          },
          knownDimension: refType.widthInches,
          dimensionType: "width",
          measureAxis: "width",
          confidence: 1.0,
        };
      }
    }

    onComplete({ calibration, pixelsPerInch, itemDepths });
  };

  const selectedItem = segmentedItems.find(i => i.id === selectedItemId);
  const selectedRef = referenceTypes.find(r => r.id === selectedRefType);
  const calculatedPPI = calculatePPI();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-heading mb-2">Calibrate Scale</h2>
        <p className="text-text-secondary">
          Select a reference object to set the real-world scale
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMethod("select-item")}
          className={cn(
            "p-4 rounded-[4px] border text-left transition-colors",
            method === "select-item"
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50"
          )}
        >
          <h4 className="font-medium text-sm">Select Reference Item</h4>
          <p className="text-xs text-text-muted mt-1">Click an item in the image</p>
        </button>
        <button
          onClick={() => setMethod("manual")}
          className={cn(
            "p-4 rounded-[4px] border text-left transition-colors",
            method === "manual"
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50"
          )}
        >
          <h4 className="font-medium text-sm">Manual Entry</h4>
          <p className="text-xs text-text-muted mt-1">Enter pixels per inch</p>
        </button>
      </div>

      {method === "select-item" && (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2 order-1">
            <div
              ref={containerRef}
              className="relative bg-black rounded-[4px] overflow-hidden"
            >
              <canvas
                ref={canvasRef}
                className="block cursor-crosshair"
                onClick={handleCanvasClick}
              />
            </div>
            <p className="text-sm text-text-muted mt-2">
              Click on the reference object (e.g., credit card) in the image
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4 order-2">
            {/* Reference Type Selection */}
            <div className="bg-carbon rounded-[4px] p-4">
              <h3 className="font-heading text-sm mb-3">Reference Type</h3>
              <div className="space-y-2">
                {referenceTypes.map((ref) => (
                  <button
                    key={ref.id}
                    onClick={() => setSelectedRefType(ref.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-[4px] border transition-colors",
                      selectedRefType === ref.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <ref.icon className="w-5 h-5 text-accent" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium">{ref.name}</div>
                      <div className="text-xs text-text-muted">
                        {ref.widthInches}" × {ref.heightInches}"
                      </div>
                    </div>
                    {selectedRefType === ref.id && (
                      <Check className="w-4 h-4 text-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Item Info */}
            <div className="bg-carbon rounded-[4px] p-4">
              <h3 className="font-heading text-sm mb-3">Selected Item</h3>
              {selectedItem ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: selectedItem.color }}
                    />
                    <span className="text-sm">{selectedItem.name}</span>
                  </div>
                  <div className="text-xs text-text-muted">
                    Will be used as: {selectedRef?.name}
                  </div>
                  <div className="text-xs text-success mt-2">
                    Calculated: {calculatedPPI.toFixed(1)} pixels/inch
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  Click an item in the image to select it as the reference
                </p>
              )}
            </div>

            {/* Items List */}
            <div className="bg-carbon rounded-[4px] p-4">
              <h3 className="font-heading text-sm mb-3">
                Detected Items ({segmentedItems.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {segmentedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-[4px] transition-colors",
                      selectedItemId === item.id
                        ? "bg-success/20"
                        : "hover:bg-dark"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                    {selectedItemId === item.id && (
                      <Check className="w-4 h-4 text-success ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Depth Selection */}
      <div className="bg-carbon rounded-[4px] p-4">
        <h3 className="font-heading text-sm mb-3">Item Depths</h3>
        <p className="text-xs text-text-muted mb-4">
          Set the cutout depth for each item in the foam
        </p>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {segmentedItems
            .filter(item => !item.name.toLowerCase().includes("card") && !item.name.toLowerCase().includes("quarter"))
            .map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-dark rounded-[4px]"
            >
              <div
                className="w-3 h-3 rounded shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm flex-1 truncate">{item.name}</span>
              <select
                value={itemDepths[item.id] || 1.5}
                onChange={(e) => updateItemDepth(item.id, parseFloat(e.target.value))}
                className="bg-carbon border border-border rounded-[4px] px-2 py-1 text-sm focus:outline-none focus:border-accent"
              >
                {DEPTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} - {opt.description}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

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

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={method === "select-item" && !selectedItemId}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
