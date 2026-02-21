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

export function StepUpload({ onComplete }: StepUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState(0);

  // Animate progress during upload
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
    if (!file || !preview) return;

    setIsUploading(true);
    setError(null);

    try {
      const img = new window.Image();
      img.src = preview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      let imageUrl = preview;
      let uploadId = `local_${Date.now()}`;

      try {
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
        }
      } catch (uploadError) {
        console.log("Upload failed, using local preview:", uploadError);
      }

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

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
            {/* Image */}
            <img
              src={preview}
              alt="Preview"
              className={cn(
                "w-full max-h-[400px] object-contain transition-all duration-300",
                isUploading && "brightness-50"
              )}
            />

            {/* AI Processing Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Scanning line effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
                    style={{
                      top: `${(uploadProgress % 100)}%`,
                      boxShadow: '0 0 20px 5px rgba(255, 77, 0, 0.5)',
                      animation: 'scan 2s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
                    style={{
                      top: `${(uploadProgress + 30) % 100}%`,
                      animation: 'scan 2.5s ease-in-out infinite reverse',
                    }}
                  />
                </div>

                {/* Grid overlay */}
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

                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-accent" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-accent" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-accent" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-accent" />

                {/* Center content */}
                <div className="relative z-10 text-center px-4">
                  {/* Animated icon */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 animate-ping">
                      <CurrentPhaseIcon className="w-12 h-12 mx-auto text-accent opacity-30" />
                    </div>
                    <CurrentPhaseIcon className="w-12 h-12 mx-auto text-accent animate-pulse" />
                  </div>

                  {/* Progress percentage */}
                  <div className="text-4xl font-heading text-accent mb-2">
                    {Math.round(uploadProgress)}%
                  </div>

                  {/* Phase text */}
                  <div className="text-sm text-white font-medium mb-4">
                    {UPLOAD_PHASES[uploadPhase].text}
                  </div>

                  {/* Progress bar */}
                  <div className="w-48 mx-auto h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-orange-400 transition-all duration-150 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-accent rounded-full animate-float"
                      style={{
                        left: `${20 + i * 15}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: `${2 + i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Close button (hidden during upload) */}
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

      {/* Custom animations */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(100%) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(80%) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(20%) scale(1);
          }
          100% {
            transform: translateY(0%) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
