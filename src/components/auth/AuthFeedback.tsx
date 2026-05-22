"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
      aria-hidden="true"
    />
  );
}

interface StatusMessageProps {
  type: "error" | "success" | "info" | "warning";
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function StatusMessage({ type, message, className, onDismiss }: StatusMessageProps) {
  const config = {
    error: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-800",
      icon: AlertCircle,
      iconColor: "text-red-500",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-800",
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-800",
      icon: AlertCircle,
      iconColor: "text-blue-500",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-800",
      icon: AlertCircle,
      iconColor: "text-amber-500",
    },
  };

  const { bg, border, text, icon: Icon, iconColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        bg,
        border,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColor)} aria-hidden="true" />
      <p className={cn("text-sm font-medium leading-relaxed", text)}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn("ml-auto flex-shrink-0 p-1 rounded hover:bg-black/5", text)}
          aria-label="Dismiss message"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading form">
      <div className="text-center space-y-3">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

interface ConnectionStatusProps {
  isOnline: boolean;
}

export function ConnectionStatus({ isOnline }: ConnectionStatusProps) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>You&apos;re offline</span>
    </motion.div>
  );
}

interface ResendTimerProps {
  seconds: number;
  canResend: boolean;
  onResend: () => void;
  isLoading?: boolean;
}

export function ResendTimer({ seconds, canResend, onResend, isLoading }: ResendTimerProps) {
  return (
    <div className="text-center">
      {canResend ? (
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Resend Code</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-slate-500">Resend code in</span>
          <motion.span
            key={seconds}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700"
          >
            {seconds}
          </motion.span>
        </div>
      )}
    </div>
  );
}

interface SuccessCheckmarkProps {
  message?: string;
}

export function SuccessCheckmark({ message = "Success!" }: SuccessCheckmarkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-slate-900"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
