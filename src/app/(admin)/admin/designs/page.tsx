"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Eye, Package, Scan, Layout, ShoppingCart, CheckCircle, Save, Brain, Sparkles, Database, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DesignItem {
  id: string;
  name: string;
  points: number[][];
  color: string;
  depth?: number;
  width?: number;
  height?: number;
  aiCategory?: string;
  aiPrompt?: string;
  aiConfidence?: number;
  correctedName?: string;
}

interface Design {
  id: string;
  createdAt: string;
  status: "scanned" | "calibrated" | "layout" | "checkout" | "submitted";
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  items: DesignItem[];
  calibration?: {
    pixelsPerInch: number;
    referenceType?: string;
  };
  layout?: {
    caseId: string;
    caseName: string;
    caseWidth: number;
    caseHeight: number;
    items: Array<{
      id: string;
      x: number;
      y: number;
      rotation: number;
    }>;
  };
  customerInfo?: {
    needsCase: boolean;
  };
  reviewed?: boolean;
  reviewedAt?: string;
  reviewNotes?: string;
}

const statusConfig = {
  scanned: { label: "Scanned", icon: Scan, color: "bg-blue-500" },
  calibrated: { label: "Calibrated", icon: Eye, color: "bg-yellow-500" },
  layout: { label: "Layout", icon: Layout, color: "bg-purple-500" },
  checkout: { label: "Checkout", icon: ShoppingCart, color: "bg-orange-500" },
  submitted: { label: "Submitted", icon: CheckCircle, color: "bg-green-500" },
};

const AI_CATEGORIES = [
  "firearm",
  "magazine",
  "suppressor",
  "optic",
  "knife",
  "tool",
  "flashlight",
  "accessory",
  "ear_protection",
  "eye_protection",
  "medical",
  "electronics",
  "other",
];

// Component to draw the outline shape
function OutlineCanvas({
  item,
  imageUrl,
  imageWidth,
  imageHeight,
  isSelected,
  onClick
}: {
  item: DesignItem;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !item.points || item.points.length < 3) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate bounding box
    const xs = item.points.map(p => p[0]);
    const ys = item.points.map(p => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;

    // Set canvas size with padding
    const padding = 10;
    const scale = Math.min(150 / width, 150 / height, 1);
    canvas.width = width * scale + padding * 2;
    canvas.height = height * scale + padding * 2;

    // Clear and set background
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the outline
    ctx.save();
    ctx.translate(padding, padding);
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    // Fill
    ctx.beginPath();
    ctx.moveTo(item.points[0][0], item.points[0][1]);
    for (let i = 1; i < item.points.length; i++) {
      ctx.lineTo(item.points[i][0], item.points[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = item.color + "40";
    ctx.fill();

    // Stroke
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2 / scale;
    ctx.stroke();

    ctx.restore();
    setLoaded(true);
  }, [item]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-lg overflow-hidden transition-all",
        isSelected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-accent/50"
      )}
    >
      <canvas ref={canvasRef} className="w-full h-auto" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
        <p className="text-xs truncate">{item.correctedName || item.name}</p>
      </div>
    </button>
  );
}

// Component for the full design preview with all outlines
function DesignPreviewCanvas({
  design,
  selectedItemId,
  onSelectItem
}: {
  design: Design;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !design.imageWidth) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scale to fit container
    const containerWidth = container.clientWidth;
    const calculatedScale = Math.min(containerWidth / design.imageWidth, 400 / design.imageHeight);
    setScale(calculatedScale);

    canvas.width = design.imageWidth * calculatedScale;
    canvas.height = design.imageHeight * calculatedScale;

    // Dark background
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 0.5;
    const gridSize = 50 * calculatedScale;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw each item outline
    design.items.forEach((item) => {
      if (!item.points || item.points.length < 3) return;

      const isSelected = item.id === selectedItemId;

      ctx.save();
      ctx.scale(calculatedScale, calculatedScale);

      // Draw fill
      ctx.beginPath();
      ctx.moveTo(item.points[0][0], item.points[0][1]);
      for (let i = 1; i < item.points.length; i++) {
        ctx.lineTo(item.points[i][0], item.points[i][1]);
      }
      ctx.closePath();

      ctx.fillStyle = isSelected ? item.color + "60" : item.color + "30";
      ctx.fill();

      // Draw stroke
      ctx.strokeStyle = isSelected ? "#FF4D00" : item.color;
      ctx.lineWidth = isSelected ? 3 / calculatedScale : 2 / calculatedScale;
      ctx.stroke();

      // Draw label
      const xs = item.points.map(p => p[0]);
      const ys = item.points.map(p => p[1]);
      const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
      const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

      ctx.fillStyle = isSelected ? "#FF4D00" : "#fff";
      ctx.font = `${12 / calculatedScale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.correctedName || item.name, centerX, centerY);

      ctx.restore();
    });
  }, [design, selectedItemId]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Find clicked item (check if point is inside polygon)
    for (const item of design.items) {
      if (!item.points || item.points.length < 3) continue;

      // Simple bounding box check
      const xs = item.points.map(p => p[0]);
      const ys = item.points.map(p => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        onSelectItem(item.id);
        return;
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-auto cursor-pointer rounded-lg"
        onClick={handleClick}
      />
    </div>
  );
}

// Shape refinement options
const REFINEMENT_OPTIONS = [
  { id: "category", label: "Auto (by category)", description: "Intelligently refine based on item type" },
  { id: "smooth", label: "Smooth", description: "Round out rough edges" },
  { id: "simplify", label: "Simplify", description: "Reduce complexity while preserving shape" },
  { id: "rectangle", label: "Rectangle", description: "Convert to sharp rectangle" },
  { id: "rounded_rectangle", label: "Rounded Rectangle", description: "Rectangle with rounded corners" },
  { id: "oval", label: "Oval", description: "Convert to oval/ellipse shape" },
  { id: "convex_hull", label: "Convex Hull", description: "Wrap to outer boundary" },
];

// Component to show before/after shape comparison
function ShapeComparisonCanvas({
  originalPoints,
  refinedPoints,
  color
}: {
  originalPoints: number[][];
  refinedPoints: number[][] | null;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalPoints || originalPoints.length < 3) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate combined bounding box
    const allPoints = refinedPoints ? [...originalPoints, ...refinedPoints] : originalPoints;
    const xs = allPoints.map(p => p[0]);
    const ys = allPoints.map(p => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;

    const padding = 20;
    const scale = Math.min((300 - padding * 2) / width, (200 - padding * 2) / height, 1);
    canvas.width = 300;
    canvas.height = 200;

    // Clear
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center offset
    const offsetX = (canvas.width - width * scale) / 2 - minX * scale;
    const offsetY = (canvas.height - height * scale) / 2 - minY * scale;

    // Draw original (faded)
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.moveTo(originalPoints[0][0], originalPoints[0][1]);
    for (let i = 1; i < originalPoints.length; i++) {
      ctx.lineTo(originalPoints[i][0], originalPoints[i][1]);
    }
    ctx.closePath();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1 / scale;
    ctx.setLineDash([5 / scale, 5 / scale]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw refined (if available)
    if (refinedPoints && refinedPoints.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(refinedPoints[0][0], refinedPoints[0][1]);
      for (let i = 1; i < refinedPoints.length; i++) {
        ctx.lineTo(refinedPoints[i][0], refinedPoints[i][1]);
      }
      ctx.closePath();
      ctx.fillStyle = color + "40";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / scale;
      ctx.stroke();
    }

    ctx.restore();

    // Labels
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#666";
    ctx.fillText(`Original: ${originalPoints.length} points`, 10, 15);
    if (refinedPoints) {
      ctx.fillStyle = color;
      ctx.fillText(`Refined: ${refinedPoints.length} points`, 10, 28);
    }
  }, [originalPoints, refinedPoints, color]);

  return <canvas ref={canvasRef} className="w-full h-auto rounded-lg border border-border" />;
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  // Edit states for selected item
  const [editCategory, setEditCategory] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editName, setEditName] = useState("");

  // Shape refinement states
  const [refinementType, setRefinementType] = useState("category");
  const [refinedPoints, setRefinedPoints] = useState<number[][] | null>(null);
  const [refining, setRefining] = useState(false);

  // Template states
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/designs");
      if (res.ok) {
        const data = await res.json();
        setDesigns(data);
      }
    } catch (error) {
      console.error("Failed to fetch designs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // When selecting an item, load its current values
  useEffect(() => {
    if (selectedDesign && selectedItemId) {
      const item = selectedDesign.items.find(i => i.id === selectedItemId);
      if (item) {
        setEditCategory(item.aiCategory || "");
        setEditPrompt(item.aiPrompt || "");
        setEditName(item.correctedName || item.name);
      }
    }
  }, [selectedDesign, selectedItemId]);

  const selectedItem = selectedDesign?.items.find(i => i.id === selectedItemId);

  // Reset refinement when selecting new item
  useEffect(() => {
    setRefinedPoints(null);
    setRefinementType("category");
    setTemplateSaved(false);
  }, [selectedItemId]);

  // Save item as a template for future training
  const saveAsTemplate = async () => {
    if (!selectedDesign || !selectedItem) return;

    setSavingTemplate(true);
    try {
      const pointsToSave = refinedPoints || selectedItem.points;

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName || selectedItem.name,
          category: editCategory || "other",
          points: pointsToSave,
          trainingNotes: editPrompt,
          sourceDesignId: selectedDesign.id,
        }),
      });

      if (res.ok) {
        setTemplateSaved(true);
        // Also save the feedback to the design
        await saveItemFeedback();
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setSavingTemplate(false);
    }
  };

  // Refine shape using API
  const refineShape = async () => {
    if (!selectedItem || !selectedItem.points) return;

    setRefining(true);
    setRefinedPoints(null);

    try {
      const res = await fetch("/api/designs/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: selectedItem.points,
          category: editCategory,
          prompt: editPrompt,
          refinementType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRefinedPoints(data.refinedPoints);
      }
    } catch (error) {
      console.error("Failed to refine shape:", error);
    } finally {
      setRefining(false);
    }
  };

  // Apply refined shape to the item
  const applyRefinedShape = async () => {
    if (!selectedDesign || !selectedItemId || !refinedPoints) return;

    setSaving(true);
    try {
      const updatedItems = selectedDesign.items.map(item => {
        if (item.id === selectedItemId) {
          return {
            ...item,
            points: refinedPoints,
            aiCategory: editCategory,
            aiPrompt: editPrompt,
            correctedName: editName !== item.name ? editName : undefined,
          };
        }
        return item;
      });

      const res = await fetch("/api/designs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDesign.id,
          items: updatedItems,
          reviewed: true,
          reviewedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDesigns(prev => prev.map(d => d.id === updated.id ? updated : d));
        setSelectedDesign(updated);
        setRefinedPoints(null);
      }
    } catch (error) {
      console.error("Failed to apply refinement:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveItemFeedback = async () => {
    if (!selectedDesign || !selectedItemId) return;

    setSaving(true);
    try {
      // Update the item in the design
      const updatedItems = selectedDesign.items.map(item => {
        if (item.id === selectedItemId) {
          return {
            ...item,
            aiCategory: editCategory,
            aiPrompt: editPrompt,
            correctedName: editName !== item.name ? editName : undefined,
          };
        }
        return item;
      });

      const res = await fetch("/api/designs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDesign.id,
          items: updatedItems,
          reviewed: true,
          reviewedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDesigns(prev => prev.map(d => d.id === updated.id ? updated : d));
        setSelectedDesign(updated);
      }
    } catch (error) {
      console.error("Failed to save feedback:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredDesigns = filter === "all"
    ? designs
    : designs.filter(d => d.status === filter);

  const stats = {
    total: designs.length,
    scanned: designs.filter(d => d.status === "scanned").length,
    calibrated: designs.filter(d => d.status === "calibrated").length,
    layout: designs.filter(d => d.status === "layout").length,
    checkout: designs.filter(d => d.status === "checkout").length,
    submitted: designs.filter(d => d.status === "submitted").length,
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="CutMyCase" className="w-8 h-8 rounded" />
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-4 sm:gap-6 text-sm">
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/designs" className="text-accent">
                Designs
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
            <h1 className="text-2xl sm:text-3xl font-heading">AI Training Center</h1>
            <p className="text-text-muted text-sm mt-1">Review designs and help the AI learn to identify items better</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDesigns} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "p-3 sm:p-4 rounded-lg border transition-colors text-left",
              filter === "all" ? "bg-accent/20 border-accent" : "bg-carbon border-border hover:border-accent/50"
            )}
          >
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-text-muted">Total</div>
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "p-3 sm:p-4 rounded-lg border transition-colors text-left",
                filter === key ? "bg-accent/20 border-accent" : "bg-carbon border-border hover:border-accent/50"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full", config.color)} />
                <span className="text-xl sm:text-2xl font-bold">{stats[key as keyof typeof stats]}</span>
              </div>
              <div className="text-xs text-text-muted">{config.label}</div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Designs List */}
          <div className="space-y-4">
            <h2 className="text-lg font-heading">
              {filter === "all" ? "All Designs" : `${statusConfig[filter as keyof typeof statusConfig]?.label} Designs`}
              <span className="text-text-muted ml-2">({filteredDesigns.length})</span>
            </h2>

            {loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-muted">Loading designs...</p>
                </CardContent>
              </Card>
            ) : filteredDesigns.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">No designs found</p>
                  <p className="text-sm text-text-muted mt-2">
                    Designs will appear here as users scan and create layouts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredDesigns.map((design) => {
                  const config = statusConfig[design.status];
                  return (
                    <button
                      key={design.id}
                      onClick={() => {
                        setSelectedDesign(design);
                        setSelectedItemId(null);
                      }}
                      className={cn(
                        "w-full bg-carbon rounded-lg p-3 sm:p-4 text-left transition-colors border",
                        selectedDesign?.id === design.id
                          ? "border-accent"
                          : "border-transparent hover:border-accent/30"
                      )}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-dark rounded overflow-hidden flex-shrink-0">
                          {design.imageUrl ? (
                            <img
                              src={design.imageUrl}
                              alt="Design"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("w-2 h-2 rounded-full", config.color)} />
                            <span className="text-sm font-medium">{config.label}</span>
                            {design.reviewed && (
                              <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded">
                                Reviewed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted">
                            {new Date(design.createdAt).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-accent">{design.items.length} items</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Design Detail & AI Training */}
          <div className="space-y-4">
            {selectedDesign ? (
              <>
                {/* Visual Preview with Outlines */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Outline Preview
                      <span className="text-text-muted">(click an item to select)</span>
                    </h3>
                    <DesignPreviewCanvas
                      design={selectedDesign}
                      selectedItemId={selectedItemId}
                      onSelectItem={setSelectedItemId}
                    />
                  </CardContent>
                </Card>

                {/* Item Thumbnails */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3">
                      Items ({selectedDesign.items.length})
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {selectedDesign.items.map((item) => (
                        <OutlineCanvas
                          key={item.id}
                          item={item}
                          imageUrl={selectedDesign.imageUrl}
                          imageWidth={selectedDesign.imageWidth}
                          imageHeight={selectedDesign.imageHeight}
                          isSelected={item.id === selectedItemId}
                          onClick={() => setSelectedItemId(item.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Training Panel */}
                {selectedItem && (
                  <Card className="border-accent">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Brain className="w-4 h-4 text-accent" />
                        AI Training for: <span className="text-accent">{selectedItem.name}</span>
                      </h3>

                      {/* Corrected Name */}
                      <div>
                        <label className="text-xs text-text-muted block mb-1">
                          Correct Name (if AI got it wrong)
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:border-accent"
                          placeholder="e.g., Glock 19"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-xs text-text-muted block mb-1">
                          Category
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:border-accent"
                        >
                          <option value="">Select category...</option>
                          {AI_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* AI Training Prompt */}
                      <div>
                        <label className="text-xs text-text-muted block mb-1">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          AI Training Notes
                        </label>
                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:border-accent resize-none"
                          placeholder="Describe this item to help AI learn. e.g., 'This is a compact pistol with mounted red dot optic. The shape should include the optic housing on top.'"
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Help the AI understand what this item is and how to better detect similar items.
                        </p>
                      </div>

                      {/* Shape Refinement Section */}
                      <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-medium text-accent mb-3 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Shape Refinement
                        </h4>

                        {/* Refinement Type */}
                        <div className="mb-3">
                          <label className="text-xs text-text-muted block mb-1">
                            Refinement Method
                          </label>
                          <select
                            value={refinementType}
                            onChange={(e) => setRefinementType(e.target.value)}
                            className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:border-accent"
                          >
                            {REFINEMENT_OPTIONS.map(opt => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label} - {opt.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Refine Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={refineShape}
                          disabled={refining}
                          className="w-full mb-3"
                        >
                          {refining ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Refining...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Preview Refined Shape
                            </>
                          )}
                        </Button>

                        {/* Shape Comparison Preview */}
                        {selectedItem.points && (
                          <ShapeComparisonCanvas
                            originalPoints={selectedItem.points}
                            refinedPoints={refinedPoints}
                            color={selectedItem.color}
                          />
                        )}

                        {/* Apply Refinement Button */}
                        {refinedPoints && (
                          <Button
                            onClick={applyRefinedShape}
                            disabled={saving}
                            className="w-full mt-3 bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {saving ? "Applying..." : "Apply Refined Shape"}
                          </Button>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4">
                        <div>
                          <span className="text-text-muted">Points:</span>
                          <span className="ml-2">{selectedItem.points?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Depth:</span>
                          <span className="ml-2">{selectedItem.depth || "N/A"}"</span>
                        </div>
                      </div>

                      {/* Save as Template Button */}
                      <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-medium text-success mb-2 flex items-center gap-2">
                          <Database className="w-3 h-3" />
                          Save to Training Database
                        </h4>
                        <p className="text-xs text-text-muted mb-3">
                          Save this shape as a template. Future scans will use it to better identify similar items.
                        </p>
                        {templateSaved ? (
                          <div className="flex items-center gap-2 text-success text-sm py-2">
                            <Check className="w-4 h-4" />
                            Template saved to database!
                          </div>
                        ) : (
                          <Button
                            onClick={saveAsTemplate}
                            disabled={savingTemplate || !editCategory}
                            className="w-full bg-success hover:bg-success/90"
                          >
                            <Database className="w-4 h-4 mr-2" />
                            {savingTemplate ? "Saving Template..." : "Save as Training Template"}
                          </Button>
                        )}
                        {!editCategory && (
                          <p className="text-xs text-warning mt-2">
                            Select a category above to save as template
                          </p>
                        )}
                      </div>

                      {/* Save Feedback Only Button */}
                      <Button
                        variant="secondary"
                        onClick={saveItemFeedback}
                        disabled={saving}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Feedback Only"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!selectedItemId && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Brain className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted">Click an item above to add AI training feedback</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">Select a design to view and train</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
