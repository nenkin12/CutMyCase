import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { db } from "@/lib/db";
import { traceOutlines, convertPercentToInches } from "@/lib/ai/process-image";
import { exportOutlinesToFiles } from "@/lib/cnc/export-dxf";
import type { ImageProcessingJobData } from "@/lib/queue";

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

async function processImage(job: Job<ImageProcessingJobData>) {
  const { uploadId, imageUrl, calibration } = job.data;

  try {
    // Update progress
    await job.updateProgress({ stage: "tracing", percent: 10 });

    // Get image dimensions (would need to fetch and analyze)
    // For now, use placeholder
    const imageWidth = 1920;
    const imageHeight = 1080;
    const pixelsPerInch = calibration?.pixelsPerInch || 72;

    // Trace outlines using AI
    await job.updateProgress({ stage: "tracing", percent: 30 });
    const outlines = await traceOutlines(imageUrl);

    // Convert to real-world dimensions
    await job.updateProgress({ stage: "generating", percent: 60 });
    const convertedOutlines = outlines.outlines.map((outline) => ({
      ...outline,
      outerPath: convertPercentToInches(
        outline.outerPath,
        imageWidth,
        imageHeight,
        pixelsPerInch
      ),
      innerPaths: outline.innerPaths.map((inner) => ({
        ...inner,
        points: convertPercentToInches(
          inner.points,
          imageWidth,
          imageHeight,
          pixelsPerInch
        ),
      })),
    }));

    // Generate and export cut files
    await job.updateProgress({ stage: "generating", percent: 80 });
    const exportResult = await exportOutlinesToFiles(
      convertedOutlines,
      uploadId
    );

    // Update database
    await job.updateProgress({ stage: "completing", percent: 90 });
    await db.upload.update({
      where: { id: uploadId },
      data: {
        status: "PROCESSED",
        outlineDxfUrl: exportResult.dxfUrl,
        outlineDxfKey: exportResult.dxfKey,
        outlineSvgUrl: exportResult.svgUrl,
        width: exportResult.bounds.width,
        height: exportResult.bounds.height,
        gearDetails: JSON.parse(JSON.stringify(outlines)),
      },
    });

    await job.updateProgress({ stage: "completed", percent: 100 });

    return {
      outlines: { outlines: convertedOutlines },
      dxfUrl: exportResult.dxfUrl,
      svgUrl: exportResult.svgUrl,
      bounds: exportResult.bounds,
    };
  } catch (error) {
    console.error("Processing error:", error);

    // Update upload status to failed
    await db.upload.update({
      where: { id: uploadId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}

// Create worker
const worker = new Worker<ImageProcessingJobData>(
  "image-processing",
  processImage,
  {
    connection: redis,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Image processing worker started");

export default worker;
