import { NextRequest, NextResponse } from "next/server";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;
const MAX_IMAGE_DIMENSION = 1024; // Resize to prevent CUDA OOM

async function resizeImageForSegmentation(imageUrl: string): Promise<string> {
  const sharp = (await import("sharp")).default;

  // Handle base64 data URLs
  let imageBuffer: Buffer;
  if (imageUrl.startsWith("data:")) {
    const base64Data = imageUrl.split(",")[1];
    imageBuffer = Buffer.from(base64Data, "base64");
  } else {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
  }

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();
  const { width = 0, height = 0 } = metadata;

  console.log(`Original image size: ${width}x${height}`);

  // Only resize if larger than max dimension
  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
    // Return as data URL for Replicate
    const base64 = imageBuffer.toString("base64");
    const mimeType = metadata.format === "png" ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  }

  // Resize maintaining aspect ratio
  const resized = await sharp(imageBuffer)
    .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  console.log(`Resized image to fit within ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`);

  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}

async function runPrediction(version: string, input: Record<string, any>, retries = 3): Promise<any> {
  // Create prediction with retry logic for rate limits
  let createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  // Handle rate limiting with retry
  if (createResponse.status === 429 && retries > 0) {
    const errorData = await createResponse.json();
    const retryAfter = errorData.retry_after || 10;
    console.log(`Rate limited, waiting ${retryAfter}s before retry...`);
    await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
    return runPrediction(version, input, retries - 1);
  }

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
  }

  const prediction = await createResponse.json();
  console.log("Created prediction:", prediction.id);

  // Poll for result
  let result = prediction;
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pollResponse = await fetch(result.urls.get, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_TOKEN}` },
    });
    result = await pollResponse.json();
    console.log("Prediction status:", result.status);
  }

  if (result.status === "failed") {
    throw new Error(`Prediction failed: ${result.error}`);
  }

  return result.output;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, points, labels } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    const isBase64 = imageUrl.startsWith("data:");
    console.log("Segment request - image type:", isBase64 ? "base64" : "url", "points:", points?.length || 0);

    // Step 1: Resize image to prevent CUDA OOM errors
    const resizedImageUrl = await resizeImageForSegmentation(imageUrl);
    console.log("Image resized for processing");

    // Step 2: Remove background using AI (this is where AI excels)
    console.log("Removing background...");
    const bgRemovedUrl = await runPrediction(
      "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",  // lucataco/remove-bg
      {
        image: resizedImageUrl,
      }
    );
    console.log("Background removed:", typeof bgRemovedUrl === "string" ? bgRemovedUrl.slice(0, 100) : bgRemovedUrl);

    // Return the cleaned image - edge detection happens client-side
    return NextResponse.json({
      success: true,
      mode: "hybrid",
      cleanedImageUrl: bgRemovedUrl,
      originalImageUrl: resizedImageUrl,
    });
  } catch (error) {
    console.error("SAM segmentation error:", error);
    return NextResponse.json(
      { error: "Segmentation failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET for testing
export async function GET() {
  return NextResponse.json({
    message: "SAM Segmentation API",
    usage: {
      method: "POST",
      body: {
        imageUrl: "URL to image",
        points: "Optional: [[x, y], ...] click coordinates",
        labels: "Optional: [1, 0, ...] foreground/background labels",
      },
    },
  });
}
