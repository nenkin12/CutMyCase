"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Wand2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface SegmentedItem {
  id: string;
  name: string;
  maskUrl: string;
  points: number[][];
  color: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

interface StepSegmentProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onComplete: (items: SegmentedItem[]) => void;
  onBack: () => void;
}

const COLORS = [
  "#FF4D00", "#00BCD4", "#4CAF50", "#9C27B0",
  "#FF9800", "#E91E63", "#3F51B5", "#009688"
];

export function StepSegment({
  imageUrl,
  imageWidth,
  imageHeight,
  onComplete,
  onBack
}: StepSegmentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SegmentedItem[]>([]);
  const [scale, setScale] = useState(1);

  // Hybrid approach state
  const [cleanedImageData, setCleanedImageData] = useState<ImageData | null>(null);
  const [margin, setMargin] = useState(5);        // Pixels of padding around objects
  const [gapFill, setGapFill] = useState(14);     // Bridge over gaps/concavities
  const [smoothing, setSmoothing] = useState(1);  // Contour smoothing level

  // AI scanning animation state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<string>("");
  const [minArea, setMinArea] = useState(1000);   // Minimum object area in pixels

  // Template matching state
  const [templateMatches, setTemplateMatches] = useState<Record<string, { name: string; category: string; confidence: number } | null>>({});

  // Match detected items against training templates
  const matchTemplates = useCallback(async (detectedItems: SegmentedItem[]) => {
    if (detectedItems.length === 0) return;

    try {
      const response = await fetch("/api/templates/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: detectedItems.map(item => ({
            id: item.id,
            points: item.points,
          })),
          incrementUsage: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const matches: Record<string, { name: string; category: string; confidence: number } | null> = {};

        for (const result of data.results) {
          if (result.bestMatch && result.bestMatch.confidence > 50) {
            matches[result.itemId] = {
              name: result.bestMatch.template.name,
              category: result.bestMatch.template.category,
              confidence: result.bestMatch.confidence,
            };
          } else {
            matches[result.itemId] = null;
          }
        }

        setTemplateMatches(matches);

        // Auto-update item names for high-confidence matches
        setItems(prev => prev.map(item => {
          const match = matches[item.id];
          if (match && match.confidence > 70) {
            return { ...item, name: match.name };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error("Template matching failed:", error);
    }
  }, []);

  // Load and draw the original image
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const img = new Image();
    // Don't use crossOrigin for display - only needed when reading pixels
    // crossOrigin can block loading if CORS isn't configured
    img.onload = () => {
      const containerWidth = container.clientWidth;
      const newScale = Math.min(1, containerWidth / imageWidth);
      setScale(newScale);

      canvas.width = imageWidth * newScale;
      canvas.height = imageHeight * newScale;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const overlay = overlayCanvasRef.current;
      if (overlay) {
        overlay.width = canvas.width;
        overlay.height = canvas.height;
      }
    };
    img.onerror = (e) => {
      console.error("Failed to load image:", imageUrl, e);
      setError("Failed to load image. Please go back and re-upload.");
    };
    img.src = imageUrl;
  }, [imageUrl, imageWidth, imageHeight]);

  // Re-process when sliders change
  useEffect(() => {
    if (cleanedImageData) {
      processCleanedImage(cleanedImageData);
    }
  }, [margin, gapFill, smoothing, minArea]);

  // Find connected components (separate objects) from alpha channel
  const findObjects = (
    alpha: Uint8Array,
    width: number,
    height: number,
    minObjectArea: number
  ): { mask: Uint8Array; bounds: { x: number; y: number; w: number; h: number } }[] => {
    const visited = new Uint8Array(width * height);
    const objects: { mask: Uint8Array; bounds: { x: number; y: number; w: number; h: number } }[] = [];

    const floodFill = (startX: number, startY: number): { mask: Uint8Array; bounds: { x: number; y: number; w: number; h: number } } | null => {
      const mask = new Uint8Array(width * height);
      const stack: [number, number][] = [[startX, startY]];
      let minX = startX, maxX = startX, minY = startY, maxY = startY;
      let area = 0;

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        const idx = y * width + x;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited[idx] || alpha[idx] < 128) continue;

        visited[idx] = 1;
        mask[idx] = 1;
        area++;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        // 4-connected neighbors
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }

      if (area < minObjectArea) return null;

      return {
        mask,
        bounds: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
      };
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (alpha[idx] >= 128 && !visited[idx]) {
          const obj = floodFill(x, y);
          if (obj) {
            objects.push(obj);
          }
        }
      }
    }

    return objects;
  };

  // Fill internal holes in the mask (keep only outer boundary)
  const fillHoles = (mask: Uint8Array, width: number, height: number): Uint8Array => {
    const filled = new Uint8Array(width * height);
    const visited = new Uint8Array(width * height);

    // Flood fill from edges to find the background (outside)
    const stack: [number, number][] = [];

    // Start from all edge pixels
    for (let x = 0; x < width; x++) {
      stack.push([x, 0], [x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
      stack.push([0, y], [width - 1, y]);
    }

    // Flood fill the outside (background)
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const idx = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[idx]) continue;
      if (mask[idx]) continue; // Stop at mask boundary

      visited[idx] = 1;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    // Everything not visited from outside is either the object or an internal hole
    // Fill it all as solid
    for (let i = 0; i < width * height; i++) {
      filled[i] = visited[i] ? 0 : 1;
    }

    return filled;
  };

  // Dilate mask (expand)
  const dilateMask = (mask: Uint8Array, width: number, height: number, radius: number): Uint8Array => {
    if (radius <= 0) return mask;

    const output = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x]) {
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (dx * dx + dy * dy <= radius * radius) {
                  output[ny * width + nx] = 1;
                }
              }
            }
          }
        }
      }
    }

    return output;
  };

  // Erode mask (shrink)
  const erodeMask = (mask: Uint8Array, width: number, height: number, radius: number): Uint8Array => {
    if (radius <= 0) return mask;

    const output = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!mask[y * width + x]) continue;

        // Check if all pixels within radius are set
        let allSet = true;
        outer: for (let dy = -radius; dy <= radius && allSet; dy++) {
          for (let dx = -radius; dx <= radius && allSet; dx++) {
            if (dx * dx + dy * dy > radius * radius) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height || !mask[ny * width + nx]) {
              allSet = false;
              break outer;
            }
          }
        }

        if (allSet) {
          output[y * width + x] = 1;
        }
      }
    }

    return output;
  };

  // Morphological closing: dilate then erode (fills gaps and concavities)
  const morphClose = (mask: Uint8Array, width: number, height: number, radius: number): Uint8Array => {
    if (radius <= 0) return mask;
    const dilated = dilateMask(mask, width, height, radius);
    return erodeMask(dilated, width, height, radius);
  };

  // Extract outer contour from mask (marching squares simplified)
  const extractOuterContour = (mask: Uint8Array, width: number, height: number): number[][] => {
    const contour: number[][] = [];

    // Find starting point on the edge
    let startX = -1, startY = -1;
    outer: for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x]) {
          startX = x;
          startY = y;
          break outer;
        }
      }
    }

    if (startX < 0) return contour;

    // Trace the outer boundary
    const directions = [
      [1, 0], [1, 1], [0, 1], [-1, 1],
      [-1, 0], [-1, -1], [0, -1], [1, -1]
    ];

    let x = startX, y = startY;
    let dir = 0;
    const visited = new Set<string>();

    do {
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        contour.push([x, y]);
        visited.add(key);
      }

      // Find next boundary pixel
      let found = false;
      for (let i = 0; i < 8; i++) {
        const newDir = (dir + 6 + i) % 8; // Start looking from left of current direction
        const [dx, dy] = directions[newDir];
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height && mask[ny * width + nx]) {
          // Check if this is actually on the boundary
          let isEdge = false;
          for (const [edx, edy] of directions) {
            const ex = nx + edx;
            const ey = ny + edy;
            if (ex < 0 || ex >= width || ey < 0 || ey >= height || !mask[ey * width + ex]) {
              isEdge = true;
              break;
            }
          }

          if (isEdge || contour.length < 10) {
            x = nx;
            y = ny;
            dir = newDir;
            found = true;
            break;
          }
        }
      }

      if (!found) break;

    } while ((x !== startX || y !== startY) && contour.length < 50000);

    return contour;
  };

  // Simplify contour using Douglas-Peucker
  const simplifyContour = (points: number[][], epsilon: number): number[][] => {
    if (points.length < 3) return points;

    const perpDist = (p: number[], lineStart: number[], lineEnd: number[]) => {
      const dx = lineEnd[0] - lineStart[0];
      const dy = lineEnd[1] - lineStart[1];
      const lineLenSq = dx * dx + dy * dy;

      if (lineLenSq === 0) {
        return Math.sqrt(Math.pow(p[0] - lineStart[0], 2) + Math.pow(p[1] - lineStart[1], 2));
      }

      const t = Math.max(0, Math.min(1,
        ((p[0] - lineStart[0]) * dx + (p[1] - lineStart[1]) * dy) / lineLenSq
      ));

      const projX = lineStart[0] + t * dx;
      const projY = lineStart[1] + t * dy;

      return Math.sqrt(Math.pow(p[0] - projX, 2) + Math.pow(p[1] - projY, 2));
    };

    let maxDist = 0;
    let maxIdx = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const d = perpDist(points[i], points[0], points[points.length - 1]);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }

    if (maxDist > epsilon) {
      const left = simplifyContour(points.slice(0, maxIdx + 1), epsilon);
      const right = simplifyContour(points.slice(maxIdx), epsilon);
      return [...left.slice(0, -1), ...right];
    }

    return [points[0], points[points.length - 1]];
  };

  const processCleanedImage = (imageData: ImageData) => {
    const { width, height, data } = imageData;
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    // Extract alpha channel
    const alpha = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      alpha[i / 4] = data[i + 3];
    }

    // Find separate objects
    const objects = findObjects(alpha, width, height, minArea);
    console.log(`Found ${objects.length} objects`);

    // Process each object
    const newItems: SegmentedItem[] = [];
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    objects.forEach((obj, i) => {
      // Step 1: Fill internal holes to create solid silhouette
      const solidMask = fillHoles(obj.mask, width, height);

      // Step 2: Morphological closing to bridge over concavities/gaps
      const closedMask = morphClose(solidMask, width, height, gapFill);

      // Step 3: Dilate to add margin (expands outward only now)
      const dilatedMask = dilateMask(closedMask, width, height, margin);

      // Extract outer contour
      let contour = extractOuterContour(dilatedMask, width, height);

      // Simplify contour
      contour = simplifyContour(contour, smoothing);

      if (contour.length < 10) return;

      const color = COLORS[i % COLORS.length];

      // Draw filled silhouette
      ctx.fillStyle = color + "50";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(contour[0][0], contour[0][1]);
      for (let j = 1; j < contour.length; j++) {
        ctx.lineTo(contour[j][0], contour[j][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Convert contour points from canvas coordinates to original image coordinates
      const normalizedContour = contour.map(p => [
        p[0] / scale,
        p[1] / scale
      ]);

      newItems.push({
        id: `item_${i + 1}`,
        name: `Item ${i + 1}`,
        maskUrl: "",
        points: normalizedContour,
        color,
        boundingBox: {
          x: obj.bounds.x / scale,
          y: obj.bounds.y / scale,
          width: obj.bounds.w / scale,
          height: obj.bounds.h / scale
        }
      });
    });

    setItems(newItems);

    // Match against training templates to auto-identify items
    matchTemplates(newItems);
  };

  const handleAutoDetect = async () => {
    setIsLoading(true);
    setError(null);
    setScanProgress(0);
    setScanPhase("Initializing AI scanner...");

    const phases = [
      "Analyzing image composition...",
      "Detecting object boundaries...",
      "Removing background...",
      "Extracting object silhouettes...",
      "Refining contours...",
    ];
    let phaseIndex = 0;

    try {
      // Step 1: Create prediction
      console.log("Creating prediction for imageUrl:", imageUrl.substring(0, 50) + "...");

      const createResponse = await fetch("/api/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json();
        throw new Error(errData.error || errData.details || "Failed to start detection");
      }

      let data = await createResponse.json();
      console.log("Initial response:", data);

      // Step 2: Poll for completion (client-side to avoid serverless timeout)
      while (data.status === "processing" && data.predictionId) {
        setScanPhase(phases[phaseIndex % phases.length]);
        setScanProgress(Math.min(85, 20 + phaseIndex * 15));
        phaseIndex++;

        // Wait 2 seconds before polling
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pollResponse = await fetch("/api/segment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, predictionId: data.predictionId }),
        });

        if (!pollResponse.ok) {
          const errData = await pollResponse.json();
          throw new Error(errData.error || "Failed to check status");
        }

        data = await pollResponse.json();
        console.log("Poll response:", data.status);

        // Safety check to prevent infinite loop
        if (phaseIndex > 30) {
          throw new Error("Processing timed out. Please try again.");
        }
      }

      if (data.status !== "completed") {
        throw new Error(data.error || "Processing failed");
      }

      setScanPhase("Processing results...");
      setScanProgress(95);

      if (data.cleanedImageUrl) {
        // Load the cleaned image and extract image data
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const overlay = overlayCanvasRef.current;
            if (!overlay) {
              reject(new Error("Canvas not available"));
              return;
            }

            canvas.width = overlay.width;
            canvas.height = overlay.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Could not get canvas context"));
              return;
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            setScanPhase("Finalizing detection...");
            setScanProgress(100);

            setCleanedImageData(imageData);
            processCleanedImage(imageData);
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load cleaned image"));
          img.src = data.cleanedImageUrl;
        });
      } else {
        throw new Error("No cleaned image returned");
      }
    } catch (err) {
      console.error("Auto-detect error:", err);
      setError(`Auto-detection failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setScanPhase("");
      setScanProgress(0);
    }
  };

  const clearAll = () => {
    setCleanedImageData(null);
    setItems([]);

    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, overlay.width, overlay.height);
      }
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== id);

      // Redraw remaining items
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);

          newItems.forEach((item, i) => {
            const contour = item.points;
            if (contour.length < 3) return;

            ctx.fillStyle = item.color + "50";
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            // Points are in original image coords, convert to canvas coords
            ctx.moveTo(contour[0][0] * scale, contour[0][1] * scale);
            for (let j = 1; j < contour.length; j++) {
              ctx.lineTo(contour[j][0] * scale, contour[j][1] * scale);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });
        }
      }

      return newItems;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading mb-2">Select Your Items</h2>
        <p className="text-text-secondary text-sm sm:text-base">
          Auto-detect creates silhouettes with adjustable margin for foam cutting
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-carbon rounded-[4px] p-2 sm:p-3 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={clearAll}
          disabled={!cleanedImageData}
          className="px-2 sm:px-3"
        >
          <Trash2 className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleAutoDetect}
          disabled={isLoading}
          className="flex-1 sm:flex-none"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Scanning...</span>
              <span className="sm:hidden">Scanning</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Auto-Detect Items</span>
              <span className="sm:hidden">Auto-Detect</span>
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2 order-1">
          <div
            ref={containerRef}
            className="relative bg-black rounded-[4px] overflow-hidden"
          >
            <canvas ref={canvasRef} className="block" />
            <canvas ref={overlayCanvasRef} className="absolute inset-0" />

            {isLoading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center overflow-hidden">
                {/* Scanning line animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
                    style={{
                      top: `${scanProgress}%`,
                      boxShadow: '0 0 20px 5px rgba(255, 77, 0, 0.5)',
                      animation: 'pulse 1s ease-in-out infinite'
                    }}
                  />
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,77,0,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,77,0,0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '30px 30px',
                      animation: 'scan-grid 2s linear infinite'
                    }}
                  />
                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-accent" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-accent" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-accent" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-accent" />
                </div>

                {/* AI Status */}
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                    <span className="text-accent font-mono text-sm uppercase tracking-wider">AI Processing</span>
                  </div>
                  <p className="text-white font-medium text-lg mb-2">{scanPhase || "Initializing..."}</p>
                  <div className="w-64 h-2 bg-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-orange-400 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-3">{Math.round(scanProgress)}% complete</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-[4px] text-error text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="space-y-4 order-2 lg:order-2">
          {/* Silhouette Controls */}
          {cleanedImageData && (
            <div className="bg-carbon rounded-[4px] p-4 space-y-4">
              <h3 className="font-heading text-lg">Outline Controls</h3>

              <div>
                <label className="text-sm text-text-secondary block mb-2">
                  Gap Fill: {gapFill}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="2"
                  value={gapFill}
                  onChange={(e) => setGapFill(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Follow Details</span>
                  <span>Bridge Gaps</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary block mb-2">
                  Margin: {margin}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Tight Fit</span>
                  <span>Loose Fit</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary block mb-2">
                  Smoothing: {smoothing}
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={smoothing}
                  onChange={(e) => setSmoothing(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Detailed</span>
                  <span>Smooth</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary block mb-2">
                  Min Object Size: {minArea}px²
                </label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={minArea}
                  onChange={(e) => setMinArea(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Include Small</span>
                  <span>Large Only</span>
                </div>
                {/* Reminder about reference items */}
                <div className="mt-3 p-2 bg-accent/10 border border-accent/30 rounded text-xs text-accent">
                  <strong>Tip:</strong> Lower this value if your reference item (credit card, quarter) is not being detected.
                </div>
              </div>
            </div>
          )}

          {/* Items Panel */}
          <div className="bg-carbon rounded-[4px] p-4">
            <h3 className="font-heading text-lg mb-4">
              Detected Items ({items.length})
            </h3>

            {items.length === 0 ? (
              <p className="text-text-muted text-sm">
                Click Auto-Detect to find items. The AI will remove the background and create clean silhouettes.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const match = templateMatches[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-dark rounded-[4px]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex flex-col min-w-0">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              setItems(items.map(i =>
                                i.id === item.id ? { ...i, name: e.target.value } : i
                              ));
                            }}
                            className="bg-transparent border-none text-sm focus:outline-none w-full"
                          />
                          {match && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-3 h-3 text-accent" />
                              <span className="text-xs text-accent">
                                {match.confidence}% match
                              </span>
                              <span className="text-xs text-text-muted">
                                ({match.category})
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-text-muted flex-shrink-0">
                          {item.points.length} pts
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-error text-lg ml-2"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-carbon rounded-[4px] p-4">
            <h3 className="font-heading text-sm mb-2">How it works</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>1. <strong>Auto-Detect</strong> removes background with AI</li>
              <li>2. <strong>Margin</strong> adds padding for snug foam fit</li>
              <li>3. <strong>Smoothing</strong> simplifies the outline curve</li>
              <li>4. <strong>Min Size</strong> filters out small debris</li>
              <li>5. Remove unwanted items with ×</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={async () => {
            // Save to admin panel
            try {
              await fetch("/api/designs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  status: "scanned",
                  imageUrl,
                  imageWidth,
                  imageHeight,
                  items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    points: item.points,
                    color: item.color,
                  })),
                }),
              });
            } catch (e) {
              console.error("Failed to save design:", e);
            }
            onComplete(items);
          }}
          disabled={items.length === 0}
        >
          Continue ({items.length} items)
        </Button>
      </div>
    </div>
  );
}
