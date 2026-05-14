"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 mb-8 text-center max-w-sm">
        We encountered an unexpected error. Please try again.
      </p>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={reset}
          className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 font-bold text-white flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200 text-slate-700 flex items-center gap-2">
            <Home className="w-4 h-4" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
