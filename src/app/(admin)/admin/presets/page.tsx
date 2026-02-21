"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Upload,
  X,
  Check,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

interface PresetItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  points: number[][];
  widthInches: number;
  heightInches: number;
  depthInches: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const CATEGORIES = [
  { value: "drone", label: "Drones" },
  { value: "battery", label: "Batteries" },
  { value: "camera", label: "Cameras" },
  { value: "lens", label: "Lenses" },
  { value: "controller", label: "Controllers" },
  { value: "accessory", label: "Accessories" },
  { value: "charger", label: "Chargers" },
  { value: "filter", label: "Filters" },
  { value: "propeller", label: "Propellers" },
  { value: "case", label: "Cases" },
  { value: "other", label: "Other" },
];

const BRANDS = [
  "DJI",
  "Sony",
  "Canon",
  "Nikon",
  "GoPro",
  "Insta360",
  "Panasonic",
  "Fujifilm",
  "Blackmagic",
  "Zhiyun",
  "Rode",
  "Sennheiser",
  "Other",
];

// Canvas component to render preset shape
function PresetShapeCanvas({ points, width = 120, height = 80 }: { points: number[][]; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points || points.length < 3) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bounds
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const shapeWidth = maxX - minX;
    const shapeHeight = maxY - minY;

    // Calculate scale to fit in canvas with padding
    const padding = 10;
    const scaleX = (width - padding * 2) / shapeWidth;
    const scaleY = (height - padding * 2) / shapeHeight;
    const scale = Math.min(scaleX, scaleY);

    // Center offset
    const offsetX = (width - shapeWidth * scale) / 2 - minX * scale;
    const offsetY = (height - shapeHeight * scale) / 2 - minY * scale;

    // Draw shape
    ctx.fillStyle = "rgba(255, 126, 0, 0.2)";
    ctx.strokeStyle = "#ff7e00";
    ctx.lineWidth = 2;

    ctx.beginPath();
    points.forEach((point, i) => {
      const x = point[0] * scale + offsetX;
      const y = point[1] * scale + offsetY;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [points, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="bg-carbon rounded"
    />
  );
}

// Parse SVG path data to extract points
function parseSvgPath(pathData: string): number[][] {
  const points: number[][] = [];
  // Remove newlines and extra spaces
  const normalized = pathData.replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ').trim();

  // Split into commands
  const commands = normalized.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];

  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of commands) {
    const type = cmd[0];
    const args = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));

    switch (type) {
      case 'M': // Move to absolute
        currentX = args[0];
        currentY = args[1];
        startX = currentX;
        startY = currentY;
        points.push([currentX, currentY]);
        // Additional pairs are implicit lineto
        for (let i = 2; i < args.length; i += 2) {
          currentX = args[i];
          currentY = args[i + 1];
          points.push([currentX, currentY]);
        }
        break;
      case 'm': // Move to relative
        currentX += args[0];
        currentY += args[1];
        startX = currentX;
        startY = currentY;
        points.push([currentX, currentY]);
        for (let i = 2; i < args.length; i += 2) {
          currentX += args[i];
          currentY += args[i + 1];
          points.push([currentX, currentY]);
        }
        break;
      case 'L': // Line to absolute
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i];
          currentY = args[i + 1];
          points.push([currentX, currentY]);
        }
        break;
      case 'l': // Line to relative
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i];
          currentY += args[i + 1];
          points.push([currentX, currentY]);
        }
        break;
      case 'H': // Horizontal line absolute
        for (const x of args) {
          currentX = x;
          points.push([currentX, currentY]);
        }
        break;
      case 'h': // Horizontal line relative
        for (const dx of args) {
          currentX += dx;
          points.push([currentX, currentY]);
        }
        break;
      case 'V': // Vertical line absolute
        for (const y of args) {
          currentY = y;
          points.push([currentX, currentY]);
        }
        break;
      case 'v': // Vertical line relative
        for (const dy of args) {
          currentY += dy;
          points.push([currentX, currentY]);
        }
        break;
      case 'C': // Cubic bezier absolute - sample points along curve
        for (let i = 0; i < args.length; i += 6) {
          const x1 = args[i], y1 = args[i+1];
          const x2 = args[i+2], y2 = args[i+3];
          const x3 = args[i+4], y3 = args[i+5];
          // Sample the bezier curve
          for (let t = 0.25; t <= 1; t += 0.25) {
            const mt = 1 - t;
            const x = mt*mt*mt*currentX + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3;
            const y = mt*mt*mt*currentY + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3;
            points.push([x, y]);
          }
          currentX = x3;
          currentY = y3;
        }
        break;
      case 'c': // Cubic bezier relative
        for (let i = 0; i < args.length; i += 6) {
          const x1 = currentX + args[i], y1 = currentY + args[i+1];
          const x2 = currentX + args[i+2], y2 = currentY + args[i+3];
          const x3 = currentX + args[i+4], y3 = currentY + args[i+5];
          for (let t = 0.25; t <= 1; t += 0.25) {
            const mt = 1 - t;
            const x = mt*mt*mt*currentX + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3;
            const y = mt*mt*mt*currentY + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3;
            points.push([x, y]);
          }
          currentX = x3;
          currentY = y3;
        }
        break;
      case 'Z':
      case 'z': // Close path
        if (points.length > 0 && (currentX !== startX || currentY !== startY)) {
          points.push([startX, startY]);
        }
        currentX = startX;
        currentY = startY;
        break;
      // Add more commands as needed (Q, S, T, A)
    }
  }

  return points;
}

// Parse SVG file and extract all paths
function parseSvgFile(svgContent: string): { points: number[][], width: number, height: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svg = doc.querySelector("svg");

  if (!svg) {
    throw new Error("Invalid SVG file");
  }

  // Get viewBox or width/height for dimensions
  let width = 100, height = 100;
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(parseFloat);
    if (parts.length >= 4) {
      width = parts[2];
      height = parts[3];
    }
  } else {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w) width = parseFloat(w) || 100;
    if (h) height = parseFloat(h) || 100;
  }

  // Find all path elements
  const paths = doc.querySelectorAll("path");
  let allPoints: number[][] = [];

  paths.forEach(path => {
    const d = path.getAttribute("d");
    if (d) {
      const pathPoints = parseSvgPath(d);
      allPoints = allPoints.concat(pathPoints);
    }
  });

  // Also check for polygon/polyline elements
  const polygons = doc.querySelectorAll("polygon, polyline");
  polygons.forEach(poly => {
    const pointsAttr = poly.getAttribute("points");
    if (pointsAttr) {
      const coords = pointsAttr.trim().split(/[\s,]+/).map(parseFloat);
      for (let i = 0; i < coords.length; i += 2) {
        if (!isNaN(coords[i]) && !isNaN(coords[i+1])) {
          allPoints.push([coords[i], coords[i+1]]);
        }
      }
    }
  });

  // Check for rect elements
  const rects = doc.querySelectorAll("rect");
  rects.forEach(rect => {
    const x = parseFloat(rect.getAttribute("x") || "0");
    const y = parseFloat(rect.getAttribute("y") || "0");
    const w = parseFloat(rect.getAttribute("width") || "0");
    const h = parseFloat(rect.getAttribute("height") || "0");
    if (w > 0 && h > 0) {
      allPoints.push([x, y], [x + w, y], [x + w, y + h], [x, y + h]);
    }
  });

  if (allPoints.length < 3) {
    throw new Error("No valid paths found in SVG");
  }

  // Normalize points to start at 0,0
  const xs = allPoints.map(p => p[0]);
  const ys = allPoints.map(p => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const normalizedPoints = allPoints.map(p => [p[0] - minX, p[1] - minY]);
  const actualWidth = maxX - minX;
  const actualHeight = maxY - minY;

  return {
    points: normalizedPoints,
    width: actualWidth,
    height: actualHeight,
  };
}

// Modal for creating/editing presets
function PresetModal({
  preset,
  onSave,
  onClose,
}: {
  preset?: PresetItem;
  onSave: (data: Partial<PresetItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: preset?.name || "",
    brand: preset?.brand || "DJI",
    category: preset?.category || "drone",
    subcategory: preset?.subcategory || "",
    widthInches: preset?.widthInches || 0,
    heightInches: preset?.heightInches || 0,
    depthInches: preset?.depthInches || 1.5,
    description: preset?.description || "",
    tags: preset?.tags?.join(", ") || "",
    isActive: preset?.isActive ?? true,
  });
  const [points, setPoints] = useState<number[][]>(preset?.points || []);
  const [saving, setSaving] = useState(false);
  const [svgError, setSvgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSvgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSvgError(null);

    try {
      const content = await file.text();
      const { points: svgPoints, width, height } = parseSvgFile(content);

      // Scale points to inches (assume SVG is in mm or pixels, ask user for real width)
      // For now, store raw points and let user specify actual dimensions
      setPoints(svgPoints);

      // Calculate aspect ratio to suggest dimensions
      const aspectRatio = width / height;
      if (formData.widthInches === 0 && formData.heightInches === 0) {
        // Default to reasonable size, user can adjust
        const defaultWidth = 5;
        setFormData(prev => ({
          ...prev,
          widthInches: defaultWidth,
          heightInches: defaultWidth / aspectRatio,
        }));
      }

    } catch (err) {
      setSvgError(err instanceof Error ? err.message : "Failed to parse SVG");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Scale points to match specified dimensions
  const getScaledPoints = useCallback(() => {
    if (points.length === 0) return [];

    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const currentWidth = Math.max(...xs) - Math.min(...xs);
    const currentHeight = Math.max(...ys) - Math.min(...ys);

    if (currentWidth === 0 || currentHeight === 0) return points;

    const scaleX = formData.widthInches / currentWidth;
    const scaleY = formData.heightInches / currentHeight;

    return points.map(p => [p[0] * scaleX, p[1] * scaleY]);
  }, [points, formData.widthInches, formData.heightInches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const scaledPoints = getScaledPoints();
      await onSave({
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        points: scaledPoints.length > 0 ? scaledPoints : preset?.points || [],
      });
      onClose();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const displayPoints = points.length > 0 ? getScaledPoints() : preset?.points || [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-heading">
            {preset ? "Edit Preset" : "Create Preset"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* SVG Upload */}
          <div className="bg-carbon rounded-lg p-4">
            <label className="block text-sm text-text-muted mb-2">Shape (SVG Upload)</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {displayPoints.length > 0 ? (
                  <PresetShapeCanvas points={displayPoints} width={120} height={80} />
                ) : (
                  <div className="w-[120px] h-[80px] bg-dark rounded flex items-center justify-center text-text-muted text-xs">
                    No shape
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg"
                  onChange={handleSvgUpload}
                  className="hidden"
                  id="svg-upload"
                />
                <label
                  htmlFor="svg-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-border rounded cursor-pointer hover:border-accent transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload SVG
                </label>
                <p className="text-xs text-text-muted mt-2">
                  Upload an SVG file with the exact item outline
                </p>
                {svgError && (
                  <p className="text-xs text-error mt-1">{svgError}</p>
                )}
                {points.length > 0 && (
                  <p className="text-xs text-success mt-1">
                    {points.length} points extracted from SVG
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                placeholder="e.g., DJI Mini 3 Pro"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
              >
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Subcategory</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                placeholder="e.g., Mavic Series"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Width (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.widthInches}
                onChange={(e) => setFormData({ ...formData, widthInches: parseFloat(e.target.value) || 0 })}
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Height (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.heightInches}
                onChange={(e) => setFormData({ ...formData, heightInches: parseFloat(e.target.value) || 0 })}
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Depth (inches)</label>
              <input
                type="number"
                step="0.1"
                value={formData.depthInches}
                onChange={(e) => setFormData({ ...formData, depthInches: parseFloat(e.target.value) || 0 })}
                className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-carbon border border-border rounded px-3 py-2 text-white h-20"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
              placeholder="e.g., drone, mini, portable"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm">Active (visible to users)</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !formData.name} className="flex-1">
              {saving ? "Saving..." : preset ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for creating preset from a design/scan
function CreateFromScanModal({
  onSave,
  onClose,
}: {
  onSave: (data: Partial<PresetItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ design: any; item: any } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "DJI",
    category: "drone",
    subcategory: "",
    depthInches: 1.5,
    description: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await fetch("/api/designs?limit=50");
      if (response.ok) {
        const data = await response.json();
        setDesigns(data);
      }
    } catch (err) {
      console.error("Failed to fetch designs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (design: any, item: any) => {
    setSelectedItem({ design, item });
    setFormData({
      ...formData,
      name: item.name || "Unnamed Item",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    try {
      const { design, item } = selectedItem;
      const ppi = design.pixelsPerInch || 96;

      // Calculate dimensions in inches from points
      const xs = item.points.map((p: number[]) => p[0]);
      const ys = item.points.map((p: number[]) => p[1]);
      const widthPx = Math.max(...xs) - Math.min(...xs);
      const heightPx = Math.max(...ys) - Math.min(...ys);

      await onSave({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        subcategory: formData.subcategory,
        points: item.points,
        widthInches: widthPx / ppi,
        heightInches: heightPx / ppi,
        depthInches: formData.depthInches,
        description: formData.description,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        imageUrl: design.imageUrl,
        isActive: true,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-heading">Create Preset from Scan</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading designs...</div>
          ) : !selectedItem ? (
            <div className="space-y-4">
              <p className="text-text-muted">Select an item from a previous scan to turn into a preset:</p>

              {designs.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  No designs found. Create some designs first.
                </div>
              ) : (
                <div className="grid gap-4">
                  {designs.map((design) => (
                    <div key={design.id} className="bg-carbon border border-border rounded-lg p-4">
                      <div className="flex items-start gap-4 mb-3">
                        {design.imageUrl && (
                          <img
                            src={design.imageUrl}
                            alt="Scan"
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm text-text-muted">
                            {new Date(design.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm">{design.items?.length || 0} items detected</p>
                        </div>
                      </div>

                      {design.items && design.items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {design.items.map((item: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectItem(design, item)}
                              className="bg-dark border border-border rounded p-2 hover:border-accent transition-colors text-left"
                            >
                              <PresetShapeCanvas points={item.points} width={80} height={60} />
                              <p className="text-xs mt-1 truncate">{item.name || `Item ${idx + 1}`}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-2 text-text-muted hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back to selection
              </button>

              <div className="flex justify-center mb-4">
                <PresetShapeCanvas points={selectedItem.item.points} width={200} height={120} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Brand</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                  >
                    {BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Depth (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.depthInches}
                    onChange={(e) => setFormData({ ...formData, depthInches: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-carbon border border-border rounded px-3 py-2 text-white"
                  placeholder="e.g., drone, mini, portable"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !formData.name} className="flex-1">
                  {saving ? "Creating..." : "Create Preset"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPresetsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingPreset, setEditingPreset] = useState<PresetItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFromScanModal, setShowFromScanModal] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, isAdmin, router]);

  const fetchPresets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      if (!showInactive) params.set("active", "true");
      if (searchQuery) params.set("search", searchQuery);

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
  }, [categoryFilter, showInactive, searchQuery]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPresets();
    }
  }, [user, isAdmin, fetchPresets]);

  const handleSavePreset = async (data: Partial<PresetItem>) => {
    if (editingPreset) {
      // Update
      const response = await fetch("/api/presets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPreset.id, ...data }),
      });
      if (!response.ok) throw new Error("Failed to update");
    } else {
      // Create
      const response = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create");
    }
    fetchPresets();
  };

  const handleDeletePreset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this preset?")) return;

    try {
      await fetch(`/api/presets?id=${id}`, { method: "DELETE" });
      fetchPresets();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleToggleActive = async (preset: PresetItem) => {
    try {
      await fetch("/api/presets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: preset.id, isActive: !preset.isActive }),
      });
      fetchPresets();
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="CutMyCase" className="w-8 h-8 rounded" />
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/designs" className="text-text-secondary hover:text-white">
                Designs
              </Link>
              <Link href="/admin/presets" className="text-accent">
                Presets
              </Link>
              <Link href="/admin/cases" className="text-text-secondary hover:text-white">
                Cases
              </Link>
              <Link href="/" className="text-text-secondary hover:text-white">
                View Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading">Preset Items</h1>
            <p className="text-text-muted mt-1">
              Pre-made cutouts that users can add to their case layouts
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={fetchPresets} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!confirm("This will add 22 DJI drone/battery/controller presets. Continue?")) return;
                try {
                  const res = await fetch("/api/presets/seed", { method: "POST" });
                  const data = await res.json();
                  alert(data.message || "Presets seeded!");
                  fetchPresets();
                } catch (err) {
                  alert("Failed to seed presets");
                }
              }}
            >
              <Package className="w-4 h-4 mr-2" />
              Seed DJI Presets
            </Button>
            <Button variant="secondary" onClick={() => setShowFromScanModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              From Scan
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Preset
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search presets..."
                    className="w-full bg-carbon border border-border rounded pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-carbon border border-border rounded px-3 py-2 text-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`flex items-center gap-2 px-3 py-2 rounded border ${
                  showInactive
                    ? "bg-accent/20 border-accent text-accent"
                    : "bg-carbon border-border text-text-muted"
                }`}
              >
                {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showInactive ? "Showing All" : "Active Only"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Presets Grid */}
        {loading ? (
          <div className="text-center py-12 text-text-muted">Loading presets...</div>
        ) : presets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <h3 className="text-lg font-medium mb-2">No presets found</h3>
              <p className="text-text-muted mb-4">
                Create preset items from scans or add them manually.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => setShowFromScanModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  From Scan
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <Card
                key={preset.id}
                className={`overflow-hidden ${!preset.isActive ? "opacity-60" : ""}`}
              >
                <div className="p-4">
                  <div className="flex justify-center mb-3">
                    <PresetShapeCanvas points={preset.points} width={140} height={100} />
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{preset.name}</h3>
                      <p className="text-sm text-text-muted">
                        {preset.brand} - {CATEGORIES.find((c) => c.value === preset.category)?.label || preset.category}
                      </p>
                    </div>
                    {!preset.isActive && (
                      <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-text-muted">
                    {preset.widthInches.toFixed(1)}" x {preset.heightInches.toFixed(1)}" x{" "}
                    {preset.depthInches.toFixed(1)}"
                  </div>

                  <div className="mt-2 text-xs text-text-muted">
                    Used {preset.usageCount} times
                  </div>

                  {preset.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {preset.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-carbon px-2 py-0.5 rounded text-text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                      {preset.tags.length > 3 && (
                        <span className="text-xs text-text-muted">+{preset.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-border flex divide-x divide-border">
                  <button
                    onClick={() => handleToggleActive(preset)}
                    className="flex-1 py-2 text-sm text-text-muted hover:text-white hover:bg-carbon transition-colors flex items-center justify-center gap-1"
                  >
                    {preset.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {preset.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => setEditingPreset(preset)}
                    className="flex-1 py-2 text-sm text-text-muted hover:text-white hover:bg-carbon transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="flex-1 py-2 text-sm text-error hover:bg-error/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {(showCreateModal || editingPreset) && (
        <PresetModal
          preset={editingPreset || undefined}
          onSave={handleSavePreset}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPreset(null);
          }}
        />
      )}

      {showFromScanModal && (
        <CreateFromScanModal
          onSave={handleSavePreset}
          onClose={() => setShowFromScanModal(false)}
        />
      )}
    </div>
  );
}
