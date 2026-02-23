"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X, Cpu, Sparkles, RotateCw, AlertCircle, CheckCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepUploadProps {
  onComplete: (data: {
    uploadId: string;
    imageUrl: string;
    width: number;
    height: number;
  }) => void;
  onSkipToLayout?: () => void;
}

const UPLOAD_PHASES = [
  { text: "Initializing AI systems...", icon: Cpu },
  { text: "Analyzing image data...", icon: Sparkles },
  { text: "Processing pixels...", icon: Cpu },
  { text: "Preparing for detection...", icon: Sparkles },
];

const MAX_IMAGE_SIZE = 2500; // Max dimension in pixels - maintains accuracy for detection

// Resize and optionally rotate image on client
async function resizeImage(file: File, rotation: number = 0): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Swap dimensions if rotating 90 or 270 degrees
      const isRotated90or270 = rotation === 90 || rotation === 270;
      let finalWidth = isRotated90or270 ? height : width;
      let finalHeight = isRotated90or270 ? width : height;

      // Only resize if larger than max
      if (finalWidth > MAX_IMAGE_SIZE || finalHeight > MAX_IMAGE_SIZE) {
        if (finalWidth > finalHeight) {
          finalHeight = Math.round((finalHeight * MAX_IMAGE_SIZE) / finalWidth);
          finalWidth = MAX_IMAGE_SIZE;
        } else {
          finalWidth = Math.round((finalWidth * MAX_IMAGE_SIZE) / finalHeight);
          finalHeight = MAX_IMAGE_SIZE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Apply rotation
      ctx.save();
      ctx.translate(finalWidth / 2, finalHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate scaled dimensions for drawing
      let drawWidth = isRotated90or270 ? finalHeight : finalWidth;
      let drawHeight = isRotated90or270 ? finalWidth : finalHeight;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width: finalWidth, height: finalHeight });
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

export function StepUpload({ onComplete, onSkipToLayout }: StepUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [showRulesModal, setShowRulesModal] = useState(true);

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

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
      // Resize and rotate image
      console.log("Processing image with rotation:", rotation);
      const { blob, width, height } = await resizeImage(file, rotation);
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
    setRotation(0);
  };

  const CurrentPhaseIcon = UPLOAD_PHASES[uploadPhase].icon;

  return (
    <div className="space-y-6">
      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#1a1a1a] border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-heading">Important: Upload Rules</h3>
            </div>

            <p className="text-text-secondary mb-4">
              Please read these guidelines to ensure accurate detection:
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span className="text-sm">Lay items flat on a contrasting background (white or solid color)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span className="text-sm">Include a reference object (quarter, ruler, or credit card) for accurate sizing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span className="text-sm">Ensure good, even lighting with minimal shadows</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span className="text-sm">Keep camera parallel to the surface (top-down view)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span className="text-sm">Leave space between items so they don&apos;t touch</span>
              </li>
            </ul>

            <Button
              onClick={() => setShowRulesModal(false)}
              className="w-full"
            >
              I Understand
            </Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading mb-2">Upload Your Gear Photo</h2>
        <p className="text-text-secondary text-sm sm:text-base">
          Take a top-down photo of your equipment laid out on a flat surface
        </p>
      </div>

      {/* Tips Section - Above Upload */}
      {!preview && !isUploading && (
        <div className="bg-carbon rounded-[4px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Tips for best results:</h4>
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              Read full guidelines
            </button>
          </div>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Lay items flat on a contrasting background</li>
            <li>• Include a reference object (quarter, ruler, or credit card)</li>
            <li>• Ensure good lighting with minimal shadows</li>
            <li>• Keep camera parallel to the surface (top-down view)</li>
          </ul>
        </div>
      )}

      {!preview ? (
        <div className="space-y-4">
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

          {/* Start from Scratch Option */}
          {onSkipToLayout && (
            <div className="text-center">
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-text-muted text-sm">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={onSkipToLayout}
                className="inline-flex items-center gap-2 px-6 py-3 bg-carbon border border-border rounded-[4px] text-text-secondary hover:text-white hover:border-accent/50 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Start from Scratch</span>
              </button>
              <p className="text-text-muted text-xs mt-2">
                Build your layout using shapes and presets without scanning
              </p>
            </div>
          )}
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
              style={{ transform: `rotate(${rotation}deg)` }}
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
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={rotateImage}
                  className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={clearFile}
                  className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
