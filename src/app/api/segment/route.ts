import { NextRequest, NextResponse } from "next/server";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function POST(request: NextRequest) {
  console.log("Segment API called");

  try {
    const body = await request.json();
    const { imageUrl, predictionId } = body;

    // If predictionId provided, check status (polling mode)
    if (predictionId) {
      console.log("Polling prediction:", predictionId);

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { "Authorization": `Bearer ${REPLICATE_API_TOKEN}` },
        }
      );

      if (!pollResponse.ok) {
        const error = await pollResponse.json();
        console.error("Poll error:", error);
        return NextResponse.json(
          { error: "Failed to check prediction status" },
          { status: 500 }
        );
      }

      const result = await pollResponse.json();
      console.log("Prediction status:", result.status);

      if (result.status === "succeeded") {
        return NextResponse.json({
          success: true,
          status: "completed",
          cleanedImageUrl: result.output,
          originalImageUrl: imageUrl,
        });
      } else if (result.status === "failed") {
        return NextResponse.json(
          { error: `Prediction failed: ${result.error}` },
          { status: 500 }
        );
      } else {
        // Still processing
        return NextResponse.json({
          success: true,
          status: "processing",
          predictionId: result.id,
        });
      }
    }

    // New prediction request
    console.log("Image URL type:", imageUrl?.startsWith("data:") ? "base64" : imageUrl?.startsWith("blob:") ? "blob" : "url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    // Check if it's a blob URL (which won't work)
    if (imageUrl.startsWith("blob:")) {
      return NextResponse.json(
        { error: "Blob URLs are not supported. Image must be uploaded to Firebase first." },
        { status: 400 }
      );
    }

    // Check if Replicate token is configured
    if (!REPLICATE_API_TOKEN) {
      console.log("REPLICATE_API_TOKEN not configured");
      return NextResponse.json({
        success: true,
        status: "completed",
        mode: "passthrough",
        cleanedImageUrl: imageUrl,
        originalImageUrl: imageUrl,
        message: "Background removal skipped - Replicate API not configured",
      });
    }

    console.log("Creating Replicate prediction for background removal...");

    // Create prediction (don't wait for it to complete)
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1", // lucataco/remove-bg
        input: { image: imageUrl },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error("Replicate create error:", error);
      return NextResponse.json(
        { error: `Replicate API error: ${JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    const prediction = await createResponse.json();
    console.log("Created prediction:", prediction.id, "status:", prediction.status);

    // If already completed (unlikely but possible for cached results)
    if (prediction.status === "succeeded") {
      return NextResponse.json({
        success: true,
        status: "completed",
        cleanedImageUrl: prediction.output,
        originalImageUrl: imageUrl,
      });
    }

    // Return prediction ID for client to poll
    return NextResponse.json({
      success: true,
      status: "processing",
      predictionId: prediction.id,
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
