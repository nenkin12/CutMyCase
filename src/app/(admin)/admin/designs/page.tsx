"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Eye, Package, Scan, Layout, ShoppingCart, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Design {
  id: string;
  createdAt: string;
  status: "scanned" | "calibrated" | "layout" | "checkout" | "submitted";
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  items: Array<{
    id: string;
    name: string;
    points: number[][];
    color: string;
    depth?: number;
    width?: number;
    height?: number;
  }>;
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
}

const statusConfig = {
  scanned: { label: "Scanned", icon: Scan, color: "bg-blue-500" },
  calibrated: { label: "Calibrated", icon: Eye, color: "bg-yellow-500" },
  layout: { label: "Layout", icon: Layout, color: "bg-purple-500" },
  checkout: { label: "Checkout", icon: ShoppingCart, color: "bg-orange-500" },
  submitted: { label: "Submitted", icon: CheckCircle, color: "bg-green-500" },
};

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [filter, setFilter] = useState<string>("all");

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
              <Link href="/admin/orders" className="text-text-secondary hover:text-white">
                Orders
              </Link>
              <Link href="/admin/designs" className="text-accent">
                Designs
              </Link>
              <Link href="/admin/queue" className="text-text-secondary hover:text-white">
                Queue
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading">Scanned Designs</h1>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Designs List */}
          <div className="lg:col-span-2 space-y-4">
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
              <div className="space-y-3">
                {filteredDesigns.map((design) => {
                  const config = statusConfig[design.status];
                  return (
                    <button
                      key={design.id}
                      onClick={() => setSelectedDesign(design)}
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
                            <config.icon className="w-4 h-4 text-text-muted" />
                          </div>
                          <p className="text-xs text-text-muted truncate">
                            {design.id}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(design.createdAt).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-accent">{design.items.length} items</span>
                            {design.layout && (
                              <span className="text-text-muted hidden sm:inline">
                                Case: {design.layout.caseName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Design Detail */}
          <div className="space-y-4">
            <h2 className="text-lg font-heading">Design Details</h2>

            {selectedDesign ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* Image */}
                  <div className="aspect-video bg-dark rounded overflow-hidden">
                    {selectedDesign.imageUrl ? (
                      <img
                        src={selectedDesign.imageUrl}
                        alt="Design"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className={cn("w-3 h-3 rounded-full", statusConfig[selectedDesign.status].color)} />
                    <span className="font-medium">{statusConfig[selectedDesign.status].label}</span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Created</span>
                      <span>{new Date(selectedDesign.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Image Size</span>
                      <span>{selectedDesign.imageWidth} x {selectedDesign.imageHeight}</span>
                    </div>
                    {selectedDesign.calibration && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Scale</span>
                        <span>{selectedDesign.calibration.pixelsPerInch.toFixed(1)} PPI</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Items ({selectedDesign.items.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedDesign.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-dark rounded text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.depth && (
                            <span className="text-text-muted text-xs">{item.depth}" deep</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layout Info */}
                  {selectedDesign.layout && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Layout</h3>
                      <div className="p-2 bg-dark rounded text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Case</span>
                          <span>{selectedDesign.layout.caseName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Dimensions</span>
                          <span>{selectedDesign.layout.caseWidth}" x {selectedDesign.layout.caseHeight}"</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  {selectedDesign.customerInfo && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Customer</h3>
                      <div className="p-2 bg-dark rounded text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Needs Case</span>
                          <span>{selectedDesign.customerInfo.needsCase ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Eye className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">Select a design to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
