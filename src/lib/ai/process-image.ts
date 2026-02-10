import Anthropic from "@anthropic-ai/sdk";
import {
  GEAR_ANALYSIS_PROMPT,
  OUTLINE_TRACING_PROMPT,
  CALIBRATION_PROMPT,
} from "./prompts";

// Lazy initialization to avoid build-time errors
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return anthropicClient;
}

export interface GearItem {
  id: string;
  name: string;
  category: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedDimensions?: { length: number; width: number; depth: number };
  fitPreference: "snug" | "loose";
  confidence: number;
}

export interface GearAnalysisResult {
  items: GearItem[];
  totalItems: number;
  suggestedLayout: string;
  overallCategory: string;
}

export interface OutlinePoint {
  x: number;
  y: number;
}

export interface ItemOutline {
  id: string;
  itemName: string;
  outerPath: OutlinePoint[];
  innerPaths: { id: string; points: OutlinePoint[] }[];
  depth: number;
}

export interface OutlineResult {
  outlines: ItemOutline[];
}

export interface CalibrationResult {
  referenceObject: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  knownDimension: number;
  dimensionType: string;
  measureAxis: "width" | "height";
  confidence: number;
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

function getMediaType(
  url: string
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const ext = url.toLowerCase().split(".").pop()?.split("?")[0];
  switch (ext) {
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

export async function analyzeGear(imageUrl: string): Promise<GearAnalysisResult> {
  const imageData = await fetchImageAsBase64(imageUrl);
  const mediaType = getMediaType(imageUrl);

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageData,
            },
          },
          {
            type: "text",
            text: GEAR_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from AI");
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from AI response");
  }

  return JSON.parse(jsonMatch[0]) as GearAnalysisResult;
}

export async function traceOutlines(imageUrl: string): Promise<OutlineResult> {
  const imageData = await fetchImageAsBase64(imageUrl);
  const mediaType = getMediaType(imageUrl);

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageData,
            },
          },
          {
            type: "text",
            text: OUTLINE_TRACING_PROMPT,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from AI");
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from AI response");
  }

  return JSON.parse(jsonMatch[0]) as OutlineResult;
}

export async function detectCalibrationReference(
  imageUrl: string
): Promise<CalibrationResult | null> {
  const imageData = await fetchImageAsBase64(imageUrl);
  const mediaType = getMediaType(imageUrl);

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageData,
            },
          },
          {
            type: "text",
            text: CALIBRATION_PROMPT,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    return null;
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]) as CalibrationResult;
  } catch {
    return null;
  }
}

export function calculatePixelsPerInch(
  calibration: CalibrationResult,
  imageWidth: number,
  imageHeight: number
): number {
  const boxPixelWidth = (calibration.boundingBox.width / 100) * imageWidth;
  const boxPixelHeight = (calibration.boundingBox.height / 100) * imageHeight;

  const measuredPixels =
    calibration.measureAxis === "width" ? boxPixelWidth : boxPixelHeight;
  return measuredPixels / calibration.knownDimension;
}

export function convertPercentToInches(
  points: OutlinePoint[],
  imageWidth: number,
  imageHeight: number,
  pixelsPerInch: number
): OutlinePoint[] {
  return points.map((point) => ({
    x: ((point.x / 100) * imageWidth) / pixelsPerInch,
    y: ((point.y / 100) * imageHeight) / pixelsPerInch,
  }));
}
