"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Package, X, Plus, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

interface CaseData {
  id: string;
  name: string;
  brand: string;
  innerWidth: number;
  innerHeight: number;
  innerDepth?: number;
  svgPath?: string; // SVG path data for the case outline
  svgContent?: string; // Full SVG content
  image?: string;
  productUrl?: string;
}

// Default cases from the layout step
const DEFAULT_CASES: CaseData[] = [
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

// SVG Preview component
function SvgPreview({ svgContent, width = 200, height = 150 }: { svgContent: string; width?: number; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    // Parse and display the SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (svgElement) {
      // Set viewBox if not present
      if (!svgElement.getAttribute("viewBox")) {
        const w = svgElement.getAttribute("width") || "100";
        const h = svgElement.getAttribute("height") || "100";
        svgElement.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
      }

      // Style the SVG
      svgElement.style.width = "100%";
      svgElement.style.height = "100%";
      svgElement.style.maxWidth = `${width}px`;
      svgElement.style.maxHeight = `${height}px`;

      // Style paths
      const paths = svgElement.querySelectorAll("path, rect, polygon, polyline, ellipse, circle, line");
      paths.forEach((path) => {
        (path as SVGElement).style.fill = "rgba(255, 77, 0, 0.2)";
        (path as SVGElement).style.stroke = "#ff4d00";
        (path as SVGElement).style.strokeWidth = "2";
      });

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(svgElement);
    }
  }, [svgContent, width, height]);

  if (!svgContent) {
    return (
      <div
        className="bg-carbon rounded flex items-center justify-center text-text-muted"
        style={{ width, height }}
      >
        <span className="text-xs">No SVG</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-carbon rounded flex items-center justify-center overflow-hidden"
      style={{ width, height }}
    />
  );
}

// Generate rectangle SVG for cases without custom SVG
function generateRectangleSvg(width: number, height: number, cornerRadius: number = 0.5): string {
  const scale = 10; // Scale up for better resolution
  const w = width * scale;
  const h = height * scale;
  const r = cornerRadius * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="#ff4d00" stroke-width="2"/>
</svg>`;
}

export default function AdminCasesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [cases, setCases] = useState<CaseData[]>(DEFAULT_CASES);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingCaseId, setUploadingCaseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, isAdmin, router]);

  // Load saved SVGs from localStorage
  useEffect(() => {
    const savedCases = localStorage.getItem("cutmycase-admin-cases");
    if (savedCases) {
      try {
        const parsed = JSON.parse(savedCases);
        // Merge with defaults
        setCases(DEFAULT_CASES.map(c => {
          const saved = parsed.find((s: CaseData) => s.id === c.id);
          return saved ? { ...c, ...saved } : c;
        }));
      } catch (e) {
        console.error("Failed to parse saved cases:", e);
      }
    }
  }, []);

  // Save to localStorage when cases change
  const saveCases = (updatedCases: CaseData[]) => {
    setCases(updatedCases);
    localStorage.setItem("cutmycase-admin-cases", JSON.stringify(updatedCases));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingCaseId) return;

    if (!file.name.endsWith(".svg")) {
      alert("Please upload an SVG file");
      return;
    }

    try {
      const content = await file.text();

      // Update the case with SVG content
      const updatedCases = cases.map(c => {
        if (c.id === uploadingCaseId) {
          return { ...c, svgContent: content };
        }
        return c;
      });

      saveCases(updatedCases);
      setShowUploadModal(false);
      setUploadingCaseId(null);
    } catch (err) {
      console.error("Failed to read SVG file:", err);
      alert("Failed to read SVG file");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openUploadModal = (caseId: string) => {
    setUploadingCaseId(caseId);
    setShowUploadModal(true);
  };

  const removeSvg = (caseId: string) => {
    const updatedCases = cases.map(c => {
      if (c.id === caseId) {
        const { svgContent, ...rest } = c;
        return rest;
      }
      return c;
    });
    saveCases(updatedCases);
  };

  const downloadSvg = (caseData: CaseData) => {
    const svg = caseData.svgContent || generateRectangleSvg(caseData.innerWidth, caseData.innerHeight);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
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
              <Link href="/admin/presets" className="text-text-secondary hover:text-white">
                Presets
              </Link>
              <Link href="/admin/cases" className="text-accent">
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
            <h1 className="text-3xl font-heading">Case Management</h1>
            <p className="text-text-muted mt-1">
              View and manage case SVG outlines for custom foam cutting
            </p>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseData) => (
            <Card key={caseData.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{caseData.brand} {caseData.name}</span>
                  <span className="text-xs text-text-muted font-normal">
                    {caseData.innerWidth}" x {caseData.innerHeight}"
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* SVG Preview */}
                <div className="mb-4 flex justify-center">
                  <SvgPreview
                    svgContent={caseData.svgContent || generateRectangleSvg(caseData.innerWidth, caseData.innerHeight)}
                    width={250}
                    height={150}
                  />
                </div>

                {/* Status */}
                <div className="mb-4 text-center">
                  {caseData.svgContent ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-success/20 text-success rounded">
                      Custom SVG Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-warning/20 text-warning rounded">
                      Default Rectangle
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openUploadModal(caseData.id)}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {caseData.svgContent ? "Replace" : "Upload"} SVG
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadSvg(caseData)}
                    title="Download SVG"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {caseData.svgContent && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeSvg(caseData.id)}
                      className="hover:bg-error/20 hover:text-error"
                      title="Remove custom SVG"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* View Full SVG Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setSelectedCase(caseData)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Full SVG
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>SVG Requirements</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-text-secondary space-y-2">
            <p>Upload SVG files that represent the interior foam cutting area of each case.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>SVG should represent the interior dimensions of the case</li>
              <li>Use paths, rectangles, or polygons to define the cutting boundary</li>
              <li>The SVG viewBox should match the case dimensions (in inches or scaled)</li>
              <li>Complex shapes like rounded corners or irregular outlines are supported</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading">Upload Case SVG</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadingCaseId(null);
                }}
                className="text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              Upload an SVG file that represents the cutting outline for this case.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select SVG File
            </Button>
          </div>
        </div>
      )}

      {/* Full SVG View Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-[#1a1a1a]">
              <h3 className="text-xl font-heading">
                {selectedCase.brand} {selectedCase.name} - Full SVG View
              </h3>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Large SVG Preview */}
              <div className="bg-carbon rounded-lg p-4 mb-4 flex justify-center">
                <SvgPreview
                  svgContent={selectedCase.svgContent || generateRectangleSvg(selectedCase.innerWidth, selectedCase.innerHeight)}
                  width={600}
                  height={400}
                />
              </div>

              {/* Case Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-carbon rounded p-3">
                  <div className="text-xs text-text-muted">Dimensions</div>
                  <div className="font-medium">{selectedCase.innerWidth}" x {selectedCase.innerHeight}"</div>
                </div>
                <div className="bg-carbon rounded p-3">
                  <div className="text-xs text-text-muted">SVG Status</div>
                  <div className="font-medium">
                    {selectedCase.svgContent ? "Custom SVG" : "Default Rectangle"}
                  </div>
                </div>
              </div>

              {/* Raw SVG Code */}
              {selectedCase.svgContent && (
                <div className="bg-carbon rounded-lg p-4">
                  <div className="text-xs text-text-muted mb-2">SVG Code</div>
                  <pre className="text-xs text-text-secondary overflow-x-auto max-h-48 overflow-y-auto">
                    {selectedCase.svgContent}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => downloadSvg(selectedCase)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    openUploadModal(selectedCase.id);
                    setSelectedCase(null);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedCase.svgContent ? "Replace" : "Upload"} SVG
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
