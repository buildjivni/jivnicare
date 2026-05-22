"use client";

import { useRef, useState } from "react";
import { Upload, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  filenamePrefix: string;
  className?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  filenamePrefix,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${filenamePrefix}-${Date.now()}-${safeName}`;
      const res = await fetch(
        `/api/upload?filename=${encodeURIComponent(filename)}`,
        {
          method: "POST",
          body: file,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
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
            className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center shrink-0">
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
              if (file) handleFile(file);
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
          {value && (
            <p className="text-[10px] text-slate-400 truncate max-w-full">{value}</p>
          )}
          {error && <p className="text-[10px] font-bold text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
