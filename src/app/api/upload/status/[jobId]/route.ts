import { NextRequest, NextResponse } from "next/server";
import { imageProcessingQueue } from "@/lib/queue";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await imageProcessingQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const state = await job.getState();
    const progress = job.progress;

    let status: {
      state: string;
      progress: unknown;
      error?: string;
      result?: unknown;
    } = {
      state,
      progress,
    };

    if (state === "completed") {
      status.result = job.returnvalue;
    } else if (state === "failed") {
      status.error = job.failedReason;
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 500 }
    );
  }
}
