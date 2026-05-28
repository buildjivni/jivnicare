"use client";

import { useRef, useState } from "react";
import { Upload, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { ImageCropperModal } from "./ImageCropperModal";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  filenamePrefix: string;
  className?: string;
  aspectRatio?: number; // Added for cropping
}

export function ImageUploadField({
  label,
  value,
  onChange,
  filenamePrefix,
  className,
  aspectRatio = 1, // Default square
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cropper State
  const [rawImageUrlToCrop, setRawImageUrlToCrop] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // 1. Validate File Type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG, or WebP).");
      return;
    }

    // 2. Validate File Size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    // Pass to cropper
    const objectUrl = URL.createObjectURL(file);
    setRawImageUrlToCrop(objectUrl);
  };

  const uploadCroppedBlob = async (blob: Blob) => {
    setIsUploading(true);
    setError(null);
    try {
      const filename = `${filenamePrefix}-${Date.now()}.webp`;
      const res = await fetch(
        `/api/upload?filename=${encodeURIComponent(filename)}`,
        {
          method: "POST",
          body: blob,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }
      onChange(data.url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (rawImageUrlToCrop) {
        URL.revokeObjectURL(rawImageUrlToCrop);
        setRawImageUrlToCrop(null);
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {value ? (
          <img
            src={value}
            alt={label}
            className={cn(
              "rounded-xl object-cover border border-slate-200 shrink-0",
              aspectRatio === 1 ? "w-20 h-20" : "w-32 h-20"
            )}
          />
        ) : (
          <div className={cn(
            "rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center shrink-0",
            aspectRatio === 1 ? "w-20 h-20" : "w-32 h-20"
          )}>
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="h-10 rounded-xl font-bold text-xs"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Uploading...
              </>
            ) : value ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Replace Image
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Upload Image
              </>
            )}
          </Button>
          {error && <p className="text-[10px] font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}
        </div>
      </div>

      {rawImageUrlToCrop && (
        <ImageCropperModal
          isOpen={true}
          onClose={() => {
            URL.revokeObjectURL(rawImageUrlToCrop);
            setRawImageUrlToCrop(null);
          }}
          imageUrl={rawImageUrlToCrop}
          aspectRatio={aspectRatio}
          onCropComplete={uploadCroppedBlob}
        />
      )}
    </div>
  );
}
