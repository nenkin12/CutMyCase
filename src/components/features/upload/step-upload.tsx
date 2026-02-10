"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get presigned URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignedRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key, publicUrl, uploadId } = await presignedRes.json();

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      // Get image dimensions
      const img = new window.Image();
      img.src = preview!;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      onComplete({
        uploadId,
        imageUrl: publicUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
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
        <h2 className="text-3xl font-heading mb-2">Upload Your Gear Photo</h2>
        <p className="text-text-secondary">
          Take a top-down photo of your equipment laid out on a flat surface
        </p>
      </div>

      {!preview ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-[4px] p-12 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 text-accent mx-auto mb-4" />
          <p className="text-lg mb-2">
            {isDragActive ? "Drop your image here" : "Drag & drop your gear photo"}
          </p>
          <p className="text-text-muted text-sm">
            or click to browse (PNG, JPG, WEBP up to 20MB)
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
