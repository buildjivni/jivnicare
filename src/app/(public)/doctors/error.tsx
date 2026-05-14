"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Doctors Route Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Unable to load doctors</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        We encountered an error while fetching the doctor list.
      </p>
      <Button 
        onClick={() => reset()}
        className="mt-4 bg-primary hover:bg-primary/90 rounded-xl font-semibold"
      >
        Try again
      </Button>
    </div>
  );
}
