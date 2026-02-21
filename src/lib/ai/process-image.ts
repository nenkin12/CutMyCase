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

// Claude's limit is 5MB for the base64 STRING, not decoded bytes
// Base64 adds ~33% overhead, so we target 3.5MB decoded to stay under 5MB base64
const MAX_BASE64_LENGTH = 4.5 * 1024 * 1024; // 4.5MB base64 string length limit

async function compressImage(base64Data: string, mediaType: string): Promise<string> {
  console.log("Starting image compression...");

  // Use sharp for server-side image compression
  const sharp = (await import("sharp")).default;
  const inputBuffer = Buffer.from(base64Data, "base64");
  const inputSize = inputBuffer.length;

  console.log(`Input buffer size: ${(inputSize / 1024 / 1024).toFixed(2)}MB`);

  // Calculate target quality - be more aggressive for large images
  // Target 3MB base64 output (inputSize * 4/3 for base64 overhead)
  const targetDecodedSize = 3 * 1024 * 1024 * 0.75; // ~2.25MB decoded for ~3MB base64
  const compressionRatio = targetDecodedSize / inputSize;
  const quality = Math.max(20, Math.min(70, Math.floor(compressionRatio * 80)));

  console.log(`Using quality: ${quality}, compression ratio: ${compressionRatio.toFixed(2)}`);

  // Resize and compress aggressively
  const outputBuffer = await sharp(inputBuffer)
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  console.log(`Output buffer size: ${(outputBuffer.length / 1024 / 1024).toFixed(2)}MB`);

  return outputBuffer.toString("base64");
}

async function fetchImageAsBase64(url: string): Promise<string> {
  // Handle base64 data URLs directly
  if (url.startsWith("data:")) {
    const base64Data = url.split(",")[1];
    if (!base64Data) {
      throw new Error("Invalid data URL format");
    }
    return base64Data;
  }

  // Fetch remote URL
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

function getMediaType(
  url: string
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  // Handle base64 data URLs
  if (url.startsWith("data:")) {
    const mimeMatch = url.match(/^data:(image\/\w+);/);
    if (mimeMatch) {
      const mime = mimeMatch[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mime)) {
        return mime;
      }
    }
    return "image/jpeg";
  }

  // Handle regular URLs
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
  let imageData = await fetchImageAsBase64(imageUrl);
  let mediaType = getMediaType(imageUrl);

  // Compress if needed - check base64 string length directly
  const base64Length = imageData.length;
  console.log(`Base64 length: ${(base64Length / 1024 / 1024).toFixed(2)}MB, Max allowed: ${(MAX_BASE64_LENGTH / 1024 / 1024).toFixed(2)}MB`);

  if (base64Length > MAX_BASE64_LENGTH) {
    console.log(`Compressing image (base64 is ${(base64Length / 1024 / 1024).toFixed(2)}MB)...`);
    try {
      imageData = await compressImage(imageData, mediaType);
      mediaType = "image/jpeg"; // Compressed images are JPEG
      console.log(`Compressed to ${(imageData.length / 1024 / 1024).toFixed(2)}MB base64`);
    } catch (compressionError) {
      console.error("Compression failed:", compressionError);
      throw new Error(`Image compression failed: ${compressionError}`);
    }
  }

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
  let imageData = await fetchImageAsBase64(imageUrl);
  let mediaType = getMediaType(imageUrl);

  // Compress if needed
  if (imageData.length > MAX_BASE64_LENGTH) {
    console.log(`[Outlines] Compressing image...`);
    imageData = await compressImage(imageData, mediaType);
    mediaType = "image/jpeg";
  }

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
  let imageData = await fetchImageAsBase64(imageUrl);
  let mediaType = getMediaType(imageUrl);

  // Compress if needed - check base64 string length directly
  const base64Length = imageData.length;
  console.log(`[Calibration] Base64 length: ${(base64Length / 1024 / 1024).toFixed(2)}MB`);

  if (base64Length > MAX_BASE64_LENGTH) {
    console.log(`[Calibration] Compressing image...`);
    try {
      imageData = await compressImage(imageData, mediaType);
      mediaType = "image/jpeg";
      console.log(`[Calibration] Compressed to ${(imageData.length / 1024 / 1024).toFixed(2)}MB`);
    } catch (compressionError) {
      console.error("[Calibration] Compression failed:", compressionError);
      throw new Error(`Image compression failed: ${compressionError}`);
    }
  }

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
