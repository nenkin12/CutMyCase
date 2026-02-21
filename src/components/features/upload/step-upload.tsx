"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X } from "lucide-react";
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

export function StepUpload({ onComplete }: StepUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
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
    if (!file || !preview) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get image dimensions first
      const img = new window.Image();
      img.src = preview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      let imageUrl = preview;
      let uploadId = `local_${Date.now()}`;

      try {
        // Upload via server-side API (bypasses CORS)
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/firebase", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.imageUrl;
          uploadId = data.uploadId;
        } else {
          console.log("Server upload failed, using local preview");
        }
      } catch (uploadError) {
        // Upload failed - use base64 data URL as fallback
        console.log("Upload failed, using local preview:", uploadError);
      }

      onComplete({
        uploadId,
        imageUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
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
              className="w-full max-h-[400px] object-contain"
            />
            <button
              onClick={clearFile}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <ImageIcon className="w-4 h-4" />
            <span>{file?.name}</span>
            <span className="text-text-muted">
              ({(file?.size! / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-[4px] text-error text-sm">
          {error}
        </div>
      )}

      <div className="bg-carbon rounded-[4px] p-4 space-y-2">
        <h4 className="font-medium text-sm">Tips for best results:</h4>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• Lay items flat on a contrasting background</li>
          <li>• Include a reference object (quarter, ruler, or credit card)</li>
          <li>• Ensure good lighting with minimal shadows</li>
          <li>• Keep camera parallel to the surface (top-down view)</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          isLoading={isUploading}
          size="lg"
        >
          {isUploading ? "Uploading..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
