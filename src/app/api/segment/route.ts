import { NextRequest, NextResponse } from "next/server";

// Increase timeout for this route
export const maxDuration = 25;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function runPrediction(version: string, input: Record<string, unknown>): Promise<string> {
  // Create prediction
  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.error("Replicate create error:", error);
    throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
  }

  const prediction = await createResponse.json();
  console.log("Created prediction:", prediction.id);

  // Poll for result (max 60 attempts = ~60 seconds)
  let result = prediction;
  let attempts = 0;
  while (result.status !== "succeeded" && result.status !== "failed" && attempts < 60) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;

    const pollResponse = await fetch(result.urls.get, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_TOKEN}` },
    });
    result = await pollResponse.json();
    console.log("Prediction status:", result.status, "attempt:", attempts);
  }

  if (result.status === "failed") {
    throw new Error(`Prediction failed: ${result.error}`);
  }

  if (result.status !== "succeeded") {
    throw new Error("Prediction timed out");
  }

  return result.output;
}

export async function POST(request: NextRequest) {
  console.log("Segment API called");

  try {
    const body = await request.json();
    const { imageUrl } = body;

    console.log("Image URL type:", imageUrl?.startsWith("data:") ? "base64" : "url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    // Check if Replicate token is configured
    if (!REPLICATE_API_TOKEN) {
      console.log("REPLICATE_API_TOKEN not configured");
      return NextResponse.json({
        success: true,
        mode: "passthrough",
        cleanedImageUrl: imageUrl,
        originalImageUrl: imageUrl,
        message: "Background removal skipped - Replicate API not configured",
      });
    }

    console.log("Calling Replicate for background removal...");

    // Remove background using Replicate
    const bgRemovedUrl = await runPrediction(
      "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1", // lucataco/remove-bg
      { image: imageUrl }
    );

    console.log("Background removed successfully");

    return NextResponse.json({
      success: true,
      mode: "hybrid",
      cleanedImageUrl: bgRemovedUrl,
      originalImageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Segment API error:", error);
    return NextResponse.json(
      {
        error: "Segmentation failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasToken = !!REPLICATE_API_TOKEN;
  return NextResponse.json({
    message: "Segment API",
    replicateConfigured: hasToken,
    tokenPreview: hasToken ? `${REPLICATE_API_TOKEN?.slice(0, 5)}...` : "not set",
  });
}
