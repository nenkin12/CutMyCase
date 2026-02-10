import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addImageProcessingJob } from "@/lib/queue";

export async function POST(request: NextRequest) {
  try {
    const { uploadId, imageUrl, pixelsPerInch } = await request.json();

    if (!uploadId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify upload exists
    const upload = await db.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    // Update upload status
    await db.upload.update({
      where: { id: uploadId },
      data: {
        status: "PROCESSING",
        pixelsPerInch,
        calibrationMethod: pixelsPerInch ? "manual" : undefined,
      },
    });

    // Add job to queue
    const job = await addImageProcessingJob({
      uploadId,
      imageUrl,
      calibration: pixelsPerInch
        ? { method: "manual", pixelsPerInch }
        : undefined,
    });

    return NextResponse.json({
      jobId: job.id,
      uploadId,
    });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: "Failed to start processing" },
      { status: 500 }
    );
  }
}
