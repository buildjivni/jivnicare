"use client";

import { TokenCard } from "./TokenCard";
import {
  markArrived,
  requestPayment,
  approvePayment,
  callPatient,
  startConsultation,
  completeConsultation,
  markNoShow,
} from "@/lib/queue-actions";

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

interface QueueWorkflowProps {
  tokens: Token[];
  collectPayment: boolean; // from ClinicOperations
  onRefresh: () => void;
}

// Column config
const COLUMNS = [
  { key: "WAITING", label: "Waiting", color: "zinc" },
  { key: "AWAITING_ARRIVAL", label: "Arrived", color: "blue" },
  { key: "PAYMENT_PENDING", label: "Payment", color: "yellow" },
  { key: "READY", label: "Ready", color: "green" },
  { key: "CALLED", label: "Called", color: "purple" },
  { key: "IN_CONSULTATION", label: "Consulting", color: "indigo" },
] as const;

const COLOR_MAP: Record<string, string> = {
  zinc: "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
  blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  yellow: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  green: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  purple: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
  indigo: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800",
};

export function QueueWorkflow({
  tokens,
  collectPayment,
  onRefresh,
}: QueueWorkflowProps) {
  // Filter tokens per column
  function tokensFor(status: string) {
    return tokens
      .filter((t) => t.status === status)
      .sort((a, b) => a.tokenNumber - b.tokenNumber);
  }

  // Action factory per status
  function getAction(token: Token) {
    switch (token.status) {
      case "WAITING":
        return {
          action: {
            label: "Mark Arrived",
            onClick: () => markArrived(token.id),
          },
        };
      case "AWAITING_ARRIVAL":
        return {
          action: {
            label: collectPayment ? "Request Payment" : "Move to Ready",
            onClick: () => requestPayment(token.id),
          },
        };
      case "PAYMENT_PENDING":
        return {
          action: {
            label: "Approve Payment ✓",
            onClick: () => approvePayment(token.id),
          },
        };
      case "READY":
        return {
          action: {
            label: "Call Patient →",
            onClick: () => callPatient(token.id),
          },
        };
      case "CALLED":
        return {
          action: {
            label: "Start Consultation",
            onClick: () => startConsultation(token.id),
          },
        };
      case "IN_CONSULTATION":
        return {
          action: {
            label: "Complete ✓",
            onClick: () => completeConsultation(token.id),
          },
          secondaryAction: {
            label: "No Show",
            onClick: () => markNoShow(token.id),
          },
        };
      default:
        return { action: { label: "—", onClick: async () => ({ success: true }) } };
    }
  }

  // Hide PAYMENT_PENDING column if clinic doesn't collect payment
  const visibleColumns = collectPayment
    ? COLUMNS
    : COLUMNS.filter((c) => c.key !== "PAYMENT_PENDING");

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-3 min-w-max"
        style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 200px)` }}
      >
        {visibleColumns.map((col) => {
          const colTokens = tokensFor(col.key);
          return (
            <div
              key={col.key}
              className={`rounded-xl border p-3 ${COLOR_MAP[col.color]}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {col.label}
                </span>
                <span className="text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-full px-2 py-0.5">
                  {colTokens.length}
                </span>
              </div>

              {/* Token cards */}
              <div className="flex flex-col gap-2">
                {colTokens.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">
                    —
                  </p>
                ) : (
                  colTokens.map((token) => {
                    const { action, secondaryAction } = getAction(token);
                    return (
                      <TokenCard
                        key={token.id}
                        token={token}
                        action={action}
                        secondaryAction={secondaryAction}
                        onSuccess={onRefresh}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
