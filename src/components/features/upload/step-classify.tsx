"use client";

import { useState, useEffect } from "react";
import { Check, Edit2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { GearAnalysisResult, GearItem } from "@/lib/ai/process-image";

interface StepClassifyProps {
  imageUrl: string;
  onComplete: (analysis: GearAnalysisResult) => void;
  onBack: () => void;
}

export function StepClassify({ imageUrl, onComplete, onBack }: StepClassifyProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<GearAnalysisResult | null>(null);
  const [items, setItems] = useState<GearItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeImage();
  }, [imageUrl]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/upload/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setAnalysis(data);
      setItems(data.items);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateItem = (id: string, updates: Partial<GearItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setEditingItem(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    const newItem: GearItem = {
      id: `custom_${Date.now()}`,
      name: "New Item",
      category: "other",
      boundingBox: { x: 25, y: 25, width: 50, height: 50 },
      fitPreference: "snug",
      confidence: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setEditingItem(newItem.id);
  };

  const handleContinue = () => {
    if (items.length === 0) {
      setError("Please add at least one item");
      return;
    }

    const finalAnalysis: GearAnalysisResult = {
      items,
      totalItems: items.length,
      suggestedLayout: analysis?.suggestedLayout || "horizontal",
      overallCategory: analysis?.overallCategory || "mixed",
    };

    onComplete(finalAnalysis);
  };

  if (isAnalyzing) {
    return (
      <div className="text-center py-16">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-xl font-heading mb-2">Analyzing Your Gear</h3>
        <p className="text-text-secondary">
          Our AI is detecting and classifying your equipment...
        </p>
      </div>
    );
  }

  if (error && !analysis) {
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
        <h3 className="text-xl font-heading mb-2">Analysis Failed</h3>
        <p className="text-text-secondary mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={onBack}>
            Go Back
          </Button>
          <Button onClick={analyzeImage}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-heading mb-2">Detected Items</h2>
        <p className="text-text-secondary">
          Review and confirm the items detected in your photo
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Preview with Overlays */}
        <div className="relative bg-carbon rounded-[4px] overflow-hidden">
          <img
            src={imageUrl}
            alt="Uploaded gear"
            className="w-full object-contain"
          />
          {/* Bounding box overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {items.map((item) => (
              <rect
                key={item.id}
                x={`${item.boundingBox.x}%`}
                y={`${item.boundingBox.y}%`}
                width={`${item.boundingBox.width}%`}
                height={`${item.boundingBox.height}%`}
                fill="none"
                stroke="#FF4D00"
                strokeWidth="2"
                strokeDasharray="4"
              />
            ))}
          </svg>
        </div>

        {/* Item List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg">
              {items.length} Items Detected
            </h3>
            <Button variant="secondary" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-carbon border border-border rounded-[4px] p-4"
              >
                {editingItem === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, { name: e.target.value })
                      }
                      placeholder="Item name"
                    />
                    <div className="flex gap-2">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          updateItem(item.id, { category: e.target.value })
                        }
                        className="flex-1 h-11 px-4 bg-dark border border-border rounded-[4px] text-sm"
                      >
                        <option value="firearm">Firearm</option>
                        <option value="optic">Optic</option>
                        <option value="accessory">Accessory</option>
                        <option value="magazine">Magazine</option>
                        <option value="camera">Camera</option>
                        <option value="lens">Lens</option>
                        <option value="drone">Drone</option>
                        <option value="tool">Tool</option>
                        <option value="electronics">Electronics</option>
                        <option value="other">Other</option>
                      </select>
                      <Button size="sm" onClick={() => setEditingItem(null)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{item.category}</Badge>
                        <span className="text-xs text-text-muted">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingItem(item.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <p>No items detected. Add items manually.</p>
            </div>
          )}
        </div>
      </div>

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
        <Button onClick={handleContinue} disabled={items.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
