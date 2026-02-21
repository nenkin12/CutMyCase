import { NextRequest, NextResponse } from "next/server";
import { detectCalibrationReference } from "@/lib/ai/process-image";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    const calibration = await detectCalibrationReference(imageUrl);

    console.log("Calibration result:", JSON.stringify(calibration, null, 2));

    return NextResponse.json({ calibration });
  } catch (error) {
    console.error("Calibration error:", error);
    return NextResponse.json(
      { error: "Failed to detect calibration reference" },
      { status: 500 }
    );
  }
}
