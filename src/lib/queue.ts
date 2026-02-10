import { Queue } from "bullmq";
import { redis } from "./redis";

export const imageProcessingQueue = new Queue("image-processing", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export interface ImageProcessingJobData {
  uploadId: string;
  imageUrl: string;
  calibration?: {
    method: "reference" | "manual";
    pixelsPerInch?: number;
    referenceObject?: string;
    referenceSize?: number;
  };
}

export async function addImageProcessingJob(data: ImageProcessingJobData) {
  return imageProcessingQueue.add("process-image", data, {
    priority: 1,
  });
}
