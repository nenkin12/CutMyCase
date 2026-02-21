import { NextRequest, NextResponse } from "next/server";
import { analyzeGear, traceOutlines } from "@/lib/ai/process-image";

// Simple test endpoint that accepts an image URL and runs detection
// No database or S3 required - just Anthropic API key
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, action = "analyze" } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl parameter" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid imageUrl - must be a valid URL" },
        { status: 400 }
      );
    }

    if (action === "analyze") {
      // Run gear analysis (detect items)
      const analysis = await analyzeGear(imageUrl);
      return NextResponse.json({
        success: true,
        action: "analyze",
        result: analysis,
      });
    } else if (action === "outline") {
      // Run outline tracing
      const outlines = await traceOutlines(imageUrl);
      return NextResponse.json({
        success: true,
        action: "outline",
        result: outlines,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action - must be 'analyze' or 'outline'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Test detect error:", error);
    return NextResponse.json(
      { error: "Detection failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "Test endpoint for gun/gear detection",
    usage: {
      method: "POST",
      body: {
        imageUrl: "URL to an image of firearms/gear",
        action: "analyze | outline (optional, default: analyze)",
      },
    },
    example: {
      imageUrl: "https://example.com/gun-photo.jpg",
      action: "analyze",
    },
  });
}
