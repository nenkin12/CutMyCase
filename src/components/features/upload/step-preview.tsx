"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Minus, Plus, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OutlineResult } from "@/lib/ai/process-image";

interface StepPreviewProps {
  outlines: OutlineResult;
  tolerance: number;
  onToleranceChange: (tolerance: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function StepPreview({
  outlines,
  tolerance,
  onToleranceChange,
  onComplete,
  onBack,
}: StepPreviewProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Generate SVG preview
  const svgPreview = useMemo(() => {
    if (!outlines.outlines.length) return "";

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    outlines.outlines.forEach((outline) => {
      outline.outerPath.forEach((point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    const padding = 5;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    // Generate paths
    const paths = outlines.outlines.map((outline) => {
      const pathData = outline.outerPath
        .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x - minX + padding} ${point.y - minY + padding}`)
        .join(" ") + " Z";

      const innerPaths = outline.innerPaths.map((inner) =>
        inner.points
          .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x - minX + padding} ${point.y - minY + padding}`)
          .join(" ") + " Z"
      );

      return { id: outline.id, outer: pathData, inner: innerPaths };
    });

    return { width, height, paths, viewBox: `0 0 ${width} ${height}` };
  }, [outlines]);

  const toleranceOptions = [
    { value: 0.05, label: "Tight (+0.05\")" },
    { value: 0.1, label: "Standard (+0.1\")" },
    { value: 0.15, label: "Loose (+0.15\")" },
    { value: 0.2, label: "Extra Loose (+0.2\")" },
  ];

  const handleDownloadDXF = async () => {
    // This would trigger a download of the DXF file
    // For now, just a placeholder
    console.log("Download DXF");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-heading mb-2">Preview Your Cut</h2>
        <p className="text-text-secondary">
          Review and adjust the outlines before selecting your case
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-carbon rounded-[4px] border border-border overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-text-muted w-16 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setZoom(1)}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDownloadDXF}>
                <Download className="w-4 h-4 mr-2" />
                Download DXF
              </Button>
            </div>

            {/* SVG Preview */}
            <div
              className="p-4 overflow-auto"
              style={{ maxHeight: "500px" }}
            >
              <div
                className="mx-auto transition-transform"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
              >
                {svgPreview && (
                  <svg
                    viewBox={svgPreview.viewBox}
                    className="w-full max-w-lg mx-auto"
                    style={{ background: "#1a1a1a" }}
                  >
                    {/* Grid pattern */}
                    <defs>
                      <pattern
                        id="grid"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 10 0 L 0 0 0 10"
                          fill="none"
                          stroke="#333"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Outlines */}
                    {svgPreview.paths.map((path) => (
                      <g key={path.id}>
                        <path
                          d={path.outer}
                          fill={selectedItem === path.id ? "rgba(255, 77, 0, 0.2)" : "rgba(255, 77, 0, 0.1)"}
                          stroke="#FF4D00"
                          strokeWidth="0.5"
                          className="cursor-pointer transition-colors hover:fill-accent/30"
                          onClick={() => setSelectedItem(path.id === selectedItem ? null : path.id)}
                        />
                        {path.inner.map((innerPath, i) => (
                          <path
                            key={i}
                            d={innerPath}
                            fill="#1a1a1a"
                            stroke="#FF4D00"
                            strokeWidth="0.3"
                          />
                        ))}
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Tolerance */}
          <div className="bg-carbon rounded-[4px] p-4 space-y-4">
            <h3 className="font-heading text-lg">Foam Tolerance</h3>
            <p className="text-sm text-text-secondary">
              How much extra space around each item
            </p>
            <div className="space-y-2">
              {toleranceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onToleranceChange(option.value)}
                  className={cn(
                    "w-full p-3 rounded-[4px] text-left text-sm transition-colors",
                    tolerance === option.value
                      ? "bg-accent text-white"
                      : "bg-dark hover:bg-dark/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Item List */}
          <div className="bg-carbon rounded-[4px] p-4 space-y-4">
            <h3 className="font-heading text-lg">Items ({outlines.outlines.length})</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {outlines.outlines.map((outline) => (
                <button
                  key={outline.id}
                  onClick={() => setSelectedItem(outline.id === selectedItem ? null : outline.id)}
                  className={cn(
                    "w-full p-3 rounded-[4px] text-left text-sm transition-colors",
                    selectedItem === outline.id
                      ? "bg-accent/20 border border-accent"
                      : "bg-dark hover:bg-dark/80 border border-transparent"
                  )}
                >
                  <div className="font-medium">{outline.itemName}</div>
                  <div className="text-xs text-text-muted mt-1">
                    Depth: {outline.depth}"
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-carbon rounded-[4px] p-4">
            <h3 className="font-heading text-lg mb-2">Tips</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Click items to select them</li>
              <li>• Standard tolerance works for most items</li>
              <li>• Use tighter fit for snug protection</li>
              <li>• Looser fit makes items easier to remove</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onComplete}>
          Select Case
        </Button>
      </div>
    </div>
  );
}
