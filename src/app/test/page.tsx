"use client";

import { useState } from "react";

interface GearItem {
  id: string;
  name: string;
  category: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedDimensions?: { length: number; width: number; depth: number };
  fitPreference: "snug" | "loose";
  confidence: number;
}

interface AnalysisResult {
  items: GearItem[];
  totalItems: number;
  suggestedLayout: string;
  overallCategory: string;
}

export default function TestPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, action: "analyze" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Gun/Gear Detection Test</h1>
        <p className="text-gray-400 mb-8">
          Enter an image URL to test the AI detection system
        </p>

        {/* Input Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <div className="flex gap-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/firearm-photo.jpg"
              className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Tip: Use a publicly accessible image URL (like from Imgur or an S3 bucket)
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Image Preview & Results */}
        {imageUrl && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Preview with Bounding Boxes */}
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Image Preview</h2>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full rounded-lg"
                  onError={() => setError("Failed to load image")}
                />
                {/* Overlay bounding boxes */}
                {result && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {result.items.map((item) => (
                      <g key={item.id}>
                        <rect
                          x={`${item.boundingBox.x}%`}
                          y={`${item.boundingBox.y}%`}
                          width={`${item.boundingBox.width}%`}
                          height={`${item.boundingBox.height}%`}
                          fill="none"
                          stroke="#FF4D00"
                          strokeWidth="2"
                          strokeDasharray="4"
                        />
                        <text
                          x={`${item.boundingBox.x + 1}%`}
                          y={`${item.boundingBox.y - 1}%`}
                          fill="#FF4D00"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {item.name}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Detection Results</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-400">Analyzing image...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="bg-[#0a0a0a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Total Items</div>
                    <div className="text-2xl font-bold">{result.totalItems}</div>
                  </div>

                  <div className="bg-[#0a0a0a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Category</div>
                    <div className="text-lg capitalize">{result.overallCategory}</div>
                  </div>

                  <div className="bg-[#0a0a0a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Layout</div>
                    <div className="text-lg capitalize">{result.suggestedLayout}</div>
                  </div>

                  <h3 className="text-md font-semibold mt-4">Detected Items</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0a0a0a] rounded-lg p-3 border border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-400 capitalize">
                              {item.category}
                            </div>
                          </div>
                          <span className="text-sm text-orange-500">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        {item.estimatedDimensions && (
                          <div className="text-xs text-gray-500 mt-1">
                            Est. {item.estimatedDimensions.length}" x {item.estimatedDimensions.width}" x {item.estimatedDimensions.depth}"
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          Fit: {item.fitPreference}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Click "Analyze" to detect items
                </div>
              )}
            </div>
          </div>
        )}

        {/* JSON Output */}
        {result && (
          <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Raw JSON Response</h2>
            <pre className="bg-[#0a0a0a] p-4 rounded-lg overflow-auto text-sm text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
