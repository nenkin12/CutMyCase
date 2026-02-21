"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepUploadProps {
  onComplete: (data: {
    uploadId: string;
    imageUrl: string;
    width: number;
    height: number;
  }) => void;
}

const UPLOAD_PHASES = [
  { text: "Initializing AI systems...", icon: Cpu },
  { text: "Analyzing image data...", icon: Sparkles },
  { text: "Processing pixels...", icon: Cpu },
  { text: "Preparing for detection...", icon: Sparkles },
];

const MAX_IMAGE_SIZE = 2500; // Max dimension in pixels - maintains accuracy for detection

// Resize image on client to reduce upload size
async function resizeImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than max
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        } else {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error("Could not create blob"));
          }
        },
        "image/jpeg",
        0.92 // High quality for accurate detection
      );
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function StepUpload({ onComplete }: StepUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState(0);

  useEffect(() => {
    if (!isUploading) {
      setUploadProgress(0);
      setUploadPhase(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8;
      });
    }, 150);

    const phaseInterval = setInterval(() => {
      setUploadPhase(prev => (prev + 1) % UPLOAD_PHASES.length);
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, [isUploading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Resize image first
      console.log("Resizing image...");
      const { blob, width, height } = await resizeImage(file);
      console.log(`Resized to ${width}x${height}, size: ${(blob.size / 1024).toFixed(0)}KB`);

      // Upload resized image via server to Firebase
      const formData = new FormData();
      formData.append("file", blob, file.name);

      const response = await fetch("/api/upload/firebase", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Server upload failed:", errText);
        throw new Error("Failed to upload image to server. Please try again.");
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;
      const uploadId = data.uploadId;
      console.log("Uploaded to Firebase:", imageUrl);

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      onComplete({
        uploadId,
        imageUrl,
        width,
        height,
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const CurrentPhaseIcon = UPLOAD_PHASES[uploadPhase].icon;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading mb-2">Upload Your Gear Photo</h2>
        <p className="text-text-secondary text-sm sm:text-base">
          Take a top-down photo of your equipment laid out on a flat surface
        </p>
      </div>

      {!preview ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-[4px] p-8 sm:p-12 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-accent mx-auto mb-4" />
          <p className="text-base sm:text-lg mb-2">
            {isDragActive ? "Drop your image here" : "Tap to upload or drag & drop"}
          </p>
          <p className="text-text-muted text-xs sm:text-sm">
            PNG, JPG, WEBP up to 20MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-carbon rounded-[4px] overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className={cn(
                "w-full max-h-[400px] object-contain transition-all duration-300",
                isUploading && "brightness-50"
              )}
            />

            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
                    style={{
                      top: `${(uploadProgress % 100)}%`,
                      boxShadow: '0 0 20px 5px rgba(255, 77, 0, 0.5)',
                    }}
                  />
                </div>

                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,77,0,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,77,0,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px',
                  }}
                />

                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-accent" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-accent" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-accent" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-accent" />

                <div className="relative z-10 text-center px-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 animate-ping">
                      <CurrentPhaseIcon className="w-12 h-12 mx-auto text-accent opacity-30" />
                    </div>
                    <CurrentPhaseIcon className="w-12 h-12 mx-auto text-accent animate-pulse" />
                  </div>

                  <div className="text-4xl font-heading text-accent mb-2">
                    {Math.round(uploadProgress)}%
                  </div>

                  <div className="text-sm text-white font-medium mb-4">
                    {UPLOAD_PHASES[uploadPhase].text}
                  </div>

                  <div className="w-48 mx-auto h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-orange-400 transition-all duration-150 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!isUploading && (
              <button
                onClick={clearFile}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!isUploading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <ImageIcon className="w-4 h-4" />
              <span>{file?.name}</span>
              <span className="text-text-muted">
                ({(file?.size! / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-[4px] text-error text-sm">
          {error}
        </div>
      )}

      {!isUploading && (
        <div className="bg-carbon rounded-[4px] p-4 space-y-2">
          <h4 className="font-medium text-sm">Tips for best results:</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Lay items flat on a contrasting background</li>
            <li>• Include a reference object (quarter, ruler, or credit card)</li>
            <li>• Ensure good lighting with minimal shadows</li>
            <li>• Keep camera parallel to the surface (top-down view)</li>
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          size="lg"
        >
          {isUploading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
