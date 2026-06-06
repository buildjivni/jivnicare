"use client";

import { useState } from "react";

interface Token {
  id: string;
  tokenNumber: number;
  status: string;
  source: "ONLINE" | "WALK_IN";
  isEmergency: boolean;
  patientLocation?: string;
  arrivedAt?: string;
  paymentApprovedAt?: string;
  calledAt?: string;
  user?: { name?: string; phone?: string } | null;
  walkInEntry?: { patientName?: string; phoneNumber?: string } | null;
}

interface TokenCardProps {
  token: Token;
  action: {
    label: string;
    variant?: "default" | "destructive" | "outline";
    onClick: () => Promise<{ success: boolean; error?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => Promise<{ success: boolean; error?: string }>;
  };
  onSuccess: () => void;
}

export function TokenCard({
  token,
  action,
  secondaryAction,
  onSuccess,
}: TokenCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patientName =
    token.user?.name ??
    token.walkInEntry?.patientName ??
    "Patient";

  const patientPhone =
    token.user?.phone ??
    token.walkInEntry?.phoneNumber ??
    null;

  async function handleAction(
    fn: () => Promise<{ success: boolean; error?: string }>
  ) {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`
        rounded-lg border p-3 bg-white dark:bg-zinc-900
        ${token.isEmergency ? "border-red-400 bg-red-50 dark:bg-red-950" : "border-zinc-200 dark:border-zinc-700"}
      `}
    >
      {/* Token number + emergency badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          #{token.tokenNumber}
        </span>
        <div className="flex gap-1">
          {token.isEmergency && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-medium">
              Emergency
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {token.source === "WALK_IN" ? "Walk-in" : "Online"}
          </span>
        </div>
      </div>

      {/* Patient info */}
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
        {patientName}
      </p>
      {patientPhone && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          {patientPhone}
        </p>
      )}
      {token.patientLocation && (
        <p className="text-xs text-zinc-400 mb-2">📍 {token.patientLocation}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}

      {/* Primary action */}
      <button
        disabled={loading}
        onClick={() => handleAction(action.onClick)}
        className={`
          w-full text-sm py-1.5 rounded-md font-medium transition-opacity
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
          ${
            action.variant === "destructive"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          }
        `}
      >
        {loading ? "..." : action.label}
      </button>

      {/* Secondary action */}
      {secondaryAction && (
        <button
          disabled={loading}
          onClick={() => handleAction(secondaryAction.onClick)}
          className="w-full mt-1.5 text-sm py-1.5 rounded-md font-medium border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
