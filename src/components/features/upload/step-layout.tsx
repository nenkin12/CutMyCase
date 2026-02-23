"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCw, Trash2, ZoomIn, ZoomOut, Copy, Plus, Minus, Settings2, Image as ImageIcon, ImageOff, Package, Search, X, Box, Layers } from "lucide-react";
import { Foam3DPreview } from "./foam-3d-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SegmentedItem {
  id: string;
  name: string;
  points: number[][];
  color: string;
  depth?: number;
}

interface LayoutItem {
  id: string;
  name: string;
  points: number[][]; // In inches, relative to item origin (smoothed)
  rawPoints: number[][]; // Original points before processing
  color: string;
  x: number; // Position in inches
  y: number;
  rotation: number; // Degrees
  width: number; // Bounding box in inches
  height: number;
  depth: number; // Cutout depth in inches
  // Source image crop info (in pixels)
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

// Gentle smoothing - simplify the contour while preserving shape
function smoothPoints(points: number[][], iterations: number): number[][] {
  if (iterations <= 0 || points.length < 3) return points;

  let result = [...points];

  // First, simplify to reduce noise (Douglas-Peucker)
  // Higher iterations = more simplification
  const epsilon = 0.02 * iterations; // Scale with iterations
  result = simplifyPath(result, epsilon);

  // Then apply gentle Chaikin smoothing (just 1-2 passes)
  const smoothPasses = Math.min(iterations, 2);
  for (let iter = 0; iter < smoothPasses; iter++) {
    const newPoints: number[][] = [];

    for (let i = 0; i < result.length; i++) {
      const p0 = result[i];
      const p1 = result[(i + 1) % result.length];

      // Create two new points at 1/4 and 3/4 along each edge
      newPoints.push([
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1]
      ]);
      newPoints.push([
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1]
      ]);
    }

    result = newPoints;
  }

  // Final simplification to keep point count reasonable
  if (result.length > 200) {
    result = simplifyPath(result, 0.01);
  }

  return result;
}

// Douglas-Peucker path simplification
function simplifyPath(points: number[][], epsilon: number): number[][] {
  if (points.length < 3) return points;

  // Find the point with the maximum distance from line between first and last
  let maxDist = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const lineLengthSq = dx * dx + dy * dy;

  if (lineLengthSq === 0) {
    return Math.sqrt(Math.pow(point[0] - lineStart[0], 2) + Math.pow(point[1] - lineStart[1], 2));
  }

  const t = Math.max(0, Math.min(1, ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / lineLengthSq));
  const projX = lineStart[0] + t * dx;
  const projY = lineStart[1] + t * dy;

  return Math.sqrt(Math.pow(point[0] - projX, 2) + Math.pow(point[1] - projY, 2));
}

interface CaseSize {
  id: string;
  name: string;
  innerWidth: number; // inches
  innerHeight: number; // inches
  brand: string;
  image: string;
  productUrl: string;
}

// Preset item from the catalog
interface PresetItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  points: number[][];
  widthInches: number;
  heightInches: number;
  depthInches: number;
  tags: string[];
}

// PresetShapeCanvas for displaying preset shapes
function PresetShapeCanvas({ points, width = 60, height = 60 }: { points: number[][]; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points || points.length < 3) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const shapeWidth = maxX - minX;
    const shapeHeight = maxY - minY;

    const padding = 5;
    const scaleX = (width - padding * 2) / shapeWidth;
    const scaleY = (height - padding * 2) / shapeHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - shapeWidth * scale) / 2 - minX * scale;
    const offsetY = (height - shapeHeight * scale) / 2 - minY * scale;

    ctx.fillStyle = "rgba(255, 126, 0, 0.2)";
    ctx.strokeStyle = "#ff7e00";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    points.forEach((point, i) => {
      const x = point[0] * scale + offsetX;
      const y = point[1] * scale + offsetY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [points, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="bg-carbon rounded" />;
}

// Preset picker modal
function PresetPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (preset: PresetItem) => void;
  onClose: () => void;
}) {
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const CATEGORIES = [
    { value: "", label: "All" },
    { value: "drone", label: "Drones" },
    { value: "battery", label: "Batteries" },
    { value: "camera", label: "Cameras" },
    { value: "lens", label: "Lenses" },
    { value: "controller", label: "Controllers" },
    { value: "accessory", label: "Accessories" },
  ];

  useEffect(() => {
    fetchPresets();
  }, [categoryFilter, searchQuery]);

  const fetchPresets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("active", "true");

      const response = await fetch(`/api/presets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      }
    } catch (err) {
      console.error("Failed to fetch presets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (preset: PresetItem) => {
    // Track usage
    try {
      await fetch("/api/presets/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId: preset.id }),
      });
    } catch (err) {
      console.error("Failed to track preset usage:", err);
    }

    onSelect(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-heading flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            Add Preset Item
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search presets..."
                className="w-full bg-carbon border border-border rounded pl-10 pr-4 py-2 text-white text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-carbon border border-border rounded px-3 py-2 text-white text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading presets...</div>
          ) : presets.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">No presets found</p>
              <p className="text-sm text-text-muted mt-1">
                Try adjusting your search or check back later
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className="bg-carbon border border-border rounded-lg p-3 hover:border-accent transition-colors text-left"
                >
                  <div className="flex justify-center mb-2">
                    <PresetShapeCanvas points={preset.points} width={80} height={60} />
                  </div>
                  <h4 className="font-medium text-sm truncate">{preset.name}</h4>
                  <p className="text-xs text-text-muted">{preset.brand}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {preset.widthInches.toFixed(1)}" x {preset.heightInches.toFixed(1)}"
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CASE_SIZES: CaseSize[] = [
  {
    id: "pelican-1535",
    name: "1535 Air",
    brand: "Pelican",
    innerWidth: 20.39,
    innerHeight: 11.20,
    image: "/images/cases/pelican-1535.png",
    productUrl: "https://www.pelican.com/us/en/product/cases/1535"
  },
  {
    id: "pelican-1615",
    name: "1615 Air",
    brand: "Pelican",
    innerWidth: 29.59,
    innerHeight: 15.50,
    image: "/images/cases/pelican-1615.png",
    productUrl: "https://www.pelican.com/us/en/product/cases/1615"
  },
  {
    id: "pelican-v300",
    name: "V300 Vault",
    brand: "Pelican",
    innerWidth: 16.00,
    innerHeight: 11.00,
    image: "/images/cases/pelican-v300.png",
    productUrl: "https://www.pelican.com/us/en/product/cases/v300"
  },
  {
    id: "pelican-v800",
    name: "V800 Vault",
    brand: "Pelican",
    innerWidth: 53.00,
    innerHeight: 16.00,
    image: "/images/cases/pelican-v800.png",
    productUrl: "https://www.pelican.com/us/en/product/cases/v800"
  },
];

interface StepLayoutProps {
  segmentedItems: SegmentedItem[];
  pixelsPerInch: number;
  imageWidth: number;
  imageHeight: number;
  imageUrl: string;
  onComplete: (layoutItems: LayoutItem[], caseId: string, caseName: string, caseWidth: number, caseHeight: number) => void;
  onBack: () => void;
}

export function StepLayout({
  segmentedItems,
  pixelsPerInch,
  imageWidth,
  imageHeight,
  imageUrl,
  onComplete,
  onBack,
}: StepLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedCase, setSelectedCase] = useState<string>("pelican-1615");
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [fitPercentage, setFitPercentage] = useState(0);

  // Custom size state
  const [customWidth, setCustomWidth] = useState<string>("24");
  const [customHeight, setCustomHeight] = useState<string>("18");

  // Processing settings
  const [smoothingLevel, setSmoothingLevel] = useState(2); // 0-5 (2 = gentle smoothing, good default)
  const [showProcessingPanel, setShowProcessingPanel] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(false);

  // Load source image for preview
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setSourceImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  const currentCase: CaseSize = selectedCase === "custom"
    ? {
        id: "custom",
        name: "Custom",
        brand: "Custom",
        innerWidth: parseFloat(customWidth) || 24,
        innerHeight: parseFloat(customHeight) || 18,
        image: "",
        productUrl: ""
      }
    : CASE_SIZES.find(c => c.id === selectedCase)!;

  // Scale: pixels per inch for display
  const DISPLAY_SCALE = 30; // 30 pixels per inch on screen

  // Minimum border margin required around items (in inches)
  const BORDER_MARGIN = 1;

  // Auto-zoom to fit case in container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get container dimensions (max available space)
    const containerWidth = container.clientWidth || 800;
    // Use viewport height for mobile responsiveness
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = viewportHeight < 800;
    // On mobile, limit canvas to ~45% of viewport; on desktop, allow more
    const maxHeight = isMobile ? Math.min(viewportHeight * 0.45, 400) : 550;

    // Calculate the canvas size at zoom=1
    const canvasWidthAtZoom1 = (currentCase.innerWidth + 2) * DISPLAY_SCALE;
    const canvasHeightAtZoom1 = (currentCase.innerHeight + 2) * DISPLAY_SCALE;

    // Calculate zoom to fit width and height
    const zoomToFitWidth = (containerWidth - 20) / canvasWidthAtZoom1;
    const zoomToFitHeight = maxHeight / canvasHeightAtZoom1;

    // Use the smaller zoom to ensure it fits both dimensions
    const autoZoom = Math.min(zoomToFitWidth, zoomToFitHeight, 1); // Cap at 1 (don't zoom in)

    setZoom(Math.max(0.2, autoZoom)); // Lower minimum zoom on mobile (0.2 instead of 0.25)
  }, [currentCase, selectedCase, customWidth, customHeight]);

  // Process points with smoothing
  const processPoints = useCallback((
    rawPoints: number[][]
  ): number[][] => {
    // Apply smoothing
    return smoothPoints(rawPoints, smoothingLevel);
  }, [smoothingLevel]);

  // Convert segmented items to layout items
  useEffect(() => {
    const items: LayoutItem[] = segmentedItems
      .filter(item => item.name.toLowerCase() !== "credit card" &&
                      !item.name.toLowerCase().includes("card") &&
                      !item.name.toLowerCase().includes("quarter"))
      .map((item, index) => {
        // Calculate source bounding box in pixels (before conversion)
        const sourceXs = item.points.map(p => p[0]);
        const sourceYs = item.points.map(p => p[1]);
        const sourceMinX = Math.min(...sourceXs);
        const sourceMinY = Math.min(...sourceYs);
        const sourceMaxX = Math.max(...sourceXs);
        const sourceMaxY = Math.max(...sourceYs);

        // Convert points from pixels to inches
        const pointsInInches = item.points.map(p => [
          p[0] / pixelsPerInch,
          p[1] / pixelsPerInch
        ]);

        // Calculate bounding box in inches
        const xs = pointsInInches.map(p => p[0]);
        const ys = pointsInInches.map(p => p[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const width = maxX - minX;
        const height = maxY - minY;

        // Normalize points to be relative to item's origin
        const rawPoints = pointsInInches.map(p => [
          p[0] - minX,
          p[1] - minY
        ]);

        // Apply smoothing
        const processedPoints = processPoints(rawPoints);

        // Initial position: spread items out (starting from safe zone)
        const col = index % 3;
        const row = Math.floor(index / 3);

        return {
          id: item.id,
          name: item.name,
          points: processedPoints,
          rawPoints,
          color: item.color,
          x: 1 + col * (width + 0.5), // BORDER_MARGIN (1 inch) + offset
          y: 1 + row * (height + 0.5), // BORDER_MARGIN (1 inch) + offset
          rotation: 0,
          width,
          height,
          depth: item.depth ?? 1.5, // Default to 1.5" if not specified
          sourceX: sourceMinX,
          sourceY: sourceMinY,
          sourceWidth: sourceMaxX - sourceMinX,
          sourceHeight: sourceMaxY - sourceMinY,
        };
      });

    setLayoutItems(items);
  }, [segmentedItems, pixelsPerInch, processPoints]);

  // Calculate fit percentage (items must be at least BORDER_MARGIN inches from edges)
  useEffect(() => {
    if (layoutItems.length === 0) {
      setFitPercentage(0);
      return;
    }

    let itemsInside = 0;
    layoutItems.forEach(item => {
      const itemRight = item.x + item.width;
      const itemBottom = item.y + item.height;

      // Check if item is within the safe zone (1 inch from all edges)
      if (item.x >= BORDER_MARGIN &&
          item.y >= BORDER_MARGIN &&
          itemRight <= currentCase.innerWidth - BORDER_MARGIN &&
          itemBottom <= currentCase.innerHeight - BORDER_MARGIN) {
        itemsInside++;
      }
    });

    setFitPercentage(Math.round((itemsInside / layoutItems.length) * 100));
  }, [layoutItems, currentCase]);

  // Draw the layout
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = DISPLAY_SCALE * zoom;

    // Set canvas size
    canvas.width = (currentCase.innerWidth + 2) * scale;
    canvas.height = (currentCase.innerHeight + 2) * scale;

    // Clear
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw case outline
    ctx.save();
    ctx.translate(scale, scale); // 1 inch margin

    // Case background
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, currentCase.innerWidth * scale, currentCase.innerHeight * scale);

    // Case border
    ctx.strokeStyle = "#FF4D00";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, currentCase.innerWidth * scale, currentCase.innerHeight * scale);

    // Draw 1 inch margin zone (safe area indicator)
    const marginPixels = BORDER_MARGIN * scale;

    // Fill the margin zone with a subtle color
    ctx.fillStyle = "rgba(255, 77, 0, 0.08)";
    // Top margin
    ctx.fillRect(0, 0, currentCase.innerWidth * scale, marginPixels);
    // Bottom margin
    ctx.fillRect(0, (currentCase.innerHeight - BORDER_MARGIN) * scale, currentCase.innerWidth * scale, marginPixels);
    // Left margin
    ctx.fillRect(0, marginPixels, marginPixels, (currentCase.innerHeight - 2 * BORDER_MARGIN) * scale);
    // Right margin
    ctx.fillRect((currentCase.innerWidth - BORDER_MARGIN) * scale, marginPixels, marginPixels, (currentCase.innerHeight - 2 * BORDER_MARGIN) * scale);

    // Draw inner safe zone border (dashed line)
    ctx.strokeStyle = "#FF4D0050";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      marginPixels,
      marginPixels,
      (currentCase.innerWidth - 2 * BORDER_MARGIN) * scale,
      (currentCase.innerHeight - 2 * BORDER_MARGIN) * scale
    );
    ctx.setLineDash([]); // Reset line dash

    // Draw grid (1 inch squares)
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= currentCase.innerWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, currentCase.innerHeight * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= currentCase.innerHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(currentCase.innerWidth * scale, y * scale);
      ctx.stroke();
    }

    // Draw items
    layoutItems.forEach(item => {
      ctx.save();
      ctx.translate(item.x * scale, item.y * scale);
      ctx.rotate((item.rotation * Math.PI) / 180);

      // Check if item is outside safe zone (must be 1 inch from edges)
      const isOutside = item.x < BORDER_MARGIN ||
        item.y < BORDER_MARGIN ||
        item.x + item.width > currentCase.innerWidth - BORDER_MARGIN ||
        item.y + item.height > currentCase.innerHeight - BORDER_MARGIN;

      // Draw item shape path
      ctx.beginPath();
      if (item.points.length > 0) {
        ctx.moveTo(item.points[0][0] * scale, item.points[0][1] * scale);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i][0] * scale, item.points[i][1] * scale);
        }
        ctx.closePath();
      }

      // Fill with image preview or solid color
      const isSelected = item.id === selectedItemId;

      if (showImagePreview && sourceImage) {
        // Clip to shape and draw source image
        ctx.save();
        ctx.clip();

        // Draw the cropped portion of the source image
        ctx.drawImage(
          sourceImage,
          item.sourceX,
          item.sourceY,
          item.sourceWidth,
          item.sourceHeight,
          0,
          0,
          item.width * scale,
          item.height * scale
        );

        ctx.restore();

        // Draw border on top
        ctx.beginPath();
        if (item.points.length > 0) {
          ctx.moveTo(item.points[0][0] * scale, item.points[0][1] * scale);
          for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i][0] * scale, item.points[i][1] * scale);
          }
          ctx.closePath();
        }
      }

      // Set styles based on selection state
      if (isSelected) {
        if (!showImagePreview) ctx.fillStyle = "#FF4D0040";
        ctx.strokeStyle = "#FF4D00";
        ctx.lineWidth = 3;
      } else if (isOutside) {
        if (!showImagePreview) ctx.fillStyle = "#ff000030";
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
      } else {
        if (!showImagePreview) ctx.fillStyle = item.color + "30";
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
      }

      if (!showImagePreview) {
        ctx.fill();
      }
      ctx.stroke();

      // Draw item name (only when not showing image preview for clarity)
      if (!showImagePreview) {
        ctx.fillStyle = "#fff";
        ctx.font = `${12 * zoom}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(item.name, (item.width * scale) / 2, (item.height * scale) / 2 + 4);
      }

      ctx.restore();
    });

    ctx.restore();

    // Draw dimensions
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${currentCase.innerWidth}" × ${currentCase.innerHeight}"`,
      canvas.width / 2,
      canvas.height - 10
    );
  }, [layoutItems, currentCase, selectedItemId, zoom, showImagePreview, sourceImage]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = DISPLAY_SCALE * zoom;
    const x = (e.clientX - rect.left) / scale - 1; // Account for margin
    const y = (e.clientY - rect.top) / scale - 1;

    // Find clicked item (reverse order for z-index)
    for (let i = layoutItems.length - 1; i >= 0; i--) {
      const item = layoutItems[i];
      if (x >= item.x && x <= item.x + item.width &&
          y >= item.y && y <= item.y + item.height) {
        setSelectedItemId(item.id);
        setIsDragging(true);
        setDragOffset({ x: x - item.x, y: y - item.y });
        return;
      }
    }

    setSelectedItemId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedItemId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = DISPLAY_SCALE * zoom;
    const x = (e.clientX - rect.left) / scale - 1;
    const y = (e.clientY - rect.top) / scale - 1;

    setLayoutItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        return {
          ...item,
          x: Math.max(-item.width / 2, x - dragOffset.x),
          y: Math.max(-item.height / 2, y - dragOffset.y),
        };
      }
      return item;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const rotateSelected = () => {
    if (!selectedItemId) return;

    setLayoutItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        const oldWidth = item.width;
        const oldHeight = item.height;

        // Calculate center of item before rotation
        const centerX = item.x + oldWidth / 2;
        const centerY = item.y + oldHeight / 2;

        // Rotate points 90 degrees clockwise around center
        // For a 90° clockwise rotation: new_x = y, new_y = oldWidth - x
        const rotatedPoints = item.points.map(p => [
          p[1],                    // new x = old y
          oldWidth - p[0]          // new y = oldWidth - old x
        ]);

        const rotatedRawPoints = item.rawPoints.map(p => [
          p[1],
          oldWidth - p[0]
        ]);

        // New dimensions (swapped)
        const newWidth = oldHeight;
        const newHeight = oldWidth;

        // Calculate new position so center stays the same
        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;

        return {
          ...item,
          rotation: 0,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          points: rotatedPoints,
          rawPoints: rotatedRawPoints,
          sourceWidth: item.sourceHeight,
          sourceHeight: item.sourceWidth,
        };
      }
      return item;
    }));
  };

  const deleteSelected = () => {
    if (!selectedItemId) return;
    setLayoutItems(prev => prev.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
  };

  const duplicateSelected = () => {
    if (!selectedItemId) return;

    const item = layoutItems.find(i => i.id === selectedItemId);
    if (!item) return;

    // Generate new ID with timestamp
    const newId = `${item.id}_copy_${Date.now()}`;

    // Create duplicate with offset position
    const newItem: LayoutItem = {
      ...item,
      id: newId,
      name: `${item.name}`,
      x: item.x + 0.5, // Offset slightly
      y: item.y + 0.5,
    };

    setLayoutItems(prev => [...prev, newItem]);
    setSelectedItemId(newId); // Select the new item
  };

  const addMultipleCopies = (count: number) => {
    if (!selectedItemId) return;

    const item = layoutItems.find(i => i.id === selectedItemId);
    if (!item) return;

    const newItems: LayoutItem[] = [];
    for (let i = 0; i < count; i++) {
      const newId = `${item.id}_copy_${Date.now()}_${i}`;
      newItems.push({
        ...item,
        id: newId,
        name: `${item.name}`,
        x: item.x + (i + 1) * 0.5,
        y: item.y + (i + 1) * 0.5,
      });
    }

    setLayoutItems(prev => [...prev, ...newItems]);
  };

  // Add a preset item to the layout
  const addPresetToLayout = useCallback((preset: PresetItem) => {
    // Normalize preset points to be relative to origin (0,0)
    const xs = preset.points.map(p => p[0]);
    const ys = preset.points.map(p => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    const normalizedPoints = preset.points.map(p => [
      p[0] - minX,
      p[1] - minY
    ]);

    // Apply smoothing
    const processedPoints = processPoints(normalizedPoints);

    // Create a new layout item
    const newId = `preset_${preset.id}_${Date.now()}`;
    const newItem: LayoutItem = {
      id: newId,
      name: preset.name,
      points: processedPoints,
      rawPoints: normalizedPoints,
      color: "#ff7e00", // Accent color for presets
      x: BORDER_MARGIN + 0.5, // Start in safe zone
      y: BORDER_MARGIN + 0.5,
      rotation: 0,
      width: preset.widthInches,
      height: preset.heightInches,
      depth: preset.depthInches,
      sourceX: 0,
      sourceY: 0,
      sourceWidth: 0,
      sourceHeight: 0,
    };

    setLayoutItems(prev => [...prev, newItem]);
    setSelectedItemId(newId);
  }, [processPoints]);

  const autoArrange = () => {
    // Smart auto-arrange with guaranteed no overlapping
    const spacing = 0.5; // 0.5" minimum spacing between items
    const safeAreaX = BORDER_MARGIN;
    const safeAreaY = BORDER_MARGIN;
    const safeAreaWidth = currentCase.innerWidth - 2 * BORDER_MARGIN;
    const safeAreaHeight = currentCase.innerHeight - 2 * BORDER_MARGIN;
    const maxX = safeAreaX + safeAreaWidth;
    const maxY = safeAreaY + safeAreaHeight;

    // Track placed item bounding boxes
    const placed: { x: number; y: number; w: number; h: number }[] = [];

    // Check if a rectangle overlaps with any placed item (including spacing)
    const overlaps = (x: number, y: number, w: number, h: number): boolean => {
      for (const p of placed) {
        // Two rectangles overlap if they are NOT separated
        // They are separated if one is completely to the left, right, above, or below the other
        const separated =
          x >= p.x + p.w + spacing ||  // new item is to the right
          x + w + spacing <= p.x ||     // new item is to the left
          y >= p.y + p.h + spacing ||  // new item is below
          y + h + spacing <= p.y;       // new item is above

        if (!separated) return true; // overlapping
      }
      return false;
    };

    // Find first non-overlapping position by scanning left-to-right, top-to-bottom
    const findPosition = (w: number, h: number): { x: number; y: number } => {
      const step = 0.25; // Fine-grained search

      for (let y = safeAreaY; y + h <= maxY; y += step) {
        for (let x = safeAreaX; x + w <= maxX; x += step) {
          if (!overlaps(x, y, w, h)) {
            return { x, y };
          }
        }
      }

      // No space found - place at origin as fallback
      return { x: safeAreaX, y: safeAreaY };
    };

    // Get item type for grouping
    const getItemType = (name: string): string => {
      return name.toLowerCase()
        .replace(/[0-9]+/g, '')
        .replace(/copy/gi, '')
        .replace(/_+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Group items by type
    const groups = new Map<string, LayoutItem[]>();
    layoutItems.forEach(item => {
      const type = getItemType(item.name);
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type)!.push(item);
    });

    // Sort all items by area (largest first) for optimal packing
    const allItemsSorted = [...layoutItems].sort((a, b) =>
      (b.width * b.height) - (a.width * a.height)
    );

    const arranged: LayoutItem[] = [];

    // Place items one by one, largest first
    allItemsSorted.forEach(item => {
      const pos = findPosition(item.width, item.height);
      arranged.push({ ...item, x: pos.x, y: pos.y });
      placed.push({ x: pos.x, y: pos.y, w: item.width, h: item.height });
    });

    setLayoutItems(arranged);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading mb-2">Arrange Your Layout</h2>
        <p className="text-text-secondary text-sm sm:text-base">
          Drag items to arrange them in the case. Select a case size that fits.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 order-1">
          {/* 2D/3D Toggle Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShow3DPreview(false)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                  !show3DPreview
                    ? "bg-accent text-white"
                    : "bg-carbon text-text-muted hover:text-white"
                )}
              >
                <Layers className="w-4 h-4" />
                2D Layout
              </button>
              <button
                onClick={() => setShow3DPreview(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                  show3DPreview
                    ? "bg-accent text-white"
                    : "bg-carbon text-text-muted hover:text-white"
                )}
              >
                <Box className="w-4 h-4" />
                3D Preview
              </button>
            </div>
            {show3DPreview && (
              <span className="text-xs text-text-muted">Drag to rotate</span>
            )}
          </div>

          {/* 2D Canvas View */}
          {!show3DPreview && (
            <div
              ref={containerRef}
              className="bg-carbon rounded-[4px] overflow-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[600px]"
            >
              <canvas
                ref={canvasRef}
                className="block cursor-move touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const syntheticEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  } as React.MouseEvent<HTMLCanvasElement>;
                  handleMouseDown(syntheticEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const syntheticEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  } as React.MouseEvent<HTMLCanvasElement>;
                  handleMouseMove(syntheticEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleMouseUp();
                }}
              />
            </div>
          )}

          {/* 3D Preview View */}
          {show3DPreview && (
            <div className="bg-carbon rounded-[4px] overflow-hidden h-[50vh] sm:h-[60vh] lg:h-[600px]">
              <Foam3DPreview
                caseWidth={currentCase.innerWidth}
                caseHeight={currentCase.innerHeight}
                foamDepth={2.5}
                items={layoutItems.map(item => ({
                  id: item.id,
                  name: item.name,
                  points: item.points,
                  x: item.x,
                  y: item.y,
                  width: item.width,
                  height: item.height,
                  depth: item.depth,
                  color: item.color,
                }))}
              />
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-3 sm:mt-4 p-2 bg-carbon rounded-[4px]">
            {/* Zoom Controls - Only in 2D mode */}
            {!show3DPreview && (
              <div className="flex items-center gap-1 pr-2 border-r border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                  title="Zoom out"
                  className="p-1.5 sm:p-2"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-text-muted w-8 sm:w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                  title="Zoom in"
                  className="p-1.5 sm:p-2"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* View Toggle - Only in 2D mode */}
            {!show3DPreview && (
              <Button
                variant={showImagePreview ? "default" : "secondary"}
                size="sm"
                onClick={() => setShowImagePreview(!showImagePreview)}
                title={showImagePreview ? "Hide preview" : "Show preview"}
                className="p-1.5 sm:p-2"
              >
                {showImagePreview ? <ImageIcon className="w-4 h-4" /> : <ImageOff className="w-4 h-4" />}
              </Button>
            )}

            {/* 3D mode info */}
            {show3DPreview && (
              <div className="text-xs text-text-muted">
                Use mouse to orbit, scroll to zoom
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1 min-w-0" />

            {/* Action Buttons - Only in 2D mode */}
            {!show3DPreview && (
              <>
                <Button variant="secondary" size="sm" onClick={autoArrange} title="Auto-arrange items" className="text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">Auto-Arrange</span>
                  <span className="sm:hidden">Arrange</span>
                </Button>

                {/* Item Actions (only when item selected) */}
                {selectedItemId && (
                  <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={rotateSelected}
                      title="Rotate 90°"
                      className="p-1.5 sm:p-2"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={duplicateSelected}
                      title="Duplicate"
                      className="p-1.5 sm:p-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={deleteSelected}
                      title="Remove"
                      className="hover:bg-error/20 hover:text-error p-1.5 sm:p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 sm:space-y-4 order-2 max-h-[40vh] sm:max-h-[50vh] lg:max-h-[600px] overflow-y-auto">
          {/* Fit Indicator - Compact on mobile */}
          <div className={cn(
            "rounded-[4px] p-2 sm:p-4 text-center",
            fitPercentage === 100 ? "bg-success/20" : fitPercentage > 0 ? "bg-warning/20" : "bg-error/20"
          )}>
            <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0">
              <div className={cn(
                "text-2xl sm:text-4xl font-heading",
                fitPercentage === 100 ? "text-success" : fitPercentage > 0 ? "text-warning" : "text-error"
              )}>
                {fitPercentage}%
              </div>
              <div className="text-xs sm:text-sm text-text-muted">
                {fitPercentage === 100 ? "All items fit!" :
                 fitPercentage > 0 ? "Items too close to edge" : "No items placed"}
                <span className="sm:hidden"> (1" border)</span>
              </div>
            </div>
            <div className="hidden sm:block text-xs text-text-muted mt-1">
              1" border required
            </div>
          </div>

          {/* Processing Settings */}
          <div className="bg-carbon rounded-[4px] p-3 sm:p-4">
            <button
              onClick={() => setShowProcessingPanel(!showProcessingPanel)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="font-heading text-xs sm:text-sm flex items-center gap-2">
                <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Shape Processing
              </h3>
              <span className="text-xs text-text-muted">
                {showProcessingPanel ? "▲" : "▼"}
              </span>
            </button>

            {showProcessingPanel && (
              <div className="mt-4 space-y-4">
                {/* Smoothing */}
                <div>
                  <label className="text-xs text-text-muted block mb-2">
                    Smoothing: {smoothingLevel === 0 ? "Off" : `Level ${smoothingLevel}`}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={smoothingLevel}
                    onChange={(e) => setSmoothingLevel(parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>Sharp</span>
                    <span>Smooth</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Case Selection */}
          <div className="bg-carbon rounded-[4px] p-3 sm:p-4">
            <h3 className="font-heading text-xs sm:text-sm mb-2 sm:mb-3">Select Case</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-48 sm:max-h-72 overflow-y-auto">
              {CASE_SIZES.map(caseSize => (
                <button
                  key={caseSize.id}
                  onClick={() => setSelectedCase(caseSize.id)}
                  className={cn(
                    "flex flex-col items-center p-1.5 sm:p-2 rounded-[4px] text-center transition-all",
                    selectedCase === caseSize.id
                      ? "bg-accent/20 border-2 border-accent ring-2 ring-accent/30"
                      : "hover:bg-dark border-2 border-transparent hover:border-accent/30"
                  )}
                >
                  {/* Case Image */}
                  <div className="w-full aspect-[5/3] sm:aspect-[4/3] bg-dark rounded-[4px] overflow-hidden mb-1 sm:mb-2 flex items-center justify-center">
                    <img
                      src={caseSize.image}
                      alt={`${caseSize.brand} ${caseSize.name}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `
                          <div class="flex flex-col items-center justify-center text-text-muted">
                            <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                            <span class="text-xs">${caseSize.name}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="text-xs font-medium leading-tight">
                    {caseSize.brand} {caseSize.name}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {caseSize.innerWidth}" × {caseSize.innerHeight}"
                  </div>
                </button>
              ))}

              {/* Custom Size Option */}
              <button
                onClick={() => setSelectedCase("custom")}
                className={cn(
                  "flex flex-col items-center p-2 rounded-[4px] text-center transition-all col-span-2",
                  selectedCase === "custom"
                    ? "bg-accent/20 border-2 border-accent ring-2 ring-accent/30"
                    : "hover:bg-dark border-2 border-transparent hover:border-accent/30"
                )}
              >
                <div className="w-12 h-12 bg-dark rounded-[4px] flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-xs font-medium">Custom Size</div>
                <div className="text-[10px] text-text-muted">Enter dimensions</div>
              </button>
            </div>

            {/* Custom Size Inputs */}
            {selectedCase === "custom" && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Width (inches)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-full px-3 py-2 bg-dark border border-border rounded-[4px] text-sm focus:outline-none focus:border-accent"
                    min="1"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Height (inches)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-full px-3 py-2 bg-dark border border-border rounded-[4px] text-sm focus:outline-none focus:border-accent"
                    min="1"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="text-xs text-accent">
                  {customWidth}" × {customHeight}"
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="bg-carbon rounded-[4px] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="font-heading text-xs sm:text-sm">
                Items ({layoutItems.length})
              </h3>
              <button
                onClick={() => setShowPresetPicker(true)}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
              >
                <Package className="w-3 h-3" />
                Add Preset
              </button>
            </div>
            <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
              {layoutItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-[4px] transition-colors",
                    selectedItemId === item.id
                      ? "bg-accent/20"
                      : "hover:bg-dark"
                  )}
                >
                  <button
                    onClick={() => setSelectedItemId(item.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{item.name}</span>
                      <span className="text-[10px] text-text-muted">
                        {item.width.toFixed(1)}" × {item.height.toFixed(1)}" × {item.depth.toFixed(1)}" deep
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Duplicate this specific item
                        const newId = `${item.id}_copy_${Date.now()}`;
                        const newItem: LayoutItem = {
                          ...item,
                          id: newId,
                          x: item.x + 0.5,
                          y: item.y + 0.5,
                        };
                        setLayoutItems(prev => [...prev, newItem]);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-dark hover:bg-accent/30 text-text-muted hover:text-white"
                      title="Add copy"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayoutItems(prev => prev.filter(i => i.id !== item.id));
                        if (selectedItemId === item.id) setSelectedItemId(null);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-dark hover:bg-error/30 text-text-muted hover:text-error"
                      title="Remove"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onComplete(layoutItems, selectedCase, `${currentCase.brand} ${currentCase.name}`, currentCase.innerWidth, currentCase.innerHeight)}
          disabled={fitPercentage < 100}
        >
          Continue to Checkout
        </Button>
      </div>

      {/* Preset Picker Modal */}
      {showPresetPicker && (
        <PresetPickerModal
          onSelect={addPresetToLayout}
          onClose={() => setShowPresetPicker(false)}
        />
      )}
    </div>
  );
}
